// 生成一个返回按钮和一个是否确定返回对话框
function funcReturnView(context, mask, immediate, cb) {
	// 返回按钮
	var w = control.winWidth, h = control.winHeight;
	var scale = w / 256;
	scale = scale.toFixed(3) - 0;
	var rect = rectData.sprite.returnView.btn;
	var btn = cc.Sprite.create(res.sprite, funcRect(rect));
	btn.attr({
		x: w - rect[2] * scale,
		y: h - rect[3] * scale,
		anchorX: 1,
		anchorY: 1,
		scale: scale * 1.33,
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

			if (immediate) {
				funcReturn();
				return false;
			}

			if (box.visible) return false;

			box.visible = true;
			box.runAction(cc.scaleTo(config.time * 2, 1));
			boxMask.runAction(cc.fadeTo(config.time * 2, 128));
			cb(box.visible);
		}
	}, btn);

	if (!immediate) {
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

		var corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.corner));
		corner.attr({
			y: boxH,
			scale: scale,
		});
		box.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.corner));
		corner.attr({
			x: boxW,
			y: boxH,
			flippedX: true,
			scale: scale,
		});
		box.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.corner));
		corner.attr({
			flippedY: true,
			scale: scale,
		});
		box.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.corner));
		corner.attr({
			x: boxW,
			flippedX: true,
			flippedY: true,
			scale: scale,
		});
		box.addChild(corner);

		var line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.line0));
		line.attr({
			x: boxW / 2,
			y: boxH,
			scaleX: boxW - 4 * scale,
			scaleY: scale,
		});
		box.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.line0));
		line.attr({
			x: boxW / 2,
			flippedY: true,
			scaleX: boxW - 4 * scale,
			scaleY: scale,
		});
		box.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.line1));
		line.attr({
			y: boxH / 2,
			scaleX: scale,
			scaleY: boxH - 4 * scale,
		});
		box.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.line1));
		line.attr({
			x: boxW,
			y: boxH / 2,
			flippedX: true,
			scaleX: scale,
			scaleY: boxH - 4 * scale,
		});
		box.addChild(line);

		var title = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.title));
		title.attr({
			x: boxW / 2,
			y: boxH,
			scale: scale,
		});
		box.addChild(title);

		var str = '是否返回到世界地图?';
		var text = cc.LabelTTF.create(str, 'Arial', 12 * scale);
		text.attr({
			x: 6 * scale,
			y: boxH - 20 * scale,
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

		var iconYes = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.dot0));
		iconYes.attr({
			x: btnYes.width / 2,
			y: btnYes.height / 2,
			anchorX: 1.5,
			scale: scale,
		});
		btnYes.addChild(iconYes);
		var iconNo = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.returnView.dot1));
		iconNo.attr({
			x: btnNo.width / 2,
			y: btnNo.height / 2,
			anchorX: 1.5,
			scale: scale,
		});
		btnNo.addChild(iconNo);

		var textYes = cc.LabelTTF.create('是', 'Arial', 12 * scale);
		textYes.attr({
			x: btnYes.width / 2,
			y: btnYes.height / 2,
			anchorX: 0,
		});
		btnYes.addChild(textYes);
		var textNo = cc.LabelTTF.create('否', 'Arial', 12 * scale);
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

				funcReturn();
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

	// 执行返回
	function funcReturn() {
		if (immediate) {
			var callFunc = cc.callFunc(function() {
				cc.director.popScene();
			});
			mask.color = funcColor('#000000');
			mask.runAction(cc.sequence(cc.fadeIn(0.5), callFunc));
			return;
		}

		var scaleTo = cc.scaleTo(config.time, 0);
		var callFunc0 = cc.callFunc(function() {
			mask.color = funcColor('#000000');
			mask.runAction(cc.fadeIn(0.5));
		});
		var callFunc1 = cc.callFunc(function() {
			box.visible = false;
			cb(box.visible);
			cc.director.popToSceneStackLevel(2); // 第二个场景是世界地图页面
		});
		var delay = cc.delayTime(0.5);
		box.runAction(cc.sequence(scaleTo, callFunc0, delay, callFunc1));
	}
}
