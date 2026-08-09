// 各シミュレーションで同一だった three.js の初期化処理をまとめたもの。
// THREE は three.js を通常のスクリプトとして読み込んだグローバルを参照する。

/**
 * レンダラーとシーンを作り、canvas を DOM に追加する。
 * 元は 24 ファイルすべてに同じ内容が複製されていた。
 * @param {string} canvasFrameId canvas を追加する要素の id
 * @returns {{renderer: object, scene: object, canvasFrame: HTMLElement}}
 */
export function initThree(canvasFrameId = 'canvas-frame') {
	const canvasFrame = document.getElementById(canvasFrameId);

	//create renderer object
	const renderer = new THREE.WebGLRenderer({ antialias: true });

	//set renderer size
	renderer.setSize(canvasFrame.clientWidth, canvasFrame.clientHeight);

	//add canvas element to DOM
	canvasFrame.appendChild(renderer.domElement);

	//set renderer options
	renderer.setClearColor(0x000000, 1.0);
	renderer.shadowMapEnabled = true; // three.js r70 の API（Step 4 で shadowMap.enabled に変更予定）

	//create scene object
	const scene = new THREE.Scene();

	return { renderer, scene, canvasFrame };
}

/**
 * 平行光源と環境光をシーンに追加する。
 * ファイルごとの違いは光源の位置と環境光の色だけだったので引数にした。
 * @param {object} scene 追加先のシーン
 * @param {object} [options]
 * @param {number[][]} [options.positions] 平行光源の位置（複数指定で多灯）
 * @param {number} [options.ambient] 環境光の色
 * @param {number} [options.shadowCameraNear] 指定時のみシャドウカメラの near を設定
 */
export function initLight(scene, options = {}) {
	const {
		positions = [[40, 80, 100]],
		ambient = 0x777777,
		shadowCameraNear,
	} = options;

	for (const [x, y, z] of positions) {
		const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);
		directionalLight.position.set(x, y, z);
		directionalLight.castShadow = true;
		if (shadowCameraNear !== undefined) {
			directionalLight.shadowCameraNear = shadowCameraNear;
		}
		scene.add(directionalLight);
	}

	scene.add(new THREE.AmbientLight(ambient));
}
