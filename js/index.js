var token = '9c216cb98bed999f2ef70e3acf0190df'
// 服务域名
var tdtUrl = 'https://t{s}.tianditu.gov.cn/'
// 服务负载子域
var subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']

var imgMap = new Cesium.UrlTemplateImageryProvider({
	url: tdtUrl + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + token,
	// url: "https://maponline1.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20200604",
	subdomains: subdomains,
	tilingScheme: new Cesium.WebMercatorTilingScheme(),
	maximumLevel: 18,
})



//北京部分地形  "https://291wk99274.imdo.co/terrain/UBd2N8cd"
//辽宁部分地形 https://291wk99274.imdo.co/terrain/vEfTzfee
//山西省地形 https://291wk99274.imdo.co/terrain/jz9a7fEd
//
// var terrainProvider = new Cesium.CesiumTerrainProvider({
// 	url: "https://291wk99274.imdo.co/terrain/UBd2N8cd",
// });

var viewer;

$(function() {
	init();
	setTimeout(function() {
		$(".cesium-widget-credits").hide();
	}, 5000);
})

var onTickCallback;

// cesium 初始化
function init() {
	viewer = new Cesium.Viewer("cesiumContainer", {
		imageryProvider: imgMap,
		// terrainProvider: terrainProvider,
		contextOptions: {
			webgl: {
				alpha: true
			}
		},
		creditContainer: "cesiumContainer",
		selectionIndicator: false,
		geocoder: false, //是否显示地名查找控件
		navigationHelpButton: true, //是否显示帮助信息控件
		infoBox: true, //是否显示点击要素之后显示的信息
		homeButton: false, //首页位置，点击之后将视图跳转到默认视角。
		sceneModePicker: true, //切换2D、3D 和 Columbus View (CV) 模式。
		baseLayerPicker: false, //选择三维数字地球的底图（imagery and terrain）。
		animation: false, //控制视窗动画的播放速度。
		creditsDisplay: false, //展示商标版权和数据源。
		timeline: false, //展示当前时间和允许用户在进度条上拖动到任何一个指定的时间。
		fullscreenButton: true, //视察全屏按钮
		shadows: true,
		shouldAnimate: false,
		scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
		clock: new Cesium.Clock({
			currentTime: Cesium.JulianDate.fromDate(new Date())
		})
	});

	viewer.scene.globe.enableLighting = true; //启用以太阳为光源的地球

	// 抗锯齿
	viewer.scene.postProcessStages.fxaa.enabled = false
	// 水雾特效
	viewer.scene.globe.showGroundAtmosphere = true
	// 设置最大俯仰角，[-90,0]区间内，默认为-30，单位弧度
	viewer.scene.screenSpaceCameraController.constrainedPitch = Cesium.Math.toRadians(
		-20
	)
	// 叠加国界服务
	var iboMap = new Cesium.UrlTemplateImageryProvider({
		url: tdtUrl + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + token,
		subdomains: subdomains,
		tilingScheme: new Cesium.WebMercatorTilingScheme(),
		maximumLevel: 18,
	})
	viewer.imageryLayers.addImageryProvider(iboMap)

	// 叠加影像注记
	var cia = new Cesium.UrlTemplateImageryProvider({
		url: tdtUrl + 'DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=' + token,
		subdomains: subdomains,
		tilingScheme: new Cesium.WebMercatorTilingScheme(),
		maximumLevel: 18,
	})
	viewer.imageryLayers.addImageryProvider(cia)

	// 叠加地形注记
	var cta_w = new Cesium.UrlTemplateImageryProvider({
		url: tdtUrl + 'DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=' + token,
		subdomains: subdomains,
		tilingScheme: new Cesium.WebMercatorTilingScheme(),
		maximumLevel: 18,
	})
	viewer.imageryLayers.addImageryProvider(cta_w)

	// 叠加地形服务
	// var terrainUrls = new Array()
	// for (var i = 0; i < subdomains.length; i++) {
	// 	var url =
	// 		tdtUrl.replace('{s}', subdomains[i]) +
	// 		'DataServer?T=elv_c&tk=' +
	// 		token
	// 	terrainUrls.push(url)
	// }
	// var provider = new Cesium.GeoTerrainProvider({
	// 	urls: terrainUrls,
	// })
	// viewer.terrainProvider = provider



	//坐标监听
	new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
		.setInputAction((movement) => {
			const pick = viewer.scene.pick(movement.position);
			if (pick && pick.id) {
				if (pick.id.name.indexOf("监控画面") != -1) {
					showPop(pick, movement, pick.id.info);
				} else

				if (pick.id.name == "甬子峪基站监控") {
					showPop(pick, movement, pick.id.info);
				}
			} else {
				$("#trackPopUp").hide();
			}
			console.log("屏幕坐标:", movement);
			var windowPosition = viewer.camera.getPickRay(movement.position);
			var cartesianCoordinates = viewer.scene.globe.pick(windowPosition, viewer.scene);
			var cartoCoordinates = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianCoordinates);
			console.log("经纬坐标:", Cesium.Math.toDegrees(cartoCoordinates.longitude) +
				"," +
				Cesium.Math.toDegrees(cartoCoordinates.latitude) +
				"," +
				Cesium.Math.toDegrees(cartoCoordinates.height));
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);


	// tdtLayer = new Cesium.ArcGisMapServerImageryProvider({
	// 	url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
	// })
	// viewer.imageryLayers.addImageryProvider(tdtLayer);

	outLine();
	addFloatMarkers();
	outLine();
	drawPoint();
	jumpCh();


	// var options = {};
	// // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
	// options.defaultResetView = Cesium.Rectangle.fromDegrees(80, 22, 130, 50);
	// // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
	// options.enableCompass = true;
	// // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
	// options.enableZoomControls = true;
	// // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
	// options.enableDistanceLegend = true;
	// // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
	// options.enableCompassOuterRing = true;

	// CesiumNavigation.umd(viewer, options);
}




