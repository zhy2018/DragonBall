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
			
		});
		control.layerScene.addChild(layerBg);

		var bg = cc.Sprite.create(res.bg, cc.rect(481, 256, 264, 208));
		bg.attr({
			y: h,
			anchorX: 0,
			anchorY: 1,
			scale: scale,
		});
		layerBg.addChild(bg);
		bg.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(-bg.width * scale, h)),
			cc.moveTo(0, cc.p(0, h))
		)));
		var bg2 = cc.Sprite.create(res.bg, cc.rect(481, 256, 264, 208));
		bg2.attr({
			x: bg.width * scale,
			y: h,
			anchorX: 0,
			anchorY: 1,
			scale: scale,
		});
		layerBg.addChild(bg2);
		bg2.runAction(cc.repeatForever(cc.sequence(
			cc.moveTo(10, cc.p(0, h)),
			cc.moveTo(0, cc.p(bg.width * scale, h))
		)));

		funcShowHeroInfo();
		funcUpdateHeroInfo();

		// 舞台层
		var layerStage = cc.LayerColor.create(cc.color(255, 0, 0, 0), w, w);
		control.layerScene.addChild(layerStage);

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

		// 加载关卡数据
		cc.loader.loadJson(res.stage, function(_, data) {
			control.stageData = data;
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
		});
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeListener(cc.EventListener.TOUCH_ONE_BY_ONE);
	},
});
