var sceneMain = cc.Scene.extend({
	onEnter: function() {
		this._super();

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

		// 打斗层, 包括一个打斗场合和小英雄以及坏蛋们
		var fight = cc.LayerColor.create(cc.color(255, 0, 0, 0));
		this.addChild(fight);
		control.layer.fight = fight;
		funcInitFight();

		// 消息层
		var info = cc.Layer.create();
		this.addChild(info);
		control.layer.info = info;

		// 蒙层
		var mask = cc.LayerColor.create(funcColor('#ffffff'));
		funcReturnView(this, mask, false, function(boxVisible) {
			control.lockOption = boxVisible;
		});
		this.addChild(mask);
		control.layer.mask = mask;

		funcGo(); // 走起！
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeAllListeners();
	},
});

// 初始化背景层
function funcInitBg() {
	var data = stageData[control.stageNum].scene[control.sceneNum];
	var color = data.bgColor;
	document.body.style.backgroundColor = color;
	control.layer.floor.color = funcColor(color);

	var rect = rectData.bg.main[data.bgRect];
	var w = control.winWidth, h = control.winHeight;
	var scale = w / rect[2];
	scale = scale.toFixed(3) - 0;
	var mapping = {
		top: [h, 1],
		center: [w + (h - w) / 2, 0.5],
		bottom: [w, 0],
	};
	control.layer.bg.attr({
		y: mapping[data.bgLocation][0],
		anchorX: 0,
		anchorY: 0,
		scale: scale,
	});

	var bg0 = cc.Sprite.create(res.bg, funcRect(rect));
	bg0.attr({
		anchorX: 0,
		anchorY: mapping[data.bgLocation][1],
	});
	control.layer.bg.addChild(bg0);

	if (data.autoScroll) {
		bg0.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(-bg0.width, 0)),
			cc.moveTo(0, cc.p(0, 0))
		)));
		var bg1 = cc.Sprite.create(res.bg, funcRect(rect));
		bg1.attr({
			x: bg0.width,
			anchorX: 0,
			anchorY: mapping[data.bgLocation][1],
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
	var data = stageData[control.stageNum];
	var hero = game.hero;
	hero.hpFull = data.hpFull || config.hpLimit;
	hero.mpFull = data.mpFull || config.mpLimit;
	hero.dpFull = config.dpLimit;
	hero.hp = data.hp;
	hero.mp = data.mp;
	hero.dp = config.dpLimit;
	var w = control.winWidth, h = control.winHeight;
	var scale = w / 2.5 / 112;
	scale = scale.toFixed(3) - 0;
	control.scaleUI = scale;

	control.layer.ui.attr({ y: h });

	var layerHP = cc.Layer.create();
	layerHP.attr({ y: 32 * scale });
	control.layer.ui.addChild(layerHP);

	var hpUI = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.hpUI));
	hpUI.attr({
		anchorX: 0,
		anchorY: 1,
		scale: scale,
	});
	layerHP.addChild(hpUI);

	var rect = rectData.sprite.main.hpBar;
	for (var i = 116; i <= 140; i += 8) {
		rect[0] = i;
		var hpBar = cc.Sprite.create(res.sprite, funcRect(rect));
		hpBar.attr({
			x: 32 * scale,
			y: -23 * scale,
			anchorX: 0,
			anchorY: 0,
			scaleX: 0,
			scaleY: scale,
		});
		layerHP.addChild(hpBar);
	}

	var dp = cc.LayerColor.create(funcColor('#00e800'), 0, 2);
	dp.attr({
		x: 32 * scale,
		y: -28 * scale,
		anchorX: 0,
		scale: scale,
	});
	layerHP.addChild(dp);

	var name = cc.LabelTTF.create(hero.name, 'Arial', 16 * scale);
	name.attr({
		x: 32 * scale,
		anchorX: 0,
		anchorY: 1,
		lineWidth: 1.5 * scale,
		strokeStyle: funcColor('#000000'),
	});
	layerHP.addChild(name);

	var layerMP = cc.Layer.create();
	layerMP.attr({
		y: -32 * scale,
		anchorX: 0,
		anchorY: 0,
		scale: scale,
	});
	control.layer.ui.addChild(layerMP);

	var mpUI = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.mpUI));
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
		var mpLoader = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.mpLoader));
		mpLoader.attr({
			x: 16 * i + x0,
			y: mpUI.y - 7,
			anchorX: 0,
			anchorY: 1,
		});
		layerMP.addChild(mpLoader);
	}

	var mpLoader2 = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.mpLoader2));
	mpLoader2.attr({
		x: 16 * ii + x0,
		y: mpUI.y - 7,
		anchorX: 0,
		anchorY: 1,
	});
	layerMP.addChild(mpLoader2);

	rect = rectData.sprite.main.mpBar;
	for (var i = 0; i < 3; i += 1) {
		rect[0] += i * 6;
		var mpBar = cc.Sprite.create(res.sprite, funcRect(rect));
		mpBar.attr({
			x: x0,
			y: mpUI.y - 13,
			anchorX: 0,
			anchorY: 0,
			scaleX: 0,
		});
		layerMP.addChild(mpBar);
	}
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
			layerHP[i + 1].attr({ scaleX: hp[i] / 4 * control.scaleUI });
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

