var config, res;
var control = {
	winWidth: 0,
	winHeight: 0,
	zoom: 1, // 格子的缩放倍数
	mapSize: 9, // 地图大小(正方形, 每行或每列里的格子个数)
	maps: [],
	layerScene: {},
	roles: {},
	roleNum: 4,
	firstRole: false, // 第一次点击的格子(首次, 之前的)
	currentRole: false, // 第二次点击的格子(当前的)
	acceptTouch: false, // 是否响应触控事件
	touchListener: {}, // 触控事件
	stageNum: 1,
	stageData: {},
	scaleUI: 2,
};
var game = {
	hero: {
		name: '小悟空',
		hp: 0,
		mp: 0,
		mpGather: 0,
		dp: 0,
		status: 'ok',
	},
};

// 执行入口
window.onload = function() {
	cc.game.onStart = function() {
		cc.view.adjustViewPort(true);
		cc.view.resizeWithBrowserSize(true);
		var w = window.innerWidth;
		var h = window.innerHeight;
		cc.view.setDesignResolutionSize(w < h ? w : h, h > w ? h : w, cc.ResolutionPolicy.SHOW_ALL);

		cc.loader.loadJson('config.json', function(_, data) {
			config = data;
			cc.loader.loadJson(config.resPath + 'json/resources.json', function(_, data) {
				res = data;
				var resData = [];
				for (var i in res) {
					res[i] = config.resPath + res[i];
					resData.push(res[i]);
				}

				cc.LoaderScene.preload(resData, function() {
					cc.director.runScene(new sceneWelcome());
				}, this);
			});
		});
	};
	cc.game.run("gameCanvas");
};
