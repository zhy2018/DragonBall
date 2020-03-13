// 三消核心玩法实现
// 暂未实现: 打乱(重新洗牌), 检查是否死局

// 初始化舞台上的所有格子
function funcInitStage() {
	var tileSize = config.tileSize, cellSize = config.cellSize;
	var data = stageData[control.stageNum - 1];
	if (data) control.maps = data.map || [];
	else control.maps = [];
	var maps = control.maps;
	var w = control.winWidth, h = control.winHeight;

	if (maps.length === 0) {
		// 生成一张随机地图
		for (var i = 0; i < control.mapSize; i += 1) {
			maps.push([]);
			for (var j = 0; j < control.mapSize; j += 1) {
				var n = funcRand(control.cellUpper);
				if (
					(i >= 2 && n === maps[i - 1][j][0] && n === maps[i - 2][j][0]) ||
					(j >= 2 && n === maps[i][j - 1][0] && n === maps[i][j - 2][0]) ||
					(i >= 1 && j >= 1 && n === maps[i - 1][j][0] && n === maps[i][j - 1][0] && n === maps[i - 1][j - 1][0])
				) {
					n = funcRand(control.cellUpper, n);
				}
				maps[i].push([n, 1]);
			}
		}
	} else {
		control.mapSize = maps.length;
		var newMap = [];
		for (var i = 0; i < maps.length; i += 1) {
			newMap.push([]);
			for (var j = 0; j < maps[i].length; j += 1) {
				var n = maps[i][j] - 0;
				newMap[i].push([n, 1]);
			}
		}
		maps = newMap;
	}

	var layerStage = control.layer.stage;
	layerStage.attr({ height: w });
	control.cells = {};

	// 计算格子的缩放倍数
	control.zoom = w / config.mapSizeLimit / tileSize;
	control.zoom = control.zoom.toFixed(2) - 0;
	var zoom = control.zoom;

	// 格子的触控事件
	cc.eventManager.addListener(cc.EventListener.create({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		onTouchBegan: function(touch, e) {
			if (!control.acceptTouch || control.lockOption) return false;
			var target = e.getCurrentTarget();
			var loc  = target.convertToNodeSpace(touch.getLocation());
			var size = target.getContentSize();
			var rect = cc.rect(0, 0, size.width, size.height);
			if (!cc.rectContainsPoint(rect, loc)) return false;

			var row = parseInt(loc.x / tileSize / zoom);
			var col = parseInt(loc.y / tileSize / zoom);
			var fixX = Math.round(row * tileSize * zoom + tileSize * zoom / 2);
			var fixY = Math.round(col * tileSize * zoom + tileSize * zoom / 2);
			border.attr({
				x: fixX,
				y: fixY,
				visible: true,
			});

			control.currentCell = control.cells[row + '_' + col];
			funcPress();
			return true;
		},
		onTouchMoved: function(touch, e) {
			if (!control.acceptTouch || control.lockOption) return false;
			var target = e.getCurrentTarget();
			var loc  = target.convertToNodeSpace(touch.getLocation());
			var size = target.getContentSize();
			var rect = cc.rect(0, 0, size.width, size.height);
			if (!cc.rectContainsPoint(rect, loc)) return false;
			if (!border.visible) return false;

			var row = parseInt(loc.x / tileSize / zoom);
			var col = parseInt(loc.y / tileSize / zoom);

			control.currentCell = control.cells[row + '_' + col];
			funcPress();
		},
	}), layerStage);

	// 格子的背景
	var layerStageBg = cc.Layer.create();
	layerStageBg.attr({
		width: w,
		height: w,
	});
	layerStage.addChild(layerStageBg);

	// 格子里的东西
	var layerStageCell = cc.Layer.create();
	layerStageCell.attr({
		width: w,
		height: w,
	});
	layerStage.addChild(layerStageCell);

	// 格子的选择框
	var border = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.border));
	border.attr({
		scale: zoom,
		visible: false,
	});
	layerStage.addChild(border);

	var rect = rectData.sprite.main.cell;
	for (var i = 0; i < maps.length; i += 1) {
		for (var j = 0; j < maps[i].length; j += 1) {
			if (!maps[i][j][1]) continue;

			var num = maps[i][j][0];
			var x = Math.round((tileSize * i + tileSize / 2) * zoom);
			var y = Math.round((tileSize * j + tileSize / 2) * zoom);

			var bg = cc.Sprite.create(res.sprite, funcRect(rectData.sprite.main.cellBg));
			bg.attr({
				x: x,
				y: y,
				scale: zoom,
				opacity: 240,
			});
			layerStageBg.addChild(bg);

			rect[0] = num * cellSize;
			var cell = cc.Sprite.create(res.sprite, funcRect(rect));
			cell.attr({
				x: x,
				y: y,
				scale: zoom,
				tag: num,
			});
			layerStageCell.addChild(cell);
			control.cells[i + '_' + j] = cell;
		}
	}

	control.maps = maps;
}