function jumpBx3D(index, number, title) {

	//移除自转
	viewer.clock.onTick.removeEventListener(onTickCallback);
	$($(".dv-border-box-11-title")[0]).text(title);
	var tileset = tilesetArry[index];
	if (!viewer.scene.primitives.contains(tileset)) {
		viewer.scene.primitives.add(tileset);
		tileset.readyPromise.then(function(tileset) {
			//贴地高度
			changeHeight(tileset, number);
			//跳转
			viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -2.0, Math.max(100.0 - tileset.boundingSphere
				.radius, 0.0)));
		}).otherwise(function(error) {
			throw (error);
		});
	} else {
		//跳转
		viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -2.0, Math.max(100.0 - tileset.boundingSphere
			.radius, 0.0)));
	}

}

function changeHeight(tileset, height) {
	height = Number(height);
	if (isNaN(height)) {
		return;
	}
	var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
	var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
	var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
	var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
	tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}


// var tileset = new Cesium.Cesium3DTileset({
// 	url: "https://291wk99274.imdo.co/model/tpZlTYHrl/tileset.json",

// });

// function jumpZz3D() {
// 	//移除自转
// 	viewer.clock.onTick.removeEventListener(onTickCallback);
// 	viewer.scene.primitives.add(tileset);
// 	tileset.readyPromise.then(function(tileset) {
// 		// viewer.camera.flyTo({
// 		// 	destination: Cesium.Cartesian3.fromDegrees(113.61783953714115,34.74771262209953,
// 		// 		1000),
// 		// 	orientation: {
// 		// 		heading: Cesium.Math.toRadians(348.4202942851978),
// 		// 		pitch: Cesium.Math.toRadians(-89.74026687972041),
// 		// 		roll: Cesium.Math.toRadians(0),
// 		// 	},
// 		// 	complete: function callback() {
// 		// 		// 定位完成之后的回调函数
// 		// 	},
// 		// })
// 		viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -2.0, Math.max(100.0 - tileset.boundingSphere
// 			.radius, 0.0)));
// 	}).otherwise(function(error) {
// 		throw (error);
// 	});
// }

