var config, res, rectData, stageData, aniData;
var control = {
	winWidth: 0,
	winHeight: 0,
	zoom: 1, // 格子的缩放倍数
	mapSize: 9, // 地图大小(正方形, 每行或每列里的格子个数)
	maps: [],
	layer: {
		floor: {},
		bg: {},
		ui: {},
		stage: {},
		fight: {},
		info: {},
		mask: {},
	},
	cells: {},
	cellUpper: 4, // n种物品可供点击
	firstCell: false, // 第一次点击的格子(首次, 之前的)
	currentCell: false, // 第二次点击的格子(当前的)
	acceptTouch: false, // 是否响应触控事件
	lockOption: false, // 锁定玩家的所有操作
	stageNum: 0,
	stageLimit: 0,
	sceneNum: 0,
	scaleUI: 1,
	scene: {
		welcome: {},
		map: {},
		main: {},
		dialog: {},
	},
	story: '', // 当前故事
	storyAt: 'before' // before or after,
};
var game = {
	hero: {
		name: '小悟空',
		hp: 0,
		mp: 0,
		mpGather: 0,
		dp: 0,
		status: 'stand',
		hitPhase: 0, // 第n段打击
		hitUpper: 0, // 共n段打击
		hitCount: 0, // 连击数
		ani: {
			stand: {},
			hit3: {},
			hit4: {},
			hit5: {},
		},
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

		var winSize = cc.director.getWinSize();
		w = winSize.width;
		h = winSize.height;
		control.winWidth = w;
		control.winHeight = h;

		control.scene = {
			welcome: new sceneWelcome(),
			map: new sceneMap(),
			main: new sceneMain(),
			dialog: new sceneDialog(),
		};

		cc.loader.loadJson('config.json', function(_, data) {
			config = data;
			cc.loader.loadJson('resources.json', function(_, data) {
				res = data;
				var resData = [];
				for (var i in res) {
					res[i] = config.resPath + res[i];
					resData.push(res[i]);
				}

				cc.LoaderScene.preload(resData, function(_, data) {
					var work = 111;
					// 加载关卡数据
					cc.loader.loadJson(res.stage, function(_, data) {
						stageData = data;
						var probe = localStorage.getItem(funcEncrypt('stageLimit'));
						if (probe) control.stageLimit = funcDecryption(probe) - 0;
						funcCheckWork(work -= 1);
					});

					// 加载rect数据
					cc.loader.loadJson(res.rect, function(_, data) {
						rectData = data;
						funcCheckWork(work -= 10);
					});

					// 加载帧动画数据
					cc.loader.loadJson(res.animation, function(_, data) {
						aniData = data;
						funcCheckWork(work -= 100);
					});

					function funcCheckWork(work) {
						if (work === 0) cc.director.runScene(control.scene.welcome); // 载入首个场景
					}
				}, this);
			});
		});
	};
	cc.game.run("gameCanvas");
};
