var sceneMain = cc.Scene.extend({
	onEnter: function() {
		this._super();
		var winSize = cc.director.getWinSize();
		var w = winSize.width;
		var h = winSize.height;
		control.winWidth = w;
		control.winHeight = h;

		// 计算格子的缩放倍数
		control.zoom = w / config.mapSizeLimit / config.tileSize;
		control.zoom = control.zoom.toFixed(2) - 0;

		var colors = ['#007858'];
		var color = colors[control.stageNum - 1];
		document.body.style.backgroundColor = color;

		// 场景层
		control.layerScene = cc.LayerColor.create(funcColor(color), w, h);
		this.addChild(control.layerScene);

		var mask = cc.LayerColor.create(funcColor('#ffffff'), w, h);
		this.addChild(mask);

		// 背景层
		var scale = w / 264;
		scale = scale.toFixed(3) - 0;
		var layerBg = cc.Layer.create();
		layerBg.attr({
			y: h,
			anchorX: 0,
			anchorY: 0,
			scale: scale,
		});
		control.layerScene.addChild(layerBg);

		var bg = cc.Sprite.create(res.bg, cc.rect(481, 256, 264, 208));
		bg.attr({
			anchorX: 0,
			anchorY: 1,
		});
		layerBg.addChild(bg);
		bg.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(-bg.width, 0)),
			cc.moveTo(0, cc.p(0, 0))
		)));
		var bg2 = cc.Sprite.create(res.bg, cc.rect(481, 256, 264, 208));
		bg2.attr({
			x: bg.width,
			anchorX: 0,
			anchorY: 1,
		});
		layerBg.addChild(bg2);
		bg2.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(0, 0)),
			cc.moveTo(0, cc.p(bg.width, 0))
		)));

		// 显示血槽, 防御槽和气槽
		var hero = game.hero;
		hero.hpFull = config.hpLimit;
		hero.mpFull = config.mpLimit;
		hero.dpFull = config.dpLimit;
		scale = w / 2.5 / 112;
		scale = scale.toFixed(3) - 0;
		control.scaleUI = scale;

		var layerUI = cc.LayerColor.create(funcColor('#000000'), 0, 0);
		layerUI.attr({
			y: h,
			scale: scale,
		});
		control.layerScene.addChild(layerUI);

		var layerHP = cc.Layer.create();
		layerHP.attr({ y: 32 });
		layerUI.addChild(layerHP);

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
		layerUI.addChild(layerMP);

		var mpUI = cc.Sprite.create(res.sprite, cc.rect(2, 98, 20, 19));
		mpUI.attr({
			x: 8,
			y: -(h - w - 19 * scale - 8) / scale,
			anchorX: 0,
			anchorY: 1,
		});
		layerMP.addChild(mpUI);

		var x0 = 27;
		var ii = 4;
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

		for (var i = 56; i <= 68; i += 6) {
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

		funcUpdateHeroInfo();

		// 舞台层
		var layerStage = cc.LayerColor.create(cc.color(255, 0, 0, 0), w, w);
		control.layerScene.addChild(layerStage);

		// 战斗层, 显示打斗场所, 小英雄和坏蛋
		var layerFight = cc.Layer.create();
		layerFight.attr({
			y: layerStage.y + layerStage.height,
			anchorX: 0,
			anchorY: 0,
			scale: scale,
		});
		control.layerScene.addChild(layerFight);

		// 人物层, 包含了小英雄和坏蛋们
		var layerFighter = cc.Layer.create();
		layerFight.addChild(layerFighter);
		// 小英雄
		var hero = cc.Sprite.create(res.action, cc.rect(0, 0, 32, 40));
		hero.attr({
			x: w / 2 / scale,
			anchorY: 0,
		});
		layerFighter.addChild(hero);
		var aniStand = cc.Animation.create();
		for (var i = 0; i < 8; i += 1) {
			var frame = cc.SpriteFrame.create(res.action, cc.rect(i * 32, 0, 32, 40));
			aniStand.addSpriteFrame(frame);
		}
		aniStand.setDelayPerUnit(0.1);
		hero.runAction(cc.repeatForever(cc.animate(aniStand)));

		// 消息层
		var layerInfo = cc.Layer.create();
		control.layerScene.addChild(layerInfo);

		// 格子背景层
		var layerStageBg = cc.Layer.create();
		layerStageBg.attr({
			width: w,
			height: w,
		});
		layerStage.addChild(layerStageBg);

		// 角色层
		var layerStageRole = cc.Layer.create();
		layerStageRole.attr({
			width: w,
			height: w,
		});
		layerStage.addChild(layerStageRole);

		// 格子的选择框
		var tileBorder = cc.Sprite.create(res.sprite, cc.rect(32, 32, 30, 30));
		tileBorder.attr({
			scale: control.zoom,
			visible: false
		});
		layerStage.addChild(tileBorder);

		// 格子的按下事件
		control.touchListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				if (!control.acceptTouch) return false;
				var target = e.getCurrentTarget();
				var loc  = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				tileBorder.attr({
					x: target.x,
					y: target.y,
					visible: true,
				});

				control.currentRole = target;
				funcPress();
				return true;
			},
		});

		funcInit();

		var sprite;
		mask.runAction(cc.FadeOut.create(0.5));
		mask.scheduleOnce(function() {
			sprite = cc.Sprite.create(res.sprite, cc.rect(0, 220, 117, 36));
			sprite.attr({
				x: w / 2,
				y: h / 2,
				scale: scale,
			});
			layerInfo.addChild(sprite);
		}, 0.5);
		mask.scheduleOnce(function() {
			sprite.setTextureRect(cc.rect(120, 220, 65, 35));
		}, 1);
		mask.scheduleOnce(function() {
			layerInfo.removeAllChildren();
			control.acceptTouch = true;
		}, 1.5);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeListener(cc.EventListener.TOUCH_ONE_BY_ONE);
	},
});

// 更新血槽, 防御槽和气槽
function funcUpdateHeroInfo(type) {
	var layerUI = control.layerScene.children[1].children;
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
		layerMP[6].attr({ scaleX: hero.mp * 2 });
		layerMP[7].attr({ scaleX: mpFix * 2 });
		if (hero.mpGather > 0)
			layerMP[8].attr({ scaleX: hero.mpGather * 2 });
	}
}

// 更新人物动作
// type: 0小英雄, 1坏蛋
// status: stand站立, hit打击, defense防御, parry格挡, injured受伤, die倒地不起
function funcUpdateAction(type, status) {
	
}