// 格子的按下事件
function funcPress() {
	var cell = control.currentCell, cell0 = control.firstCell, zoom = control.zoom;
	var size = config.tileSize;
	var row = parseInt(cell.x / size / zoom);
	var col = parseInt(cell.y / size / zoom);
	var row0 = parseInt(cell0.x / size / zoom);
	var col0 = parseInt(cell0.y / size / zoom);
	// cc.log(row, col, cell.tag);

	if (!cell0) {
		control.firstCell = cell;
		return;
	}
	if (cell === cell0) return;

	// 是否相邻
	if (
		(row === row0 && (col === col0 - 1 || col === col0 + 1)) ||
		(col === col0 && (row === row0 - 1 || row === row0 + 1))
	) {
			if (cell.tag === cell0.tag) {
				funcCancel(cell);
				return;
			}

			// 临时交换, 方便下面的检测
			var maps = control.maps;
			var temp = maps[row][col];
			maps[row][col] = maps[row0][col0];
			maps[row0][col0] = temp;

			var result = funcCheck();
			if (!result) {
				// 检测到没有连续再换回去(恢复)
				maps[row0][col0] = maps[row][col];
				maps[row][col] = temp;
				funcCancel(cell);
				return;
			}

			// 存在连续
			var cells = control.cells;
			var tempCell = cells[row + '_' + col];
			cells[row + '_' + col] = cells[row0 + '_' + col0];
			cells[row0 + '_' + col0] = tempCell;
			funcSwitch(cell, funcRemove);
	} else control.firstCell = cell;
}

// 取消两个格子位置的交换
function funcCancel(cell) {
	var cell0 = control.firstCell;
	var border = control.layer.stage.children[2];
	border.attr({ visible: false });
	var time = config.time;
	var x0 = cell0.x;
	var y0 = cell0.y;
	var x1 = cell.x;
	var y1 = cell.y;

	var moveTo0 = cc.moveTo(time, cc.p(x0, y0));
	var moveTo1 = cc.moveTo(time, cc.p(x1, y1));
	cell.runAction(moveTo0);
	cell.scheduleOnce(function() {
		cell.runAction(moveTo1);
	}, time);

	control.acceptTouch = false; // 暂时忽略触控的响应, 防止出现bug
	cell0.runAction(moveTo1);
	cell0.scheduleOnce(function() {
		cell0.runAction(moveTo0);
		cell0.scheduleOnce(function() {
			control.firstCell = false;
			control.acceptTouch = true; // 恢复触控的响应
		}, time + 0.1);
	}, time);
}

