var sceneMap = cc.Scene.extend({
	onEnter: function() {
		this._super();
		w = control.winWidth;
		h = control.winHeight;
		var scale = h / 320;
		scale = scale.toFixed(3) - 0;

		// 底层
		var layer = cc.Layer.create();
		layer.attr({
			y: h,
			anchorX: 0,
			anchorY: 0,
			scale: scale,
		});
		this.addChild(layer);

		// 背景图
		var bg = cc.Sprite.create(res.bg, cc.rect(0, 256, 480, 320));
		bg.attr({
			anchorX: 0,
			anchorY: 1,
		});
		layer.addChild(bg);

		var mask = cc.LayerColor.create(funcColor('#000000'), w, h);
		this.addChild(mask);
		mask.runAction(cc.FadeOut.create(0.5));

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				var target = e.getCurrentTarget();
				var loc = target.convertToNodeSpace(touch.getLocation());
				cc.log('onTouchBegan', touch.getLocation(), loc);
				return true;
			},
			onTouchMoved: function(touch, e) {
				var target = e.getCurrentTarget();
				var loc = target.convertToNodeSpace(touch.getLocation());
				cc.log('onTouchMoved', touch.getLocation(), loc);
			},
			onTouchEnded: function(touch, e) {
				var target = e.getCurrentTarget();
				var loc = target.convertToNodeSpace(touch.getLocation());
				cc.log('onTouchEnded', touch.getLocation(), loc);
			},
		}, bg);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeListener(cc.EventListener.TOUCH_ONE_BY_ONE);
	},
});
