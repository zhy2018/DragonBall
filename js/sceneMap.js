var sceneMap = cc.Scene.extend({
	onEnter: function() {
		this._super();
		var w = control.winWidth, h = control.winHeight;
		var scale = h / 320;
		scale = scale.toFixed(3) - 0;

		// 底层
		var layer = cc.Layer.create();
		layer.attr({
			anchorX: 0,
			anchorY: 0,
			offsetWidth: 0, // 偏移距离
			offsetHeight: 0,
			scale: scale,
		});
		this.addChild(layer);

		// 背景图
		var bg = cc.Sprite.create(res.bg, cc.rect(0, 256, 480, 320));
		bg.attr({
			anchorX: 0,
			anchorY: 0,
		});
		layer.addChild(bg);

		var limitX = w - Math.round(bg.width * scale);
		var limitY = h - Math.round(bg.height * scale);

		// 地点层
		var layerSite = cc.Layer.create();
		layerSite.attr({ y: h / scale });
		layer.addChild(layerSite);

		// 消息层
		var layerInfo = cc.LayerColor.create(funcColor('#f8f8f8'), w, h / 8);
		layerInfo.attr({
			y: -h / 8,
		});
		this.addChild(layerInfo);

		// 返回按钮
		var backBtn = cc.Sprite.create(res.sprite, cc.rect(46, 312, 11, 10));
		backBtn.attr({
			x: w - 5.5 * scale,
			y: h - 5 * scale,
			anchorX: 1,
			anchorY: 1,
			scale: scale,
		});
		this.addChild(backBtn);
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				var target = e.getCurrentTarget();
				if (target != backBtn) return false;

				var loc = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				var fadeIn = cc.FadeIn.create(0.5);
				var callFunc = cc.callFunc(function() {
					cc.director.popScene();
				});
				mask.runAction(cc.sequence(fadeIn, callFunc));
			}
		}, backBtn);

		// 蒙层
		var mask = cc.LayerColor.create(funcColor('#000000'), w, h);
		this.addChild(mask);
		mask.runAction(cc.fadeOut(0.5));

		// var temp = cc.LayerColor.create(cc.color(255, 0, 0, 255), 8, 8);
		// temp.attr({ x: (w - 8) / 2, y: (h - 8) / 2 });
		// this.addChild(temp);
		// temp.runAction(cc.RepeatForever.create(cc.Blink.create(1, 5)));

		var data = control.stageData;
		var size = 40;
		for (var i = 0; i < data.length; i += 1) {
			var item = data[i];
			var sprite = cc.Sprite.create(res.sprite, cc.rect((i + 1) * size, 260, size, size));
			sprite.attr({
				x: item.mapX,
				y: -item.mapY,
				anchorY: 0,
				name: item.name,
				stageNum: i,
			});
			layerSite.addChild(sprite);
		}

		// 小英雄
		size = 32;
		var hero = cc.Sprite.create(res.action, cc.rect(0, 168, size, size));
		hero.attr({
			x: data[0].mapX,
			y: data[0].mapY,
			anchorY: 0,
		});
		layer.addChild(hero);
		var aniStand = cc.Animation.create();
		for (var i = 0; i < 4; i += 1) {
			var frame = cc.SpriteFrame.create(res.action, cc.rect(i * size, 168, size, size));
			aniStand.addSpriteFrame(frame);
		}
		aniStand.setDelayPerUnit(0.2);
		hero.runAction(cc.repeatForever(cc.animate(aniStand)));

		var eventType = 'click'; // click or drag
		var acceptTouch = true; // 是否响应触控事件
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch) {
				if (!acceptTouch) return false;

				var loc = touch.getLocation();
				layer.attr({
					offsetWidth: loc.x - layer.x,
					offsetHeight: loc.y - layer.y,
				});
				eventType = 'click';
				return true;
			},
			onTouchMoved: function(touch) {
				var loc = touch.getLocation();
				var x = loc.x - layer.offsetWidth;
				var y = loc.y - layer.offsetHeight;
				if (x > 0) x = 0; // 约束
				if (y > 0) y = 0;
				if (x < limitX) x = limitX;
				if (y < limitY) y = limitY;
				layer.attr({
					x: x,
					y: y,
				});
				eventType = 'drag';
			},
			onTouchEnded: function(touch, e) {
				var target = e.getCurrentTarget();
				var loc = touch.getLocation();
				var loc0 = target.convertToNodeSpace(loc);
				loc0.x = Math.round(loc0.x);
				loc0.y = Math.round(loc0.y);
				layer.attr({
					offsetWidth: 0,
					offsetHeight: 0,
				});

				if (eventType === 'drag') return;

				var collide = false;
				for (var i = 0; i < layerSite.children.length; i += 1) {
					var sprite = layerSite.children[i];
					var spriteLeft = sprite.x - sprite.width / 2;
					var spriteRight = sprite.x + sprite.width / 2;
					var spriteBottom = bg.height - Math.abs(sprite.y);
					var spriteTop = spriteBottom + sprite.height;
					collide = loc0.x >= spriteLeft && loc0.x <= spriteRight &&
										loc0.y <= spriteTop && loc0.y >= spriteBottom;
					if (collide) {
						var aniGo = cc.Animation.create();
						for (var i = 0; i < 8; i += 1) {
							var frame = cc.SpriteFrame.create(res.action, cc.rect(i * size, 200, size, size));
							aniGo.addSpriteFrame(frame);
						}
						aniGo.setDelayPerUnit(0.1);
						acceptTouch = false;
						hero.flippedX = sprite.x < hero.x;
						hero.stopAllActions();
						hero.runAction(cc.repeatForever(cc.animate(aniGo)));
						hero.runAction(cc.jumpTo(1, cc.p(sprite.x, spriteBottom), 40, 1));
						hero.scheduleOnce(function() {
							hero.stopAllActions();
							hero.runAction(cc.repeatForever(cc.animate(aniStand)));
							// 底部弹出消息框
							layerInfo.runAction(cc.moveTo(config.time, cc.p(0, 0)));
							name.string = sprite.name;
							name.stageNum = sprite.stageNum;
							acceptTouch = true;
						}, 1);
						break;
					}
				}

				if (collide) {
					var dw = w / 2 - loc.x;
					var dh = h / 2 - loc.y;
					var x = layer.x + dw;
					var y = layer.y + dh;
					if (x > 0) x = 0; // 约束
					if (y > 0) y = 0;
					if (x < limitX) x = limitX;
					if (y < limitY) y = limitY;
					layer.runAction(cc.moveTo(1, cc.p(x, y)));
					layerInfo.runAction(cc.moveTo(config.time, cc.p(0, -h / 8)));
				}
			},
		}, bg);

		var y0 = layerInfo.height;
		var corner = cc.Sprite.create(res.sprite, cc.rect(0, 302, 12, 14));
		corner.attr({
			y: y0,
			anchorX: 0,
			anchorY: 1,
			scale: scale,
		});
		layerInfo.addChild(corner);
		corner = cc.Sprite.create(res.sprite, cc.rect(0, 302, 12, 14));
		corner.attr({
			x: w,
			y: y0,
			anchorX: 1,
			anchorY: 1,
			flippedX: true,
			scale: scale,
		});
		layerInfo.addChild(corner);
		corner = cc.Sprite.create(res.sprite, cc.rect(0, 302, 12, 14));
		corner.attr({
			anchorX: 0,
			anchorY: 0,
			flippedY: true,
			scale: scale,
		});
		layerInfo.addChild(corner);
		corner = cc.Sprite.create(res.sprite, cc.rect(0, 302, 12, 14));
		corner.attr({
			x: w,
			anchorX: 1,
			anchorY: 0,
			flippedX: true,
			flippedY: true,
			scale: scale,
		});
		layerInfo.addChild(corner);

		var line = cc.Sprite.create(res.sprite, cc.rect(14, 302, 1, 6));
		line.attr({
			x: w / 2,
			y: y0,
			anchorY: 1,
			scaleX: w - 24 * scale,
			scaleY: scale,
		});
		layerInfo.addChild(line);
		line = cc.Sprite.create(res.sprite, cc.rect(14, 302, 1, 6));
		line.attr({
			x: w / 2,
			anchorY: 0,
			flippedY: true,
			scaleX: w - 24 * scale,
			scaleY: scale,
		});
		layerInfo.addChild(line);
		line = cc.Sprite.create(res.sprite, cc.rect(0, 318, 6, 1));
		line.attr({
			y: y0 / 2,
			anchorX: 0,
			scaleX: scale,
			scaleY: y0 - 28 * scale,
		});
		layerInfo.addChild(line);
		line = cc.Sprite.create(res.sprite, cc.rect(0, 318, 6, 1));
		line.attr({
			x: w,
			y: y0 / 2,
			anchorX: 1,
			flippedX: true,
			scaleX: scale,
			scaleY: y0 - 28 * scale,
		});
		layerInfo.addChild(line);

		var name = cc.LabelTTF.create('', '黑体', 16 * scale);
		name.attr({
			x: w / 2,
			y: y0 / 2,
			fillStyle: funcColor('#000000'),
		});
		layerInfo.addChild(name);
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				var target = e.getCurrentTarget();
				if (target != name) return false;

				var loc = target.convertToNodeSpace(touch.getLocation());
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);
				if (!cc.rectContainsPoint(rect, loc)) return false;

				name.runAction(cc.RepeatForever.create(cc.Blink.create(1, 5)));
				name.scheduleOnce(function() {
					mask.color = funcColor('#ffffff');
					mask.runAction(cc.FadeIn.create(0.5));
					name.scheduleOnce(function() {
						control.stageNum = name.stageNum;
						var noFight = control.stageData[control.stageNum].noFight;
						if (!noFight) cc.director.pushScene(new sceneMain());
					}, 0.5);
				}, 0.5);
			}
		}, name);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeListener(cc.EventListener.TOUCH_ONE_BY_ONE);
	},
});