// 交换两个格子的位置
function funcSwitch(cell, cb) {
	var cell0 = control.firstCell;
	var border = control.layer.stage.children[2];
	border.attr({ visible: false });
	var time = config.time;
	var x0 = cell0.x;
	var y0 = cell0.y;
	var x1 = cell.x;
	var y1 = cell.y;

	control.acceptTouch = false; // 暂时忽略触控的响应, 防止出现bug
	var callFunc = cc.callFunc(function() {
		cb();
		control.firstCell = false;
		control.acceptTouch = true; // 恢复触控的响应
	});
	var moveTo = cc.moveTo(time, cc.p(x1, y1));
	var sequ = cc.sequence(moveTo, callFunc);
	cell.runAction(cc.moveTo(time, cc.p(x0, y0)));
	cell0.runAction(sequ);
}

// 检查是否存在连续, 并予以标记
function funcCheck() {
	var result = false;
	var maps = control.maps, cell = control.currentCell, zoom = control.zoom;
	var cellSize = config.cellSize, tileSize = config.tileSize;
	var row = parseInt(cell.x / zoom / tileSize);
	var col = parseInt(cell.y / zoom / tileSize);
	var cell0 = control.firstCell;
	var row0 = -1, col0 = -1;

	if (cell0) {
		row0 = parseInt(cell0.x / zoom / tileSize);
		col0 = parseInt(cell0.y / zoom / tileSize);
	}

	for (var i = 0; i < maps.length; i += 1) {
		for (var j = 0; j < maps[i].length; j += 1) {
			// 横向检查
			var items = [[i, j]];
			for (var k = 1; k <= 4; k += 1) {
				if (maps[i + k] && maps[i + k][j] && maps[i][j][0] === maps[i + k][j][0])
					items.push([i + k, j]);
				else break;
			}
			if (items.length >= 3) {
				result = true;
				for (var l = 0; l < items.length; l += 1) {
					var item = items[l];
					maps[item[0]][item[1]][1] = -1; // 打上移除标记
				}
			}

			// 纵向检查
			items = [[i, j]];
			for (var k = 1; k <= 4; k += 1) {
				if (maps[i][j + k] && maps[i][j][0] === maps[i][j + k][0])
					items.push([i, j + k]);
				else break;
			}
			if (items.length >= 3) {
				result = true;
				for (var l = 0; l < items.length; l += 1) {
					var item = items[l];
					maps[item[0]][item[1]][1] = -1; // 打上移除标记
				}
			}

		}
	}

	return result;
}

// 移除连续的格子(带有移除标记的格子)
function funcRemove() {
	var maps = control.maps, cells = control.cells, zoom = control.zoom;
	var layer = control.layer.stage.children[1];
	var time = config.time, cellSize = config.cellSize;

	var sum = [];
	for (var i = 0; i < control.cellUpper; i += 1) {
		sum.push(0);
	}

	// 移除的动画
	for (var i = 0; i < maps.length; i += 1) {
		for (var j = 0; j < maps[i].length; j += 1) {
			var item = maps[i][j];
			if (item[1] >= 1) continue;

			// 只对标记为负数的格子做移除动画
			var cell = cells[i + '_' + j];
			cell.zIndex = 1;
			var scaleTo = cc.scaleTo(time, zoom * 1.33);
			var fadeOut = cc.fadeOut(time);
			cell.runAction(cc.sequence(scaleTo, fadeOut));

			sum[item[0]] += 1;
		}
	}

	control.acceptTouch = false; // 暂时忽略触控的响应, 防止出现bug
	layer.scheduleOnce(function() {
		control.acceptTouch = true; // 恢复触控的响应

		for (var i = 0; i < maps.length; i += 1) {
			for (var j = 0; j < maps[i].length; j += 1) {
				var item = maps[i][j];
				if (item[1] !== -1) continue;

				// 移除实体
				var cell = cells[i + '_' + j];
				layer.removeChild(cell);
				delete cells[i + '_' + j];
			}
		}

		funcFall();
	}, time * 2 + 0.1);

	var mapping = [0, 'dp', 'hp', 'mp'];
	var hero = game.hero;
	for (var i = 1; i < control.cellUpper; i += 1) {
		if (sum[i] === 0) continue;

		var value = hero[mapping[i]];
		var valueFull = hero[mapping[i] + 'Full'];
		value += config[mapping[i] + 'Step'] * sum[i];
		if (value > valueFull) value = valueFull;
		hero[mapping[i]] = value;
		funcUpdateUI(mapping[i]);
	}
}

