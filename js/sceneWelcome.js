var sceneWelcome = cc.Scene.extend({
	onEnter: function() {
		this._super();
		var w = control.winWidth, h = control.winHeight;
		var rect = rectData.bg.welcome.bg;
		var bgSize = rect[2];
		var scaleX = w / bgSize;
		scaleX = scaleX.toFixed(3) - 0;
		var scaleY = h / bgSize;
		scaleY = scaleY.toFixed(3) - 0;

		// 底层
		var layer = cc.Layer.create();
		layer.attr({
			y: h,
			anchorX: 0,
			anchorY: 0,
			scaleX: scaleX,
			scaleY: scaleY,
		});
		this.addChild(layer);

		// 背景图
		var bg = cc.Sprite.create(res.bg, funcRect(rect));
		bg.attr({
			anchorX: 0,
			anchorY: 1,
		});
		layer.addChild(bg);

		// 云朵, 青山, 浮云 [y, height]
		var datas = [
			[0, 30], [63, 32], [96, 21], [117, 9],
			[130, 80], [210, 16], [226, 14], [240, 16],
		];
		var times = [2, 3, 4, 8, 10, 5, 3, 2];
		for (var i = 0; i < datas.length; i += 1) {
			var data = datas[i];
			var time = times[i];
			var sprite = cc.Sprite.create(
				res.bg,
				cc.rect(i < 4 ? bg.width + 2 : 1, data[0], bg.width, data[1])
			);
			sprite.attr({
				y: -data[0],
				anchorX: 0,
				anchorY: 1,
			});
			layer.addChild(sprite);
			sprite.runAction(cc.repeatForever(cc.sequence(
				cc.moveTo(time, cc.p(-bg.width, -data[0])),
				cc.moveTo(0, cc.p(i < 4 ? bg.width : 0, -data[0]))
			)));

			if (i >= 4) {
				var sprite2 = cc.Sprite.create(res.bg, cc.rect(1, data[0], bg.width, data[1]));
				sprite2.attr({
					x: bg.width,
					y: -data[0],
					anchorX: 0,
					anchorY: 1,
				});
				layer.addChild(sprite2);
				sprite2.runAction(cc.repeatForever(cc.sequence(
					cc.moveTo(time, cc.p(0, -data[0])),
					cc.moveTo(0, cc.p(bg.width, -data[0]))
				)));
			}
		}

		// logo
		var logo = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.welcome.logo));
		logo.attr({
			x: w / 2,
			y: h / 3 * 2,
			scale: scaleX,
		});
		this.addChild(logo);

		var btn = cc.LabelTTF.create('开始游戏', 'Arial', 24 * scaleX);
		btn.attr({
			x: w / 2,
			y: h / 4,
			scaleX: 0.75,
			lineWidth: 3 * scaleX,
			strokeStyle: cc.color(0, 0, 0, 255),
		});
		this.addChild(btn);
		btn.runAction(cc.repeatForever(cc.Blink.create(1, 1)));

		var mask = cc.LayerColor.create(funcColor('#000000'), w, h);
		mask.attr({ opacity: 0 });
		this.addChild(mask);

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				var target = e.getCurrentTarget();
				if (target != btn) return false;

				var loc = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				btn.stopAllActions();
				btn.runAction(cc.repeatForever(cc.Blink.create(1, 5)));
				var delay = cc.delayTime(0.5);
				var callFunc0 = cc.callFunc(function() {
					mask.runAction(cc.FadeIn.create(0.5));
				});
				var callFunc1 = cc.callFunc(function() {
					cc.director.pushScene(control.scene.map);
				});
				btn.runAction(cc.sequence(delay, callFunc0, delay, callFunc1));
			}
		}, btn);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeAllListeners();
	},
});
