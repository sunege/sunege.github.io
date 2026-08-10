// THREE.Geometry / THREE.Face3 は r125 で削除された。その置き換えとなる
// BufferGeometry の組み立てをここにまとめる。
//
// 属性を設定するメソッド名は r70 と最新版で違う（addAttribute / setAttribute、
// index の持ち方）。その差はこのファイルの setAttribute() と setIndex() だけに
// 閉じ込めてある。

import * as THREE from 'three';

/**
 * 頂点属性を設定する。r70 では addAttribute() という名前だった。
 * @returns {object} 追加した BufferAttribute
 */
export function setAttribute(geometry, name, array, itemSize) {
	geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
	return geometry.attributes[name];
}

/**
 * 頂点インデックスを設定する。r70 では 'index' という名前の属性だった。
 * @returns {object} 追加した BufferAttribute
 */
export function setIndex(geometry, array) {
	geometry.setIndex(new THREE.BufferAttribute(array, 1));
	return geometry.index;
}

/**
 * 折れ線用のジオメトリを作る。
 * 旧コードの `new THREE.Geometry()` + `vertices.push(v)` の置き換え。
 * @param {object[]} points THREE.Vector3 の配列
 */
export function lineGeometry(points) {
	const geometry = new THREE.BufferGeometry();
	const position = new Float32Array(points.length * 3);

	for (let i = 0; i < points.length; i++) {
		position[i * 3] = points[i].x;
		position[i * 3 + 1] = points[i].y;
		position[i * 3 + 2] = points[i].z;
	}

	setAttribute(geometry, 'position', position, 3);
	return geometry;
}

/**
 * 折れ線を、指定した太さを持つ帯（三角形の列）にしたジオメトリを作る。
 *
 * WebGL では LineBasicMaterial の linewidth が無視され、線は常に 1px で
 * 描かれる（three.js 側の制限で、r70 の頃から変わらない）。太さの要る線は
 * 線ではなく細長い面として描くしかないので、その面をここで作る。
 * マテリアルは MeshBasicMaterial を DoubleSide で使う想定。
 *
 * 各頂点を xy 平面内で法線方向に ±width/2 ずらす。折れ点では前後の線分の
 * 法線を平均した向き（マイター）へ、折れ角の分だけ伸ばした長さでずらすので、
 * 曲がっているところでも帯の幅は一定になる。折れ角が鋭いと伸びが発散する
 * ため上限を設けてある。
 *
 * @param {object[]} points THREE.Vector3 の配列（2 点以上）
 * @param {number} width 帯の幅（ワールド座標）
 */
export function ribbonGeometry(points, width) {
	const geometry = new THREE.BufferGeometry();
	const count = points.length;
	if (count < 2) {
		setAttribute(geometry, 'position', new Float32Array(0), 3);
		return geometry;
	}

	// 線分ごとの単位法線。線分を xy 平面内で 90 度回したもの
	const normals = new Array(count - 1);
	for (let i = 0; i < count - 1; i++) {
		const dx = points[i + 1].x - points[i].x;
		const dy = points[i + 1].y - points[i].y;
		const len = Math.sqrt(dx * dx + dy * dy);
		// 長さ 0 の線分には向きが無いので、直前の線分の法線を引き継ぐ
		normals[i] = len > 0 ? [-dy / len, dx / len] : (normals[i - 1] || [0, 1]);
	}

	const half = width / 2;
	const MITER_LIMIT = 4; // マイターの伸びの上限。鋭角で帯が飛び出すのを防ぐ
	const position = new Float32Array(count * 2 * 3);

	for (let i = 0; i < count; i++) {
		const before = normals[Math.max(i - 1, 0)];
		const after = normals[Math.min(i, count - 2)];

		let mx = before[0] + after[0];
		let my = before[1] + after[1];
		const len = Math.sqrt(mx * mx + my * my);
		if (len > 0) {
			mx /= len;
			my /= len;
		}
		else {
			// 前後がちょうど逆向き（180 度の折り返し）。平均が消えるので片側を使う
			mx = after[0];
			my = after[1];
		}

		const cos = mx * after[0] + my * after[1];
		const scale = cos > 0 ? Math.min(1 / cos, MITER_LIMIT) : MITER_LIMIT;
		const ox = mx * half * scale;
		const oy = my * half * scale;

		const p = points[i];
		const n = i * 6;
		position[n] = p.x + ox;
		position[n + 1] = p.y + oy;
		position[n + 2] = p.z;
		position[n + 3] = p.x - ox;
		position[n + 4] = p.y - oy;
		position[n + 5] = p.z;
	}
	setAttribute(geometry, 'position', position, 3);

	// 頂点 2 つで 1 組。組と組の間を四角形（三角形 2 枚）で埋める
	const index = count * 2 > 65535 ? new Uint32Array((count - 1) * 6) : new Uint16Array((count - 1) * 6);
	let k = 0;
	for (let i = 0; i < count - 1; i++) {
		const v = i * 2;
		index[k++] = v;
		index[k++] = v + 1;
		index[k++] = v + 3;

		index[k++] = v;
		index[k++] = v + 3;
		index[k++] = v + 2;
	}
	setIndex(geometry, index);

	return geometry;
}

/**
 * 破線で描く円の輪郭のジオメトリを作る。
 * 旧コードは CircleGeometry（中心＋円周の頂点を持つ扇形）から中心頂点を
 * vertices.shift() で取り除き、computeLineDistances() を呼んでいた。
 * BufferGeometry にはどちらも無いので、円周上の点と線距離を直接作る。
 * @param {number} radius 半径
 * @param {number} segments 分割数
 */
