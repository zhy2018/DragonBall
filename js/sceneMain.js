var sceneMain = cc.Scene.extend({
	onEnter: function() {
		this._super();

// layer: {
// 	floor: {},
// 	bg: {},
// 	ui: {},
// 	stage: {},
// 	fight: {},
// 	info: {},
// 	mask: {},
// },
		// 初始化所有图层

		// 底层
		var floor = cc.LayerColor.create();
		this.addChild(floor);
		control.layer.floor = floor;
		// 背景层
		var bg = cc.Layer.create();
		this.addChild(bg);
		control.layer.bg = bg;
		funcInitBg();

		// ui层
		var ui = cc.LayerColor.create(funcColor('#000000'), 0, 0);
		this.addChild(ui);
		control.layer.ui = ui;
		funcInitUI();
		funcUpdateUI();

		// 舞台层
		var stage = cc.LayerColor.create(cc.color(255, 0, 0, 0));
		this.addChild(stage);
		control.layer.stage = stage;
		funcInitStage();

		// // 人物层, 包含了小英雄和坏蛋们
		// var layerFighter = cc.Layer.create();
		// layerFight.addChild(layerFighter);
		// // 小英雄
		// var hero = cc.Sprite.create(res.action, cc.rect(0, 0, 32, 40));
		// hero.attr({
		// 	x: w / 2 / scale,
		// 	anchorY: 0,
		// });
		// layerFighter.addChild(hero);
		// var aniStand = cc.Animation.create();
		// for (var i = 0; i < 8; i += 1) {
		// 	var frame = cc.SpriteFrame.create(res.action, cc.rect(i * 32, 0, 32, 40));
		// 	aniStand.addSpriteFrame(frame);
		// }
		// aniStand.setDelayPerUnit(0.1);
		// hero.runAction(cc.repeatForever(cc.animate(aniStand)));

		// // 消息层
		// var layerInfo = cc.Layer.create();
		// control.layerScene.addChild(layerInfo);

		// // 蒙层
		// var mask = cc.LayerColor.create(funcColor('#ffffff'), w, h);
		// this.addChild(mask);

		// var sprite;
		// mask.runAction(cc.FadeOut.create(0.5));
		// mask.scheduleOnce(function() {
		// 	sprite = cc.Sprite.create(res.sprite, cc.rect(0, 220, 117, 36));
		// 	sprite.attr({
		// 		x: w / 2,
		// 		y: h / 2,
		// 		scale: scale,
		// 	});
		// 	layerInfo.addChild(sprite);
		// }, 0.5);
		// mask.scheduleOnce(function() {
		// 	sprite.setTextureRect(cc.rect(120, 220, 65, 35));
		// }, 1);
		// mask.scheduleOnce(function() {
		// 	layerInfo.removeAllChildren();
		// 	control.acceptTouch = true;
		// }, 1.5);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeListener(cc.EventListener.TOUCH_ONE_BY_ONE);
	},
});

// 初始化背景层
function funcInitBg() {
	var data = control.stageData[control.stageNum].scene[control.sceneNum];
	var color = data.bgColor;
	document.body.style.backgroundColor = color;
	control.layer.floor.color = funcColor(color);

	var rect = data.bgRect;
	var w = control.winWidth, h = control.winHeight;
	var scale = w / rect[2];
	scale = scale.toFixed(3) - 0;
	control.layer.bg.attr({
		y: h,
		anchorX: 0,
		anchorY: 0,
		scale: scale,
	});

	var bg0 = cc.Sprite.create(res.bg, cc.rect(rect[0], rect[1], rect[2], rect[3]));
	bg0.attr({
		anchorX: 0,
		anchorY: 1,
	});
	control.layer.bg.addChild(bg0);

	if (data.autoScroll) {
		bg0.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(-bg0.width, 0)),
			cc.moveTo(0, cc.p(0, 0))
		)));
		var bg1 = cc.Sprite.create(res.bg, cc.rect(rect[0], rect[1], rect[2], rect[3]));
		bg1.attr({
			x: bg0.width,
			anchorX: 0,
			anchorY: 1,
		});
		control.layer.bg.addChild(bg1);
		bg1.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(0, 0)),
			cc.moveTo(0, cc.p(bg0.width, 0))
		)));
	}
}

