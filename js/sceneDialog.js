var sceneDialog = cc.Scene.extend({
	onEnter: function() {
		this._super();
		var w = control.winWidth, h = control.winHeight;
		var rect = rectData.bg.dialog.初识;
		var bgSize = rect[2];
		var scale = w / bgSize;
		scale = scale.toFixed(3) - 0;
		var index = 0; // 第几句对话

		// 底层
		var layer = cc.LayerColor.create(funcColor('#000000'));
		this.addChild(layer);

		// 面板
		var panel = cc.LayerColor.create(funcColor('#000000'), w, rect[3] / 3 * 5 * scale);
		panel.attr({
			y: (h - panel.height) / 2,
		});
		layer.addChild(panel);

		// 背景图
		var bg = cc.Sprite.create(res.bg, funcRect([0,0,0,0]));
		bg.attr({
			y: panel.height,
			anchorX: 0,
			anchorY: 1,
			scale: scale,
		});
		panel.addChild(bg);

		// 文本框
		var boxH = rect[3] / 3 * 2 * scale;
		var box = cc.LayerColor.create(funcColor('#E0E0F8'), w, boxH);
		panel.addChild(box);

		var corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.corner));
		corner.attr({
			y: boxH,
			anchorX: 0,
			anchorY: 1,
			scale: scale,
		});
		box.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.corner));
		corner.attr({
			x: w,
			y: boxH,
			anchorX: 1,
			anchorY: 1,
			flippedX: true,
			scale: scale,
		});
		box.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.corner));
		corner.attr({
			anchorX: 0,
			anchorY: 0,
			flippedY: true,
			scale: scale,
		});
		box.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.corner));
		corner.attr({
			x: w,
			anchorX: 1,
			anchorY: 0,
			flippedX: true,
			flippedY: true,
			scale: scale,
		});
		box.addChild(corner);

		var line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.line0));
		line.attr({
			x: w / 2,
			y: boxH,
			anchorY: 1,
			scaleX: w - 10 * scale,
			scaleY: scale,
		});
		box.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.line0));
		line.attr({
			x: w / 2,
			anchorY: 0,
			flippedY: true,
			scaleX: w - 10 * scale,
			scaleY: scale,
		});
		box.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.line1));
		line.attr({
			y: boxH / 2,
			anchorX: 0,
			scaleX: scale,
			scaleY: boxH - 40 * scale,
		});
		box.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.dialog.line1));
		line.attr({
			x: w,
			y: boxH / 2,
			anchorX: 1,
			flippedX: true,
			scaleX: scale,
			scaleY: boxH - 40 * scale,
		});
		box.addChild(line);

		// 字幕
		var text = cc.LabelTTF.create('', '黑体', 14 * scale);
		text.attr({
			x: 8 * scale,
			y: boxH - 8 * scale,
			anchorX: 0,
			anchorY: 1,
			fillStyle: funcColor('#000000'),
			strokeStyle: funcColor('#ffffff'),
			lineWidth: 1,
		});
		box.addChild(text);

		// 下一步按钮
		var rect = rectData.sprite.dialog.ball;
		var btn = cc.Sprite.create(res.sprite, funcRect(rect));
		btn.attr({
			x: w - btn.width / 2 * scale,
			y: btn.height / 2 * scale,
			anchorX: 1,
			anchorY: 0,
			scale: scale,
		});
		box.addChild(btn);
		var ani = cc.Animation.create();
		for (var i = 0; i < 4; i += 1) {
			var frame = cc.SpriteFrame.create(res.sprite, funcRect(rect));
			ani.addSpriteFrame(frame);
			rect[0] += 18;
		}
		ani.setDelayPerUnit(0.1);
		ani.setRestoreOriginalFrame(true);
		btn.runAction(cc.repeatForever(cc.sequence(cc.animate(ani), cc.delayTime(3))));

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				var target = e.getCurrentTarget();
				if (target != btn) return false;

				var loc = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				index += 1;
				if (index < control.story.length) funcShow(index, text, bg, btn);
				else {
					if (control.storyAt === 'before') cc.director.pushScene(control.scene.main);
					else cc.director.popToSceneStackLevel(2); // 第二个场景是世界地图页面
				}
			}
		}, btn);

		funcShow(index, text, bg, btn);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeAllListeners();
	},
});

// 显示台词, 背景, 人物
function funcShow(index, text, bg, btn) {
	var time = config.time;

	btn.attr({ visible: false });

	var callFunc0 = cc.callFunc(function() {
		text.attr({ string: '' });
	});

	var callFunc1 = cc.callFunc(function() {
		text.attr({ string: item.text });
	});

	var callFunc2 = cc.callFunc(function() {
		btn.attr({ visible: true });
	});

	var item = control.story[index];
	var work = [];

	if (item.bg !== undefined) {
		// 切换背景
		var callFunc3 = cc.callFunc(function() {
			var rect = item.bg != '' ? rectData.bg.dialog[item.bg] : [0,0,0,0];
			bg.setTextureRect(funcRect(rect));
		});
		work.push(cc.fadeOut(time));
		work.push(callFunc3);
		work.push(callFunc0);
		work.push(cc.fadeIn(time));
	}

	work.push(callFunc1);
	work.push(callFunc2);

	bg.runAction(cc.sequence(work));
}