function jumpTj3D() {
	//移除自转
	viewer.clock.onTick.removeEventListener(onTickCallback);
	var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
		Cesium.Cartesian3.fromDegrees(116.37474929425434, 39.91338526254541,
			-10));
	var model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
		url: 'https://a.amap.com/jsapi_demos/static/gltf-online/shanghai/scene.gltf',
		modelMatrix: modelMatrix,
		scale: 200.0
	}));

	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(116.37509411981267, 39.90848176328027,
			800),
		orientation: {
			heading: Cesium.Math.toRadians(348.4202942851978),
			pitch: Cesium.Math.toRadians(-50.74026687972041),
			roll: Cesium.Math.toRadians(10),
		},
		complete: function callback() {
			// 定位完成之后的回调函数
		},
	})


	// var tileset = new Cesium.Cesium3DTileset({
	// 	url: "https://291wk99274.imdo.co/model/tlxSJfi2n/tileset.json",
	// });
	// viewer.scene.primitives.add(tileset);
	// tileset.readyPromise.then(function(tileset) {
	// 	viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -2.0, Math.max(100.0 - tileset.boundingSphere
	// 		.radius, 0.0)));
	// }).otherwise(function(error) {
	// 	throw (error);
	// });
}

function jumpAm3D() {
	//移除自转
	viewer.clock.onTick.removeEventListener(onTickCallback);

	// var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
	// 	Cesium.Cartesian3.fromDegrees(116.37474929425434, 39.91338526254541,
	// 		-10));
	// var model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
	// 	// url: 'img/BoxUnlit.gltf',
	// 	url: 'img/skp.skp',
	// 	modelMatrix: modelMatrix,
	// 	scale: 200.0
	// }));


	// viewer.camera.flyTo({
	// 	destination: Cesium.Cartesian3.fromDegrees(116.37509411981267,39.90848176328027,
	// 		800),
	// 	orientation: {
	// 		heading: Cesium.Math.toRadians(348.4202942851978),
	// 		pitch: Cesium.Math.toRadians(-50.74026687972041),
	// 		roll: Cesium.Math.toRadians(10),
	// 	},
	// 	complete: function callback() {
	// 		// 定位完成之后的回调函数
	// 	},
	// })
	$($(".dv-border-box-11-title")[0]).text("澳门模组");
	var tileset = new Cesium.Cesium3DTileset({
		// url: "https://291wk99274.imdo.co/model/tOMlY72TM/tileset.json",
		url: "http://210.14.146.43:88/aomen/tileset.json",
	});
	viewer.scene.primitives.add(tileset);
	tileset.readyPromise.then(function(tileset) {
		viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -2.0, Math.max(100.0 - tileset.boundingSphere
			.radius, 0.0)));
	}).otherwise(function(error) {
		throw (error);
	});
}
//自转
function rotation() {
	onTickCallback = () => {
		var spinRate = 1;
		var currentTime = viewer.clock.currentTime.secondsOfDay;
		var delta = (currentTime - previousTime) / 1000;
		previousTime = currentTime;
		viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
	}

	viewer.clock.multiplier = 200; //速度
	// viewer.clock.multiplier = 0.1; //速度
	viewer.clock.shouldAnimate = true;
	var previousTime = viewer.clock.currentTime.secondsOfDay;
	viewer.clock.onTick.addEventListener(onTickCallback);
	//监听点击事件，当点击地图时停止旋转
	var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	handler.setInputAction(function(click) {
		viewer.clock.onTick.removeEventListener(onTickCallback);
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
}

function stop() {
	if (!viewer) {
		return
	}
	viewer.clock.multiplier = 0
	viewer.scene.postUpdate.removeEventListener(icrf);
}

//定位到天安门
function jumpbj() {
	$($(".dv-border-box-11-title")[0]).text("测试项目");
	//移除自转
	viewer.clock.onTick.removeEventListener(onTickCallback);
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(116.392726, 39.917500, 1500),
		orientation: {
			heading: Cesium.Math.toRadians(348.4202942851978),
			pitch: Cesium.Math.toRadians(-89.74026687972041),
			roll: Cesium.Math.toRadians(8.5),
		},
		complete: function callback() {
			// 定位完成之后的回调函数
		},
	})
}

