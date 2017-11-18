PHYSICS.physLab = new PHSICS.PhysLab({

		// 必須パラメータ
		frameID : "canvas-frame",

		// ボタン関連
		playButtonID : "play",
		resetButtonID : "reset",
		picutureID : "picture",

		// マウスドラッグ関連
		draggable : true,
		allowDrag : true,

		// 数値パラメータ関連
		g : 9.8,
		dt : 0.001,
		skipRendering : 40,

		//レンダラ関連
		renderer : {
			clearColor : 0xE1FCFF
		},

		// トラックボール関連
		trackball : {
			enabled : true
		},

		// カメラ関連
		camera : {
			type : "Perspective",
			position : {x:20, y:0, z:10},
			target : {x:0, y:0, z:2}
		},

		// 光源関連
		light : {
			type : "Directional",
			position : {x:0, y:0, z:15},
			target : {x:0, y:0, z:0}
			color : 0xFFFFFF,
			ambient : 0x999999
		},

		// 影関連
		shadow : {
			shadowMapEnabled : true,
			shadowCameraVisible : false
		},
		// フラグ関連
		locusFlag : true,
		velocityVecotorFlag : "pause",
		boundingBoxFlag : "dragg"

});

// 球オブジェクトの生成
PHYSICS.physLab.objects.push(
	new PHYSICS.Sphere({
			// 運動関連
			dynamic : true,
			recordData : true,
			skipRecord : 50,

			// マウスドラッグ関連
			draggable : true,
			allowDrag : true,

			// 物理量パラメータ
			mass : 1,
			radius : 1,

			// 初期状態パラメータ
			r : {x:0, y:0, z:2},
			v : {x:0, y:-5, z:12},
			material : {
				color : 0xFF0000,
				ambient : 0x990000,
				castShadow : true
			},

			// 形状オブジェクト関連パラメータ
			geometry : {},

			// 軌跡関連パラメータ
			locus : {
				enabled : true,
				visible : true,
				color : 0xFF00FF,
				maxNum : 1000
			},

			// 速度ベクトル関連パラメータ
			velocityVector : {
				enabled : true,
				visible : true,
				color : 0xFF00FF,
				scale : 0.5
			},

			// バウンディングボックス関連パラメータ
			boundingBox : {
				visible : true
			}
	})
);

// 床オブジェクトの生成
PHYSICS.physLab.objects.push(
	new PHYSICS.Floor({
			draggable : false,
			material : {
				type : "Lambert",
				receiveShadow : true
			}
	})
);

// 軸オブジェクトの生成
PHYSICS.physLab.objects.push(
	new PHYSICS.Axis({
			draggable : true,
			allowDrag : true,
			r : {x:-9, y:-9, z:3}
	})
);

