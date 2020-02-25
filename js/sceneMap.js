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

		var mask = cc.LayerColor.create(funcColor('#000000'), w, h);
		this.addChild(mask);
		mask.runAction(cc.fadeOut(0.5));

		var data = [
			[40, 156, '悟空的家'],
			[88, 230, '海边龟屋'],
			[112, 168, '乌龙的村子'],
			[48, 64, '荒野'],
			[132, 72, '火焰山'],
			[172, 156, '比拉夫城'],
			[132, 264, '修行的岛'],
			[232, 188, '天下第一武道会会场'],
			[232, 72, '玛斯鲁高塔'],
			[336, 64, '海底洞窟'],
			[434, 64, '圣地加林'],
			[434, 132, '红缎带军团基地'],
			[336, 132, '占卜婆婆的宫殿'],
			[336, 188, '街道'],
			[284, 264, '都市上空'],
			[336, 264, '弥次郎兵卫的草原'],
			[434, 264, '大总统的都城'],
		];
		var size = 40;
		for (var i = 0; i < data.length; i += 1) {
			var item = data[i];
			var sprite = cc.Sprite.create(res.sprite, cc.rect(i * size, 260, size, size));
			sprite.attr({
				x: item[0],
				y: -item[1],
				anchorY: 0,
			});
			layerSite.addChild(sprite);
		}

		// 精灵
		size = 32;
		var hero = cc.Sprite.create(res.action, cc.rect(0, 168, size, size));
		hero.attr({
			x: data[0][0],
			y: data[0][1],
			anchorY: 0,
		});
		layer.addChild(hero);
		var animation = cc.Animation.create();
		for (var i = 0; i < 4; i += 1) {
			var frame = cc.SpriteFrame.create(res.action, cc.rect(i * size, 168, size, size));
			animation.addSpriteFrame(frame);
		}
		animation.setDelayPerUnit(0.2);
		hero.runAction(cc.repeatForever(cc.animate(animation)));

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch) {
				var loc = touch.getLocation();
				layer.attr({
					offsetWidth: loc.x - layer.x,
					offsetHeight: loc.y - layer.y,
				});
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
			},
			onTouchEnded: function() {
				layer.attr({
					offsetWidth: 0,
					offsetHeight: 0,
				});
			},
		}, bg);
	},
	onExit: function() {
		this._super();
		cc.eventManager.removeListener(cc.EventListener.TOUCH_ONE_BY_ONE);
	},
});
