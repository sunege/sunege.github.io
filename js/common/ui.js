// jQuery UI の slider ウィジェットを <input type="range"> に置き換えるための層。
//
//   旧: $('#slider_k').slider({ min, max, step, value,
//                               slide: (event, ui) => { ... ui.value ... } });
//   新: slider('slider_k', { min, max, step, value,
//                            onInput: (value) => { ... value ... } });
//
// jQuery UI 本体（と touch-punch）を読み込まなくて済むようにするのが目的。
// <input type="range"> はタッチ操作もキーボード操作も標準で効くので、
// touch-punch に相当するものは要らない。

/**
 * <input type="range"> を初期化する。
 *
 * 値の受け渡しについて二点。input 要素の value は文字列なので、
 * コールバックには Number に直して渡す（呼び出し側は数値として計算に使う）。
 * また input イベントはユーザーが動かしたときだけ発火し、
 * setSliderValue() のような代入では発火しない。これは jQuery UI の
 * slide コールバックと同じ挙動なので、呼び出し側の前提が変わらない。
 *
 * @param {string} id 対象の input 要素の id
 * @param {object} options
 * @param {number} options.min 最小値
 * @param {number} options.max 最大値
 * @param {number} options.step 刻み幅
 * @param {number} options.value 初期値
 * @param {(value: number) => void} [options.onInput] 操作されたときに呼ばれる
 * @returns {HTMLInputElement | null} 初期化した input 要素。無ければ null
 */
export function slider(id, { min, max, step, value, onInput }) {
	const el = document.getElementById(id);

	// jQuery UI では要素が無ければ何も起きなかった。実際にそうなっている
	// ページがあるので（例: _horizontal.html は horizontal.js が設定する
	// スライダーを一部しか置いていない）、ここでも例外にはしない。
	// ただし黙って無視すると今回のようなズレに気づけないので警告は出す。
	if (el === null) {
		console.warn(`slider: #${id} が見つかりません`);
		return null;
	}

	el.min = min;
	el.max = max;
	el.step = step;
	el.value = value;

	if (onInput) {
		el.addEventListener('input', () => onInput(Number(el.value)));
	}

	// スライダーはドロップメニューの <a href="#"> の中にある。クリックが
	// そのままアンカーに届くとページ先頭へ飛んでしまうので止める
	// （jQuery UI も mousedown で同じことをしていた）。value が決まるのは
	// pointerdown / pointermove の時点なので、click を止めても操作には影響しない。
	el.addEventListener('click', (event) => event.preventDefault());

	return el;
}

/**
 * チェックボックスの ON/OFF を受け取る。
 *
 * jQuery の `$('#x').click(...)` は要素が無くても何も起きなかった。実際に
 * 要素の無いページがある（例: diffraction.html には checkbox が一つも無いが
 * diffraction.js は checkbox_line1 / line2 を設定しようとする）ので、
 * ここでも例外にはせず警告だけ出す。
 *
 * @param {string} id 対象の input[type=checkbox] の id
 * @param {(checked: boolean) => void} onChange 切り替わったときに呼ばれる
 * @returns {HTMLInputElement | null} 対象の要素。無ければ null
 */
export function checkbox(id, onChange) {
	const el = document.getElementById(id);

	if (el === null) {
		console.warn(`checkbox: #${id} が見つかりません`);
		return null;
	}

	el.addEventListener('change', () => onChange(el.checked));

	return el;
}

/**
 * スライダーの値をプログラムから設定する。
 * jQuery UI の `.slider("value", v)` に相当する。onInput は呼ばれない。
 * @param {string} id 対象の input 要素の id
 * @param {number} value 設定する値
 */
export function setSliderValue(id, value) {
	const el = document.getElementById(id);
	if (el !== null) {
		el.value = value;
	}
}