// 移除后要将浮空的格子落地
function funcFall() {
	var maps = control.maps, zoom = control.zoom;
	var cells = control.cells;
	var layer = control.layer.stage.children[1];
	var time = config.time, tileSize = config.tileSize;
	var distance = 0, distanceMax = 0;

	for (var i = 0; i < maps.length; i += 1) {
		var x = Math.round((tileSize * i + tileSize / 2) * zoom);
		var y = Math.round(tileSize / 2 * zoom);
		distance = 0;

		for (var j = 0; j < maps[i].length; j += 1) {
			if (maps[i][j][1] === -1) {
				distance += 1;
				if (distance > distanceMax) distanceMax = distance;
			} else if (distance) {
				y = Math.round((tileSize * (j - distance) + tileSize / 2) * zoom);
				var cell = cells[i + '_' + j];
				if (!cell) continue;

				cells[i + '_' + (j - distance)] = cell;
				layer.removeChild(cell);
				delete cells[i + '_' + j];
				var cell1 = cells[i + '_' + (j - distance)];
				layer.addChild(cell1);
				cell1.runAction(cc.moveTo(time * distance, cc.p(x, y)));
			}
		}
	}

	// 移除maps
	for (var i = 0; i < maps.length; i += 1) {
		for (var j = 0; j < maps[i].length; j += 1) {
			if (maps[i][j][1] === -1) {
				maps[i].splice(j, 1);
				j = -1; // 数组内容移除后需要重头再次检查有无连续的格子
			}
		}
	}

	// 移除后检查是否存在连续的格子
	control.acceptTouch = false; // 暂时忽略触控的响应, 防止出现bug
	layer.scheduleOnce(function() {
		control.acceptTouch = true; // 恢复触控的响应
		var result = funcCheck();
		if (result) funcRemove();
		else funcFill();
	}, time * distanceMax);
}

// 移除后需要补满
function funcFill() {
	var maps = control.maps, cells = control.cells;
	var layer = control.layer.stage.children[1];
	var time = config.time, tileSize = config.tileSize, cellSize = config.cellSize;
	var mapSize = control.mapSize, zoom = control.zoom;
	var distance = 0, distanceMax = 0;

	var rect = rectData.sprite.main.cell;
	for (var i = 0; i < maps.length; i += 1) {
		distance = mapSize - maps[i].length;
		if (distance > distanceMax) distanceMax = distance;
		for (var j = maps[i].length, k = 0; j < mapSize; j += 1, k += 1) {
			var num = funcRand(control.cellUpper);
			maps[i].push([num, 1]);

			var x = Math.round((tileSize * i + tileSize / 2) * zoom);
			var y0 = Math.round((tileSize * (mapSize + k) + tileSize / 2) * zoom);
			var y1 = Math.round((tileSize * j + tileSize / 2) * zoom);

			rect[0] = num * cellSize;
			var cell = cc.Sprite.create(res.sprite, funcRect(rect));
			cell.attr({
				x: x,
				y: y0,
				scale: zoom,
				tag: num,
			});
			layer.addChild(cell);
			control.cells[i + '_' + j] = cell;
			cell.runAction(cc.moveTo(time * distance, cc.p(x, y1)));
		}
	}

	// 补满后检查是否存在连续的格子
	control.acceptTouch = false; // 暂时忽略触控的响应, 防止出现bug
	layer.scheduleOnce(function() {
		control.acceptTouch = true; // 恢复触控的响应
		var result = funcCheck();
		if (result) funcRemove();
	}, time * distanceMax);
}