export function dashedCircleGeometry(radius, segments) {
	const points = [];
	for (let i = 0; i <= segments; i++) {
		const t = i / segments * Math.PI * 2;
		points.push(new THREE.Vector3(radius * Math.cos(t), radius * Math.sin(t), 0));
	}
	const geometry = lineGeometry(points);

	// LineDashedMaterial が参照する頂点属性。旧 computeLineDistances() と同じ値。
	const lineDistance = new Float32Array(points.length);
	for (let i = 1; i < points.length; i++) {
		lineDistance[i] = lineDistance[i - 1] + points[i].distanceTo(points[i - 1]);
	}
	setAttribute(geometry, 'lineDistance', lineDistance, 1);

	return geometry;
}

/**
 * 4 頂点からなる四角形のジオメトリを作る。
 * 旧コードの `vertices.push` 4 回 + `Face3(0,1,2)` / `Face3(0,2,3)` の置き換え。
 * @param {object[]} points THREE.Vector3 を 4 つ（旧コードの vertex1〜4 の順）
 */
export function quadGeometry(points) {
	const geometry = lineGeometry(points);
	setIndex(geometry, new Uint16Array([0, 1, 2, 0, 2, 3]));
	computeVertexNormalsFaceAverage(geometry);
	return geometry;
}

/**
 * (N+1)×(N+1) 個の格子点からなる面のジオメトリを作る。
 * 三角形の分割の仕方と頂点の並び順は、旧コードが Face3 を 2 枚ずつ
 * 積んでいたものと同一にしてある（頂点 n の位置は position[n*3 .. n*3+2]）。
 * 位置はゼロで確保するだけなので、呼び出し側が fillGrid() などで埋める。
 * @param {number} N 分割数
 */
export function gridGeometry(N) {
	const geometry = new THREE.BufferGeometry();
	setAttribute(geometry, 'position', new Float32Array((N + 1) * (N + 1) * 3), 3);

	const index = new Uint16Array(N * N * 6);
	let k = 0;
	for (let j = 0; j < N; j++) {
		for (let i = 0; i < N; i++) {
			index[k++] = (N + 1) * j + i;
			index[k++] = (N + 1) * j + i + 1;
			index[k++] = (N + 1) * (j + 1) + i + 1;

			index[k++] = (N + 1) * j + i;
			index[k++] = (N + 1) * (j + 1) + i + 1;
			index[k++] = (N + 1) * (j + 1) + i;
		}
	}
	setIndex(geometry, index);

	return geometry;
}

/**
 * 頂点法線を「面法線（正規化済み）の単純平均」で求める。
 *
 * 旧コードは Geometry#computeFaceNormals() → Geometry#computeVertexNormals() と
 * 呼んでいた。後者は引数なしだと面積の重み付けをせず、正規化済みの面法線を
 * 足して正規化する。一方 BufferGeometry#computeVertexNormals() は面積重み付き
 * （外積を正規化せずに足す）で、結果が変わり陰影が変化する。
 *
 * Step 4a は「見た目を変えずに Geometry から脱出する」ことが目的なので、
 * ここでは旧アルゴリズムを再現する。面積重み付き（＝最新版の標準の挙動）へ
 * 移るなら、この関数の呼び出しを geometry.computeVertexNormals() に戻せばよい。
 */
export function computeVertexNormalsFaceAverage(geometry) {
	const position = geometry.attributes.position.array;
	const index = geometry.index.array;

	if (geometry.attributes.normal === undefined) {
		setAttribute(geometry, 'normal', new Float32Array(position.length), 3);
	}
	const normal = geometry.attributes.normal.array;
	for (let i = 0; i < normal.length; i++) normal[i] = 0;

	const pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3();
	const cb = new THREE.Vector3(), ab = new THREE.Vector3();

	for (let i = 0; i < index.length; i += 3) {
		const a = index[i], b = index[i + 1], c = index[i + 2];

		pA.fromArray(position, a * 3);
		pB.fromArray(position, b * 3);
		pC.fromArray(position, c * 3);

		cb.subVectors(pC, pB);
		ab.subVectors(pA, pB);
		cb.cross(ab);
		cb.normalize(); // 旧 computeFaceNormals() 相当。ここを外すと面積重み付きになる

		for (const v of [a, b, c]) {
			normal[v * 3] += cb.x;
			normal[v * 3 + 1] += cb.y;
			normal[v * 3 + 2] += cb.z;
		}
	}

	for (let i = 0; i < normal.length; i += 3) {
		const x = normal[i], y = normal[i + 1], z = normal[i + 2];
		const len = Math.sqrt(x * x + y * y + z * z);
		if (len > 0) {
			normal[i] = x / len;
			normal[i + 1] = y / len;
			normal[i + 2] = z / len;
		}
	}

	geometry.attributes.normal.needsUpdate = true;
}

/**
 * 格子点の座標を書き込み、法線を計算し直す。
 * 旧コードの `vertices[n] = vertex` + `verticesNeedUpdate = true` +
 * `computeFaceNormals()` + `computeVertexNormals()` の置き換え。
 * @param {object} geometry gridGeometry() が返したジオメトリ
 * @param {function(number, number): number[]} at (i, j) から [x, y, z] を返す関数
 * @param {number} N 分割数
 */
export function fillGrid(geometry, N, at) {
	const position = geometry.attributes.position;
	const array = position.array;

	let n = 0;
	for (let j = 0; j <= N; j++) {
		for (let i = 0; i <= N; i++) {
			const [x, y, z] = at(i, j);
			array[n++] = x;
			array[n++] = y;
			array[n++] = z;
		}
	}

	position.needsUpdate = true;
	computeVertexNormalsFaceAverage(geometry);
}