// 定位到高程数据
function jumpDem() {
	//移除自转
	viewer.clock.onTick.removeEventListener(onTickCallback);
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(116.02526207105684, 40.05934464798224, 800),
		orientation: {
			heading: Cesium.Math.toRadians(348.4202942851978),
			pitch: Cesium.Math.toRadians(-10.74026687972041),
			roll: Cesium.Math.toRadians(0),
		},
		complete: function callback() {
			// 定位完成之后的回调函数
		},
	})
}

//将三维球定位到中国
function jumpCh() {
	//移除自转
	$($(".dv-border-box-11-title")[0]).text("视图");
	viewer.clock.onTick.removeEventListener(onTickCallback);
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(103.84, 31.15, 11850000),
		orientation: {
			heading: Cesium.Math.toRadians(348.4202942851978),
			pitch: Cesium.Math.toRadians(-89.74026687972041),
			roll: Cesium.Math.toRadians(0),
		},
		complete: function callback() {
			// 定位完成之后的回调函数
		},
	})

	rotation();
}

//绘制框
function outLine() {
	// var outlineOnly = viewer.entities.add({
	// 	name: "Yellow plane outline",
	// 	position: Cesium.Cartesian3.fromDegrees(116.391000, 39.917500, 0),
	// 	plane: {
	// 		plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
	// 		dimensions: new Cesium.Cartesian2(800.0, 800.0),
	// 		fill: false,
	// 		outline: true,
	// 		outlineColor: Cesium.Color.YELLOW,
	// 	},
	// });
	var wyoming = viewer.entities.add({
		name: '项目外围',
		polygon: {
			hierarchy: Cesium.Cartesian3.fromDegreesArray([
				116.38596899610512, 39.921072734638095,
				116.38803025875846, 39.92115066505297,
				116.39031481261138, 39.921278248294215,
				116.39034049251511, 39.92172661673703,
				116.3907639663161, 39.92169768237629,
				116.39082674565616, 39.92128794850156,
				116.39518617305427, 39.921403981245824,
				116.39548691485223, 39.916406152920295,
				116.39567848349525, 39.91238493228448,
				116.39213692754942, 39.91227339853054,
				116.39209648336978, 39.911386820763106,
				116.38998746601186, 39.911271412705275,
				116.38986458347763, 39.912184339652434,
				116.3863895679214, 39.912040782089136,
				116.38615116333982, 39.91683595583038
			]),
			height: 0,
			material: Cesium.Color.RED.withAlpha(0.1),
			outline: true,
			outlineColor: Cesium.Color.BLACK
		}

	});

	// viewer.zoomTo(wyoming);


}
// drawPoint();
//绘制点
function drawPoint() {
	// var pinBuilder = new Cesium.PinBuilder();
	// var questionPin = viewer.entities.add({
	// 	name: "施工工地",
	// 	position: Cesium.Cartesian3.fromDegrees(116.38602867206602, 39.9210114923252),
	// 	billboard: {
	// 		image: pinBuilder.fromText("施工工地", Cesium.Color.BLACK, 50).toDataURL(),
	// 		verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
	// 	},
	// });

	setInterval("drawMultiplePoints()", 1000);
}

var number = 0.00001;

