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

		// 对话面板
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

		// 角色
		var boxH = rect[3] / 3 * 2 * scale;
		var role0 = cc.Sprite.create(res.sprite, funcRect([0,0,0,0]));
		role0.attr({
			anchorY: 0,
			scale: scale,
		});
		panel.addChild(role0);
		var role1 = cc.Sprite.create(res.sprite, funcRect([0,0,0,0]));
		role1.attr({
			anchorY: 0,
			scale: scale,
		});
		panel.addChild(role1);

		// 文本框
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
		var text = cc.LabelTTF.create('', 'Arial', 14 * scale);
		text.attr({
			x: 8 * scale,
			y: boxH - 8 * scale,
			anchorX: 0,
			anchorY: 1,
			fillStyle: funcColor('#000000'),
			strokeStyle: funcColor('#000000'),
			lineWidth: 1,
		});
		box.addChild(text);

		// 下一步按钮
		var rect = rectData.sprite.dialog.ball;
		rect = JSON.parse(JSON.stringify(rect)); // 下面涉及到了写操作, 所以要复制一份出来, 防止污染涞源
		var btnNext = cc.Sprite.create(res.sprite, funcRect(rect));
		btnNext.attr({
			x: w - btnNext.width / 2 * scale,
			y: btnNext.height / 2 * scale,
			anchorX: 1,
			anchorY: 0,
			scale: scale,
		});
		box.addChild(btnNext);
		var ani = cc.Animation.create();
		for (var i = 0; i < 4; i += 1) {
			var frame = cc.SpriteFrame.create(res.sprite, funcRect(rect));
			ani.addSpriteFrame(frame);
			rect[0] += 18;
		}
		ani.setDelayPerUnit(0.1);
		ani.setRestoreOriginalFrame(true);
		btnNext.runAction(cc.repeatForever(cc.sequence(cc.animate(ani), cc.delayTime(3))));
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				if (control.lockOption) return false;

				var target = e.getCurrentTarget();
				if (target != btnNext) return false;

				var loc = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				index += 1;
				if (index < control.story.length) funcShow();
				else {
					if (control.storyAt === 'before' && !stageData[control.stageNum].noFight)
						cc.director.pushScene(control.scene.main);
					else cc.director.popToSceneStackLevel(2); // 第二个场景是世界地图页面
				}
			}
		}, btnNext);

		// 跳过按钮
		var pass = cc.Layer.create();
		layer.addChild(pass);
		rect = rectData.sprite.dialog.arrow;
		var btnPass = cc.Sprite.create(res.sprite, funcRect(rect));
		btnPass.attr({
			anchorX: 0,
			anchorY: 0,
			scale: scale,
		});
		pass.addChild(btnPass);
		var textPass = cc.LabelTTF.create('跳过 ', 'Arial', 14 * scale);
		textPass.attr({
			anchorX: 0,
			anchorY: 0,
			fillStyle: funcColor('#ffffff'),
		});
		pass.addChild(textPass);
		var passW = btnPass.width + textPass.width / scale;
		var passH = btnPass.height;
		btnPass.attr({ x: textPass.width });
		pass.attr({
			x: w - passW * 1.5 * scale,
			y: h - passH * 2 * scale,
			width: passW * scale,
			height: passH * scale,
			anchorY: 1,
		});
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				var target = e.getCurrentTarget();
				if (target != pass) return false;

				var loc = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				control.lockOption = false;
				if (control.storyAt === 'before' && !stageData[control.stageNum].noFight)
					cc.director.pushScene(control.scene.main);
				else cc.director.popToSceneStackLevel(2); // 第二个场景是世界地图页面
			}
		}, pass);

		funcShow();
		// 显示台词, 背景, 人物
		function funcShow() {
			var time = config.time;

			var callFunc00 = cc.callFunc(function() {
				control.lockOption = true; // 暂时锁住玩家操作, 防止狂点
				btnNext.attr({ visible: false });
			});

			var callFunc0 = cc.callFunc(function() {
				text.attr({ string: '' });
			});

			var callFunc1 = cc.callFunc(function() {
				btnNext.attr({ visible: true });
				control.lockOption = false; // 放开锁定
			});

			// control.story = stageData[control.stageNum].before;

			var item = control.story[index];
			var work = [callFunc00];

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
			} else work.push(callFunc0);

			// 显示人物头像
			if (item.role0) work.push(funcRole(item.role0, role0));
			if (item.role1) work.push(funcRole(item.role1, role1));

			// 打字机特效
			var textWork = [];
			var string = '';
			for (var i = 0; i < item.text.length; i += 1) {
				textWork.push(cc.callFunc(function() {
					string += item.text[string.length];
					text.attr({ string: string });
				}));
				textWork.push(cc.delayTime(0.05));
			}
			box.runAction(cc.sequence(textWork));

			work.push(cc.delayTime(0.05 * item.text.length));
			work.push(callFunc1);

			bg.runAction(cc.sequence(work));
		}

		// 人物头像动画
		function funcRole(obj, sprite) {
			return cc.callFunc(function() {
				if (obj.flip) sprite.flippedX = true;
				else if (obj.flip === false) sprite.flippedX = false;
				if (obj.action === 'fadeIn') sprite.opacity = 0;
				else sprite.opacity = 255;
				if (obj.name) sprite.setTextureRect(funcRect(rectData.sprite.dialog[obj.name]));
				switch (obj.from) {
					case 'left':
						sprite.attr({
							x: w / 7 * 1.3,
							y: boxH,
						});
						break;
					case 'leftOutside':
						sprite.attr({
							x: -sprite.width / 2 * scale,
							y: boxH,
						});
						break;
					case 'right':
						sprite.attr({
							x: w / 7 * 6,
							y: boxH,
						});
						break;
					case 'rightOutside':
						sprite.attr({
							x: w + sprite.width / 2 * scale,
							y: boxH,
						});
						break;
					case 'center':
						sprite.attr({
							x: w / 2,
							y: boxH,
						});
						break;
					case 'bottom':
						sprite.attr({ x: w / 2 });
						break;
					default:
						break;
				}
				var endValue;
				switch (obj.to) {
					case 'center':
						endValue = cc.p(w / 2, boxH);
						break;
					case 'left':
						endValue = cc.p(w / 7 * 1.3, boxH);
						break;
					case 'right':
						endValue = cc.p(w / 7 * 6, boxH);
						break;
					case 'rightOutside':
						endValue = cc.p(w + sprite.width / 2 * scale, boxH);
						break;
					default:
						break;
				}
				if (obj.action) sprite.runAction(cc[obj.action](config.time, endValue));
			});
		}
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeAllListeners();
	},
});
