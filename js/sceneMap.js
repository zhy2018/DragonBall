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
		var bg = cc.Sprite.create(res.bg, funcRect(rectData.bg.map.bg));
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
			// y: -h / 8,
		});
		this.addChild(layerInfo);

		// 蒙层
		var mask = cc.LayerColor.create(funcColor('#000000'), w, h);
		funcReturnView(this, mask, true);
		this.addChild(mask);
		mask.runAction(cc.fadeOut(0.5));

		// 地点
		var data = stageData;
		var size = 40;
		var rect = rectData.sprite.map.site;
		for (var i = 0; i < data.length; i += 1) {
			var item = data[i];
			rect[0] = i <= control.stageLimit ? (i + 1) * size : 0;
			var sprite = cc.Sprite.create(res.sprite, funcRect(rect));
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
		var heroName = game.hero.name;
		var act = aniData[heroName].frameData.站立_正面;
		var areaData = act.data;
		var area = areaData[0].area.split(',');
		var hero = cc.Sprite.create(res[heroName], funcRect(area));
		hero.attr({
			x: data[control.stageLimit].mapX,
			y: bg.height - Math.abs(data[control.stageLimit].mapY),
			anchorY: 0,
			stageNum: control.stageLimit,
		});
		layer.addChild(hero);
		var aniStand = cc.Animation.create();
		for (var i = 0; i < areaData.length; i += 1) {
			area = areaData[i].area.split(',');
			var frame = cc.SpriteFrame.create(res[heroName], funcRect(area));
			aniStand.addSpriteFrame(frame);
		}
		aniStand.setDelayPerUnit(act.delay);
		hero.runAction(cc.repeatForever(cc.animate(aniStand)));

		var eventType = 'click'; // click or drag
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch) {
				if (control.lockOption) return false;

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
					if (sprite.stageNum > control.stageLimit) continue;

					var spriteLeft = sprite.x - sprite.width / 2;
					var spriteRight = sprite.x + sprite.width / 2;
					var spriteBottom = bg.height - Math.abs(sprite.y);
					var spriteTop = spriteBottom + sprite.height;
					collide = loc0.x >= spriteLeft && loc0.x <= spriteRight &&
										loc0.y <= spriteTop && loc0.y >= spriteBottom;
					if (!collide) continue;
					if (sprite.stageNum === hero.stageNum) break;

					var heroName = game.hero.name;
					var act = aniData[heroName].frameData.行走;
					var areaData = act.data;
					var aniGo = cc.Animation.create();
					for (var i = 0; i < areaData.length; i += 1) {
						var area = areaData[i].area.split(',');
						var frame = cc.SpriteFrame.create(res[heroName], funcRect(area));
						aniGo.addSpriteFrame(frame);
					}
					aniGo.setDelayPerUnit(act.delay);
					control.lockOption = true;
					hero.flippedX = sprite.x < hero.x;
					hero.stopAllActions();
					var callFunc0 = cc.callFunc(function() {
						hero.runAction(cc.repeatForever(cc.animate(aniGo)));
					});
					var jumpTo = cc.jumpTo(1, cc.p(sprite.x, spriteBottom), 40, 1);
					var callFunc1 = cc.callFunc(function() {
						hero.stageNum = sprite.stageNum;
						hero.stopAllActions();
						hero.runAction(cc.repeatForever(cc.animate(aniStand)));
						// 底部弹出消息框
						layerInfo.runAction(cc.moveTo(config.time, cc.p(0, 0)));
						name.string = sprite.name;
						control.lockOption = false;
					});
					hero.runAction(cc.sequence(callFunc0, jumpTo, callFunc1));
					break;
				}

				if (collide && sprite.stageNum !== hero.stageNum) {
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
		var corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.corner));
		corner.attr({
			y: y0,
			anchorX: 0,
			anchorY: 1,
			scale: scale,
		});
		layerInfo.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.corner));
		corner.attr({
			x: w,
			y: y0,
			anchorX: 1,
			anchorY: 1,
			flippedX: true,
			scale: scale,
		});
		layerInfo.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.corner));
		corner.attr({
			anchorX: 0,
			anchorY: 0,
			flippedY: true,
			scale: scale,
		});
		layerInfo.addChild(corner);
		corner = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.corner));
		corner.attr({
			x: w,
			anchorX: 1,
			anchorY: 0,
			flippedX: true,
			flippedY: true,
			scale: scale,
		});
		layerInfo.addChild(corner);

		var line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.line0));
		line.attr({
			x: w / 2,
			y: y0,
			anchorY: 1,
			scaleX: w - 24 * scale,
			scaleY: scale,
		});
		layerInfo.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.line0));
		line.attr({
			x: w / 2,
			anchorY: 0,
			flippedY: true,
			scaleX: w - 24 * scale,
			scaleY: scale,
		});
		layerInfo.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.line1));
		line.attr({
			y: y0 / 2,
			anchorX: 0,
			scaleX: scale,
			scaleY: y0 - 28 * scale,
		});
		layerInfo.addChild(line);
		line = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.map.line1));
		line.attr({
			x: w,
			y: y0 / 2,
			anchorX: 1,
			flippedX: true,
			scaleX: scale,
			scaleY: y0 - 28 * scale,
		});
		layerInfo.addChild(line);

		var name = cc.LabelTTF.create('', 'Arial', 16 * scale);
		name.attr({
			x: w / 2,
			y: y0 / 2,
			lineWidth: 1,
			strokeStyle: funcColor('#000000'),
			fillStyle: funcColor('#000000'),
			string: data[control.stageLimit].name,
		});
		layerInfo.addChild(name);
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, e) {
				if (control.lockOption) return false;

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
						control.stageNum = hero.stageNum;
						control.story = stageData[control.stageNum].before;
						control.storyAt = control.story ? 'before' : 'after';
						var scene = control.story ? control.scene.dialog : control.scene.main;
						cc.director.pushScene(scene);
					}, 0.5);
				}, 0.5);
			}
		}, name);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeAllListeners();
	},
});