function drawMultiplePoints() {
	if (number > 0.001) {
		number = 0.00001;
	}
	number += 0.00001;

	viewer.entities.removeById(1);
	viewer.entities.removeById(2);
	viewer.entities.removeById(3);
	viewer.entities.add({
		id: 1,
		name: "施工人1",
		position: Cesium.Cartesian3.fromDegrees(116.3901485076696, (39.91753497197232 + number)),
		point: {
			color: Cesium.Color.BLUE,
			pixelSize: 8,
		},
	});

	viewer.entities.add({
		name: "施工人2",
		id: 2,
		position: Cesium.Cartesian3.fromDegrees(116.39296198314118 - number, 39.91709291838642),
		point: {
			color: Cesium.Color.BLUE,
			pixelSize: 8,
		},
	});
	viewer.entities.add({
		name: "施工人3",
		id: 3,
		position: Cesium.Cartesian3.fromDegrees(116.39045744723167, 39.92072147966627 - number),
		point: {
			color: Cesium.Color.LIME,
			pixelSize: 8,
		},
	});
}

function addFloatMarkers() {

	let monitors = [{
		point: [116.39062874186354, 39.92093902539501, 9.691983084673709],
		name: "宫门1监控画面",
		url: "http://210.14.146.43:88/hls/101/101.m3u8"
	}, {
		point: [123.89927382640538, 41.15361897586072, 40],
		name: "甬子峪基站监控",
		url: "http://210.14.146.43:88/hls/101/101.m3u8"
	}, {
		point: [116.39070922224838, 39.919404342345835, 10.24838062187865],
		name: "宫门2监控画面",
		url: "http://210.14.146.43:88/hls/201/201.m3u8"
	}, {
		point: [116.39076678990257, 39.91878897900483, 9.584467686712157],
		name: "宫门3监控画面",
		url: "http://210.14.146.43:88/hls/301/301.m3u8"
	}, {
		point: [116.39074840480014, 39.91785909380745, 9.584467686712157],
		name: "宫门4监控画面",
		url: "http://210.14.146.43:88/hls/401/401.m3u8"
	}, {
		point: [116.39079193553945, 39.91703930694239, 9.584467686712157],
		name: "宫门5监控画面",
		url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
	}, {
		point: [116.39086358524162, 39.915911613012796, 9.584467686712157],
		name: "宫门6监控画面",
		url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
	}, {
		point: [116.39095039202145, 39.914001407236334, 9.584467686712157],
		name: "宫门7监控画面",
		url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
	}, {
		point: [116.39103571544382, 39.91254349573734, 9.584467686712157],
		name: "宫门8监控画面",
		url: "http://220.161.87.62:8800/hls/0/index.m3u8"
	}];



	monitors.forEach(item => {
		const point = item.point;
		viewer.entities.add({
			id: item.name,
			name: item.name,
			position: Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]),
			info: item,
			billboard: {
				image: 'img/bluecamera.png',
				scaleByDistance: new Cesium.NearFarScalar(500, 1, 1200, 0.8),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000),
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM
			}
		})
	})

	// viewer.selectedEntityChanged.addEventListener(e => {
	// 	 showPop();
	// });
}

var content;
var infoDiv = '<div id="trackPopUp" style="display:none;">' +
	'<div id="trackPopUpContent" class="leaflet-popup" style="top:5px;left:0;">' +
	'<a class="leaflet-popup-close-button" style="z-index:1000" href="#">×</a>' +
	'<div class="leaflet-popup-content-wrapper">' +
	'<div id="trackPopUpLink" class="leaflet-popup-content" style="max-width:100%;">' +
	'autoplay="true">' +
	'</div>' +
	'</div>' +
	'<div class="leaflet-popup-tip-container">' +
	'<div class="leaflet-popup-tip"></div>' +
	'</div>' +
	'</div>' +
	'</div>';
// 首先构造一个存放弹框的div,方便设置
$("#cesiumContainer").append(infoDiv);


function getCenterPosition() {
	//获取当前位置
	var result = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas
		.clientHeight / 2));
	var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
	var lon = curPosition.longitude * 180 / Math.PI;
	var lat = curPosition.latitude * 180 / Math.PI;
	var height = getHeight();
	return {
		x: lon,
		y: lat,
		z: height
	};
}

function getHeight() {
	//获取当前高度
	if (viewer) {
		var scene = viewer.scene;
		var ellipsoid = scene.globe.ellipsoid;
		var height = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
		return height;
	}
}

