// 生成一个返回按钮和一个是否确定返回对话框
function funcReturnView(context, mask, cb) {
	// 返回按钮
	var w = control.winWidth, h = control.winHeight;
	var scale = w / 256;
	scale = scale.toFixed(3) - 0;
	var btn = cc.Sprite.create(res.sprite, cc.rect(46, 312, 11, 10));
	btn.attr({
		x: w - 5.5 * scale,
		y: h - 5 * scale,
		anchorX: 1,
		anchorY: 1,
		scale: scale,
	});
	context.addChild(btn);
	cc.eventManager.addListener({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		onTouchBegan: function(touch, e) {
			var target = e.getCurrentTarget();
			if (target != btn) return false;

			var loc = target.convertToNodeSpace(touch.getLocation());
			var size = target.getContentSize();
			var rect = cc.rect(0, 0, size.width, size.height);
			if (!cc.rectContainsPoint(rect, loc)) return false;

			if (box.visible) return false;

			box.visible = true;
			box.runAction(cc.scaleTo(config.time * 2, 1));
			boxMask.runAction(cc.fadeTo(config.time * 2, 128));
			cb(box.visible);
		}
	}, btn);

	// 对话框的蒙层
	var boxMask = cc.LayerColor.create(funcColor('#000000'));
	boxMask.attr({
		opacity: 0,
	});
	context.addChild(boxMask);

	// 是否确定返回对话框
	var boxW = w / 2;
	var boxH = boxW / 2;
	var box = cc.LayerColor.create(funcColor('#5060B0'), boxW, boxH);
	box.attr({
		x: (w - boxW) / 2,
		y: h / 2,
		scale: 0,
		visible: false,
	});
	context.addChild(box);

	var corner = cc.Sprite.create(res.sprite, cc.rect(36, 302, 4, 7));
	corner.attr({
		y: boxH,
		scale: scale,
	});
	box.addChild(corner);
	corner = cc.Sprite.create(res.sprite, cc.rect(36, 302, 4, 7));
	corner.attr({
		x: boxW,
		y: boxH,
		flippedX: true,
		scale: scale,
	});
	box.addChild(corner);
	corner = cc.Sprite.create(res.sprite, cc.rect(36, 302, 4, 7));
	corner.attr({
		flippedY: true,
		scale: scale,
	});
	box.addChild(corner);
	corner = cc.Sprite.create(res.sprite, cc.rect(36, 302, 4, 7));
	corner.attr({
		x: boxW,
		flippedX: true,
		flippedY: true,
		scale: scale,
	});
	box.addChild(corner);

	var line = cc.Sprite.create(res.sprite, cc.rect(41, 302, 1, 7));
	line.attr({
		x: boxW / 2,
		y: boxH,
		scaleX: boxW - 4 * scale,
		scaleY: scale,
	});
	box.addChild(line);
	line = cc.Sprite.create(res.sprite, cc.rect(41, 302, 1, 7));
	line.attr({
		x: boxW / 2,
		flippedY: true,
		scaleX: boxW - 4 * scale,
		scaleY: scale,
	});
	box.addChild(line);
	line = cc.Sprite.create(res.sprite, cc.rect(36, 308, 4, 1));
	line.attr({
		y: boxH / 2,
		scaleX: scale,
		scaleY: boxH - 4 * scale,
	});
	box.addChild(line);
	line = cc.Sprite.create(res.sprite, cc.rect(36, 308, 4, 1));
	line.attr({
		x: boxW,
		y: boxH / 2,
		flippedX: true,
		scaleX: scale,
		scaleY: boxH - 4 * scale,
	});
	box.addChild(line);

	var title = cc.Sprite.create(res.sprite, cc.rect(46, 302, 41, 7));
	title.attr({
		x: boxW / 2,
		y: boxH,
		scale: scale,
	});
	box.addChild(title);

	var str = '是否返回到上一个页面?';
	var text = cc.LabelTTF.create(str, '黑体', 8 * scale);
	text.attr({
		x: 8 * scale,
		y: boxH - 16 * scale,
		anchorX: 0,
	});
	box.addChild(text);

	var btnYes = cc.LayerColor.create(cc.color(255, 0, 0, 0), boxW / 2, boxH / 2);
	box.addChild(btnYes);
	var btnNo = cc.LayerColor.create(cc.color(0, 255, 0, 0), boxW / 2, boxH / 2);
	btnNo.attr({
		x: boxW / 2,
	});
	box.addChild(btnNo);

	var iconYes = cc.Sprite.create(res.sprite, cc.rect(36, 312, 6, 6));
	iconYes.attr({
		x: btnYes.width / 2,
		y: btnYes.height / 2,
		anchorX: 1.5,
		scale: scale,
	});
	btnYes.addChild(iconYes);
	var iconNo = cc.Sprite.create(res.sprite, cc.rect(36, 320, 6, 6));
	iconNo.attr({
		x: btnNo.width / 2,
		y: btnNo.height / 2,
		anchorX: 1.5,
		scale: scale,
	});
	btnNo.addChild(iconNo);

	var textYes = cc.LabelTTF.create('是', '黑体', 8 * scale);
	textYes.attr({
		x: btnYes.width / 2,
		y: btnYes.height / 2,
		anchorX: 0,
	});
	btnYes.addChild(textYes);
	var textNo = cc.LabelTTF.create('否', '黑体', 8 * scale);
	textNo.attr({
		x: btnNo.width / 2,
		y: btnNo.height / 2,
		anchorX: 0,
	});
	btnNo.addChild(textNo);

	cc.eventManager.addListener({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		onTouchBegan: function(touch, e) {
			var target = e.getCurrentTarget();
			if (target != btnYes) return false;

			var loc = target.convertToNodeSpace(touch.getLocation());
			var size = target.getContentSize();
			var rect = cc.rect(0, 0, size.width, size.height);
			if (!cc.rectContainsPoint(rect, loc)) return false;

			var scaleTo = cc.scaleTo(config.time, 0);
			var callFunc0 = cc.callFunc(function() {
				mask.color = funcColor('#000000');
				mask.runAction(cc.fadeIn(0.5));
			});
			var callFunc1 = cc.callFunc(function() {
				box.visible = false;
				cb(box.visible);
				cc.director.popScene();
			});
			var delay = cc.delayTime(0.5);
			box.runAction(cc.sequence(scaleTo, callFunc0, delay, callFunc1));
		}
	}, btnYes);
	cc.eventManager.addListener({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		onTouchBegan: function(touch, e) {
			var target = e.getCurrentTarget();
			if (target != btnNo) return false;

			var loc = target.convertToNodeSpace(touch.getLocation());
			var size = target.getContentSize();
			var rect = cc.rect(0, 0, size.width, size.height);
			if (!cc.rectContainsPoint(rect, loc)) return false;

			box.runAction(cc.scaleTo(config.time, 0));
			boxMask.runAction(cc.fadeOut(config.time));
			box.scheduleOnce(function() {
				box.visible = false;
				cb(box.visible);
			}, config.time);
		}
	}, btnNo);
}