// 拉开帷幕, 准备开始
function funcGo() {
	var w = control.winWidth, h = control.winHeight;
	var mask = control.layer.mask, info = control.layer.info;
	var sprite;
	var fadeOut = cc.FadeOut.create(0.5);
	var callFunc0 = cc.callFunc(function() {
		var ui = control.layer.ui.children;
		ui[0].runAction(cc.moveTo(0.5, cc.p(0, 0)));
		ui[1].runAction(cc.moveTo(0.5, cc.p(0, 0)));
	});
	var callFunc1 = cc.callFunc(function() {
		sprite = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.ready));
		sprite.attr({
			x: w / 2,
			y: h / 2,
			scale: control.scaleUI,
		});
		info.addChild(sprite);
	});
	var callFunc2 = cc.callFunc(function() {
		sprite.setTextureRect(funcRect(rectData.sprite.main.go));
	});
	var callFunc3 = cc.callFunc(function() {
		info.removeAllChildren();
		control.acceptTouch = true;
	});
	var delay = cc.delayTime(0.5);
	var actions = [
		fadeOut,
		delay, callFunc0,
		delay, callFunc1,
		delay, callFunc2,
		delay, callFunc3,
	];
	mask.runAction(cc.sequence(actions));
}

// 初始化打斗场合
function funcInitFight() {
	var w = control.winWidth, h = control.winHeight, scale = control.scaleUI;
	var fight = control.layer.fight, stage = control.layer.stage;
	fight.attr({
		height: h - stage.height,
		y: stage.y + stage.height,
	});

	// 打手层
	var fighter = cc.Layer.create();
	fight.addChild(fighter);
	fight.fighter = fighter;

	// 小英雄
	var rect = rectData.action.main.stand;
	var hero = cc.Sprite.create(res.action, funcRect(rect));
	hero.attr({
		x: w / 2,
		anchorY: 0,
		scale: scale,
	});
	fighter.addChild(hero);
	fighter.hero = hero;

	var aniStand = cc.Animation.create();
	for (var i = 0; i < 8; i += 1) {
		rect[0] = i * 32;
		var frame = cc.SpriteFrame.create(res.action, funcRect(rect));
		aniStand.addSpriteFrame(frame);
	}
	aniStand.setDelayPerUnit(0.1);
	game.hero.ani.stand = aniStand;
	funcUpdateAction('hero', [['stand', 0]]);

	for (var m = 3; m <= 5; m += 1) {
		game.hero.ani['hit' + m] = cc.Animation.create();
		game.hero.ani['hit' + m].setDelayPerUnit(aniData.hero.hit.delay);
	}
	var a = aniData.hero.hit.data;
	for (var i = 0, m = 2; i < a.length; i += 1) {
		if (a[i][7]) m += 1;
		// 帧延迟
		for (var j = 0; j < a[i][5]; j += 1) {
			var frame = cc.SpriteFrame.create(res.action, funcRect(a[i]));
			frame.setOffset({ x: a[i][4], y: 0 }); // x轴需要偏移一定距离才能显示正确
			for (var n = m; n <= 5; n += 1) {
				game.hero.ani['hit' + n].addSpriteFrame(frame);
			}
		}
	}
}

// 更新打手的动作
// roleType: 角色类型, 0小英雄, 1坏蛋; statusGroup: 状态组, 每组状态包含状态名和循环次数
// 状态: stand站立, hit打击, defense防御, parry格挡, injured受伤, die倒地不起
function funcUpdateAction(roleType, statusGroup) {
	var status = statusGroup[0][0];
	var loop = statusGroup[0][1];
	game[roleType].status = status;
	var sprite = control.layer.fight.fighter[roleType];
	var animation = game[roleType].ani[status];
	if (loop >= 2) animation.setLoops(loop); // 设置播放次数
	var animate = cc.animate(animation);
	if (loop <= 0) animate = cc.repeatForever(animate); // 设置循环播放
	var work = [animate];

	if (statusGroup.length >= 2 && loop >= 1) {
		statusGroup.splice(0, 1);
		var callFunc = cc.callFunc(function() {
			funcUpdateAction(roleType, statusGroup);
		});
		work.push(callFunc);
	}
	sprite.stopAllActions();
	sprite.runAction(cc.sequence(work));
}