function showPop(pick, movement, info) {
	// 这里的判断条件还是蛮有用的,比如你点击某些点的时候想弹出自定义弹窗,其他点弹出原生弹窗,就需要在这里进行判断了
	$("#trackPopUp").show();
	// 显示弹窗容器
	var cartographic = Cesium.Cartographic.fromCartesian(pick.primitive._actualPosition);
	// 获取点的经纬度
	var point = [cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180];
	// 转换坐标
	var destination = Cesium.Cartesian3.fromDegrees(point[0], point[1], 3000.0);
	// destination是我们点击之后,flyto的位置
	// content =
	// 	'<div style="padding-bottom: 5px; font-size: 20px; color: #8aaafb;">' + info.name + '</div>' +
	// 	'<video class="viewVideo" src="' + info.url + '" autoplay="true"></video>';
	var x = 10000;
	var y = 0;
	var rand = parseInt(Math.random() * (x - y + 1) + y);
	var id = "player-container-id" + rand;
	content =
		'<video id="' + id + '" width="414" height="270" preload="auto" playsinline webkit-playsinline></video>';

	// content是核心,你想弹出的东西,就全部放在这里面
	var obj = {
		position: movement.position,
		destination: destination,
		content: content
	};
	// 构造一个参数,包括事件、 位置、已经弹框
	infoWindow(pick, movement, obj);
	setTimeout(function() {
		var player = TCPlayer(id, {
			autoplay: true,
			controls: true,
			controlBar: {
				playToggle: false,
				progressControl: false,
				currentTimeDisplay: false,
				durationDisplay: false,
				timeDivider: false,
				playbackRateMenuButton: false
			}
		});
		player.src(info.url);
	}, 500);
}

function infoWindow(pick, movement, obj) {
	var picked = viewer.scene.pick(obj.position);
	// 首先获取点击点的信息
	if (Cesium.defined(picked)) {
		// 判断 如果点被定义了
		var id = Cesium.defaultValue(picked.id, picked.primitive.id);
		// 获取id(id就是原生弹窗的标题)
		if (id) {
			if (obj.destination) {
				back_position = new Cesium.Cartesian3.fromDegrees(getCenterPosition().x, getCenterPosition().y,
					getCenterPosition().z);
				// 我在这里用back_position记录的点击之前的位置,便于×掉弹窗后返回
				// viewer.camera.flyTo({
				// 	// 跳转到我们刚才定义的位置
				// 	destination: obj.destination
				// });
			}
			// 填充内容
			$(".cesium-selection-wrapper").show();
			// cesium-selection-wrapper是cesium内置的东西
			$('#trackPopUpLink').empty();
			// empty() 方法从被选元素移除所有内容，包括所有文本和子节点。
			$('#trackPopUpLink').append(obj.content);
			// append() 方法在被选元素的结尾（仍然在内部）插入指定内容。
			function positionPopUp(c) {
				var x = c.x - ($('#trackPopUpContent').width()) / 2 + 360;
				var y = c.y - ($('#trackPopUpContent').height()) + 40;
				// 为所有匹配元素(#trackPopUpContent)设置transform的值为 'translate3d(' + x + 'px, ' + y + 'px, 0)'
				$('#trackPopUpContent').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
			}
			var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
			$('#trackPopUp').show();
			positionPopUp(c);
			//实时更新位置
			var removeHandler = viewer.scene.postRender.addEventListener(function() {
				var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pick.primitive
					._actualPosition);
				// 我们转动地球,也会实时更新弹窗的位置.并不会一成不变
				if (c && changedC && c.x && changedC.x && c.y && changedC.y) {
					if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
						positionPopUp(changedC);
						c = changedC;
					}
				}
			});
			// PopUp close button event handler
			$('.leaflet-popup-close-button').click(function() {
				$('#trackPopUp').hide();
				$('#trackPopUpLink').empty();
				$(".cesium-selection-wrapper").hide();
				removeHandler.call();
				// viewer.camera.flyTo({
				// 	// 回到我们点击前的位置
				// 	destination: back_position
				// });
				return false;
			});

		}
	}
}