// 初始化小英雄的血槽, 防御槽和气槽
function funcInitUI() {
	var data = control.stageData[control.stageNum];
	var hero = game.hero;
	hero.hpFull = data.hpFull || config.hpLimit;
	hero.mpFull = data.mpFull || config.mpLimit;
	hero.dpFull = config.dpLimit;
	hero.hp = 0; // data.hp || hero.hpFull;
	hero.mp = 0; // data.mp || hero.mpFull;
	hero.dp = 0; // config.dpLimit;
	var w = control.winWidth, h = control.winHeight;
	var scale = w / 2.5 / 112;
	scale = scale.toFixed(3) - 0;
	control.scaleUI = scale;

	control.layer.ui.attr({
		y: h,
		scale: scale,
	});

	var layerHP = cc.Layer.create();
	layerHP.attr({ y: 32 });
	control.layer.ui.addChild(layerHP);

	var hpUI = cc.Sprite.create(res.sprite, cc.rect(0, 64, 112, 32));
	hpUI.attr({
		anchorX: 0,
		anchorY: 1,
	});
	layerHP.addChild(hpUI);

	for (var i = 116; i <= 140; i += 8) {
		var hpBar = cc.Sprite.create(res.sprite, cc.rect(i, 81, 1, 6));
		hpBar.attr({
			x: 32,
			y: -23,
			anchorX: 0,
			anchorY: 0,
			scaleX: 0,
		});
		layerHP.addChild(hpBar);
	}

	var dp = cc.LayerColor.create(funcColor('#00e800'), 0, 2);
	dp.attr({ x: 32, y: -28 });
	layerHP.addChild(dp);

	var name = cc.LabelTTF.create(hero.name, '黑体', 16);
	name.attr({
		x: 32,
		y: -1,
		anchorX: 0,
		anchorY: 1,
		lineWidth: 1,
		strokeStyle: cc.color(0, 0, 0, 255),
	});
	layerHP.addChild(name);
	layerHP.runAction(cc.moveTo(0.5, cc.p(0, 0)));

	var layerMP = cc.Layer.create();
	layerMP.attr({ y: -32 });
	control.layer.ui.addChild(layerMP);

	var mpUI = cc.Sprite.create(res.sprite, cc.rect(2, 98, 20, 19));
	mpUI.attr({
		x: 8,
		y: -(h - w - 19 * scale - 8) / scale,
		anchorX: 0,
		anchorY: 1,
	});
	layerMP.addChild(mpUI);

	var x0 = 27;
	var ii = hero.mpFull / 8;
	for (var i = 0; i < ii; i += 1) {
		var mpLoader = cc.Sprite.create(res.sprite, cc.rect(24, 106, 16, 8));
		mpLoader.attr({
			x: 16 * i + x0,
			y: mpUI.y - 7,
			anchorX: 0,
			anchorY: 1,
		});
		layerMP.addChild(mpLoader);
	}

	var mpLoader2 = cc.Sprite.create(res.sprite, cc.rect(48, 106, 5, 8));
	mpLoader2.attr({
		x: 16 * ii + x0,
		y: mpUI.y - 7,
		anchorX: 0,
		anchorY: 1,
	});
	layerMP.addChild(mpLoader2);

	for (var i = 58; i <= 70; i += 6) {
		var mpBar = cc.Sprite.create(res.sprite, cc.rect(i, 108, 1, 4));
		mpBar.attr({
			x: x0,
			y: mpUI.y - 13,
			anchorX: 0,
			anchorY: 0,
			scaleX: 0,
		});
		layerMP.addChild(mpBar);
	}
	layerMP.runAction(cc.moveTo(0.5, cc.p(0, 0)));
}

// 更新血槽, 防御槽和气槽
function funcUpdateUI(type) {
	var layerUI = control.layer.ui.children;
	var layerHP = layerUI[0].children;
	var layerMP = layerUI[1].children;
	var hero = game.hero;
	var hpLine = config.hpLine;

	if (!type || type === 'hp') {
		var hp = [];
		var ii = parseInt(hero.hp / hpLine);

		for (var i = 0; i < ii; i += 1) {
			hp.push(hpLine);
		}
		if (hero.hp % hpLine) hp.push(hero.hp % hpLine);

		for (var i = 0; i < hp.length; i += 1) {
			layerHP[i + 1].attr({ scaleX: hp[i] / 4 });
		}
	}

	if (!type || type === 'dp') {
		layerHP[5].attr({ width: hero.dp / 4 });
	}

	if (!type || type === 'mp') {
		var mpFix = parseInt(hero.mp / 8) * 8;
		layerMP[layerMP.length - 3].attr({ scaleX: hero.mp * 2 });
		layerMP[layerMP.length - 2].attr({ scaleX: mpFix * 2 });
		if (hero.mpGather > 0)
			layerMP[layerMP.length - 1].attr({ scaleX: hero.mpGather * 2 });
	}
}

// 初始化打斗场合
function funcInitFight() {
	
}

// 更新人物动作
// type: 0小英雄, 1坏蛋
// status: stand站立, hit打击, defense防御, parry格挡, injured受伤, die倒地不起
function funcUpdateAction(type, status) {
	
}
