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
 * 溝の塗り潰し（jQuery UI の range: "min"）の幅を CSS 変数で伝える。
 * class="slider filled" が付いた要素だけが対象で、それ以外では何もしない。
 * 塗りの描画そのものは css/slider.css 側にある。
 */
function paintFill(el) {
	if (!el.classList.contains('filled')) {
		return;
	}
	const min = Number(el.min);
	const max = Number(el.max);
	el.style.setProperty('--fill', `${(Number(el.value) - min) / (max - min) * 100}%`);
}

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
 * @param {boolean} [options.callOnInit] 初期化した直後にも onInput を呼ぶ。
 *   jQuery UI の create コールバックに相当する。表示欄の初期値を
 *   HTML と JS の両方に書かずに済ませたいときに使う
 * @returns {HTMLInputElement | null} 初期化した input 要素。無ければ null
 */
export function slider(id, { min, max, step, value, onInput, callOnInit }) {
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
	paintFill(el);

	el.addEventListener('input', () => {
		paintFill(el);
		if (onInput) {
			onInput(Number(el.value));
		}
	});

	if (onInput && callOnInit) {
		onInput(Number(el.value));
	}

	// スライダーはドロップメニューの <a href="#"> の中にある。クリックが
	// そのままアンカーに届くとページ先頭へ飛んでしまうので止める
	// （jQuery UI も mousedown で同じことをしていた）。value が決まるのは
	// pointerdown / pointermove の時点なので、click を止めても操作には影響しない。
	el.addEventListener('click', (event) => event.preventDefault());

	return el;
}

/**
 * つまみが 2 つあるスライダー（jQuery UI の range: true）を初期化する。
 *
 * <input type="range"> は 1 本につきつまみ 1 つなので、2 本を重ねて置き、
 * つまみだけがクリックを受け取るようにしてある（見た目は css/slider.css）。
 * HTML 側はこの形を想定している:
 *
 *   <div id="slider_graph_range" class="range-slider" style="width:220px">
 *       <input type="range"><input type="range">
 *   </div>
 *
 * @param {string} id 2 本の input を包んでいる要素の id
 * @param {object} options
 * @param {number} options.min 最小値
 * @param {number} options.max 最大値
 * @param {number} options.step 刻み幅
 * @param {[number, number]} options.values 下側・上側の初期値
 * @param {(values: [number, number]) => void} [options.onInput] 操作されたときに呼ばれる
 * @param {boolean} [options.callOnInit] 初期化した直後にも onInput を呼ぶ
 * @returns {[HTMLInputElement, HTMLInputElement] | null} 2 本の input。無ければ null
 */
export function rangeSlider(id, { min, max, step, values, onInput, callOnInit }) {
	const container = document.getElementById(id);

	if (container === null) {
		console.warn(`rangeSlider: #${id} が見つかりません`);
		return null;
	}

	const [low, high] = container.querySelectorAll('input[type=range]');
	if (low === undefined || high === undefined) {
		console.warn(`rangeSlider: #${id} の中に input[type=range] が 2 本ありません`);
		return null;
	}

	for (const el of [low, high]) {
		el.min = min;
		el.max = max;
		el.step = step;
	}
	low.value = values[0];
	high.value = values[1];

	const update = () => {
		// 片方がもう片方を追い越さないようにする（jQuery UI も追い越せなかった）。
		if (Number(low.value) > Number(high.value)) {
			if (document.activeElement === low) {
				low.value = high.value;
			}
			else {
				high.value = low.value;
			}
		}

		const span = max - min;
		container.style.setProperty('--low', `${(Number(low.value) - min) / span * 100}%`);
		container.style.setProperty('--high', `${(Number(high.value) - min) / span * 100}%`);

		// つまみが重なると上に載っている方しか掴めない。2 つとも右端まで
		// 寄せたときだけは下側を手前に出さないと、そこから戻せなくなる。
		low.style.zIndex = (Number(low.value) === max && Number(high.value) === max) ? '1' : '';
	};

	for (const el of [low, high]) {
		el.addEventListener('input', () => {
			update();
			if (onInput) {
				onInput([Number(low.value), Number(high.value)]);
			}
		});
	}

	update();
	if (onInput && callOnInit) {
		onInput([Number(low.value), Number(high.value)]);
	}

	return [low, high];
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
		paintFill(el);
	}
}
