// 各シミュレーションで同一だった three.js の初期化処理をまとめたもの。

import * as THREE from 'three';

// r152 で色管理が入り、r155 で光源の強度の解釈が変わった。どちらも
// 有効にすると 24 本すべての色と明るさが変わってしまうため、旧来の
// 見た目を保つ設定をここに集約する。将来まとめて切り替えられるように、
// 個々のシミュレーション側には出さない。
THREE.ColorManagement.enabled = false;

// r155 以降、平行光源・環境光の intensity はそのまま使われる。r70 は内部で
// π 倍していたので、同じ明るさにするにはこちらで掛ける必要がある。
const LEGACY_LIGHT_SCALE = Math.PI;

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
	renderer.shadowMap.enabled = true;
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // r152 以前と同じ出力にする

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
		const directionalLight = new THREE.DirectionalLight(0xFFFFFF, LEGACY_LIGHT_SCALE);
		directionalLight.position.set(x, y, z);
		directionalLight.castShadow = true;
		if (shadowCameraNear !== undefined) {
			directionalLight.shadow.camera.near = shadowCameraNear;
		}
		scene.add(directionalLight);
	}

	// AmbientLight は「置かない」。理由は applyLegacyAmbient() を参照。
	ambientColor.set(ambient);
}

// initLight() に渡された環境光の色。applyLegacyAmbient() が参照する。
const ambientColor = new THREE.Color(0x000000);
const materialAmbient = new THREE.Color();

/**
 * r70 の material.ambient を最新版で再現する。
 *
 * r70 の陰影計算は `emissive + 拡散 + ambientLightColor * material.ambient` で、
 * 環境光は material.color とは別の material.ambient に掛かっていた。最新版に
 * material.ambient は無く、AmbientLight は material.color に掛かるため、
 * そのまま移すと環境光の項が別物になる（例: 2wave の格子は ambient が
 * 0x000000 なのに color は 0x88DDFF で、放っておくと明るく浮いてしまう）。
 *
 * 環境光の項は物の向きに依らない定数なので、AmbientLight を置く代わりに
 * その値を emissive に入れれば r70 と同じ式になる。
 *
 * @param {object} material 対象のマテリアル（Lambert / Phong）
 * @param {number} [ambient] 旧 material.ambient。r70 の既定値は 0xffffff
 * @returns {object} 渡された material
 */
export function applyLegacyAmbient(material, ambient = 0xffffff) {
	materialAmbient.set(ambient);
	material.emissive.copy(ambientColor).multiply(materialAmbient);
	return material;
}
