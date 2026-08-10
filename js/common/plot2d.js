// jqPlot（jQuery プラグイン）の置き換え。canvas 一枚に 2D の折れ線／散布図を描く。
//
//   旧: jqplot.destroy();
//       jqplot = $.jqplot('graph', data, options);
//   新: const plot = new Plot2D('graph', options);   // 作るのは一度だけ
//       plot.draw(data);                             // 何度でも描き直す
//
// jqPlot は再描画のたびに <div> と <canvas> を作り直していたので、x-t 図のように
// 毎フレーム描き替える使い方では作り直しの方が描画より重かった。canvas を持ち回して
// 中身だけ描き直す方が単純で速い。
//
// 色と寸法は jqPlot の既定テーマに合わせてあるので、見た目はほぼ変わらない。

/** jqPlot の既定の系列色。 */
const SERIES_COLORS = ['#4bb2c5', '#eaa228', '#c5b47f', '#579575', '#839557', '#958c12'];

const FONT_FAMILY = '"Trebuchet MS", Arial, Helvetica, sans-serif';
const TEXT_COLOR = '#666666';

const GRID_BACKGROUND = '#fffdf6';
const GRID_BORDER_COLOR = '#999999';
const GRID_BORDER_WIDTH = 2;
const GRID_LINE_COLOR = '#cccccc';

const TITLE_SIZE = 19.2;   // jqPlot の 1.2em（親は 16px）
const LABEL_SIZE = 14.7;   // 11pt
const TICK_SIZE = 12;      // 0.75em

const SERIES_LINE_WIDTH = 2.5;
const MARKER_RADIUS = 4.5;

/** 枠と、その外側に置く文字との間隔。 */
const GAP = 10;

/** 凡例の箱を枠の内側から離す距離。 */
const LEGEND_INSET = 12;

/**
 * 文字を 1 行置くのに要る高さ。
 * canvas には line-height が無いので、日本語が入っても収まる広さを決め打ちする。
 */
function lineHeight(fontSize) {
	return Math.ceil(fontSize * 1.6);
}

/** rough 以上で一番近い「切りのいい」刻み幅（1, 2, 5 × 10^n のどれか）。 */
function niceStep(rough) {
	const magnitude = 10 ** Math.floor(Math.log10(rough));
	const normalized = rough / magnitude;
	const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
	return nice * magnitude;
}

/** step を書き表すのに要る小数点以下の桁数。0.02 なら 2、5 なら 0。 */
function decimalsOf(step) {
	// 0.1 を足し込んだ値がそのまま来ることがあるので、まず余分な桁を落とす。
	const text = Number(step.toPrecision(12)).toString();
	const dot = text.indexOf('.');
	return dot < 0 ? 0 : text.length - dot - 1;
}

/**
 * 軸の目盛りを決める。min / max / tickInterval が指定されていればそれに従い、
 * 指定の無いものだけデータの範囲から決める。
 *
 * @param {{min: ?number, max: ?number, tickInterval: ?number}} axis
 * @param {() => [number, number]} extent データの最小・最大を返す関数。
 *   min と max が両方指定されていれば呼ばれない（毎フレーム全点を走査しないため）。
 */
function makeTicks(axis, extent) {
	let { min, max, tickInterval } = axis;

	// 2 つまみのスライダーでつまみを重ねると (max - min) / 10 が 0 になるなど、
	// 使えない刻み幅が渡ってくることがある。?? では 0 を弾けないのでここで潰す。
	// 潰しておかないと目盛りの本数が Infinity になって描画が止まる。
	if (!(tickInterval > 0)) {
		tickInterval = null;
	}

	if (min === null || max === null) {
		let [lo, hi] = extent();
		if (lo === hi) {
			// 点が 1 つしかない、あるいは全部同じ値のとき。
			lo -= 0.5;
			hi += 0.5;
		}
		const pad = (hi - lo) * 0.05;
		const step = tickInterval ?? niceStep((hi - lo + 2 * pad) / 10);
		min = min ?? Math.floor((lo - pad) / step) * step;
		max = max ?? Math.ceil((hi + pad) / step) * step;
		tickInterval = step;
	}
	// つまみを重ねるなどして表示範囲の幅が 0 になっても軸が壊れないようにする。
	if (!(max > min)) {
		max = min + (tickInterval || 1);
	}
	tickInterval = tickInterval ?? niceStep((max - min) / 10);

	// min に tickInterval を足し込んでいくと誤差が溜まるので、番号から毎回計算する。
	// 上限を切ってあるのは安全弁。ここは毎フレーム通るので、刻み幅が範囲に対して
	// 極端に小さいと画面が固まってしまう。
	const count = Math.min(1000, Math.max(1, Math.round((max - min) / tickInterval)));
	const decimals = decimalsOf(tickInterval);
	const ticks = [];
	for (let i = 0; i <= count; i++) {
		const value = min + i * tickInterval;
		ticks.push({ value, text: value.toFixed(decimals) });
	}

	return { min, max, ticks };
}

/** 値をグラフ座標から画面座標に移す。lo, hi は min, max に対応する画面座標。 */
function project(value, axis, lo, hi) {
	return lo + (value - axis.min) / (axis.max - axis.min) * (hi - lo);
}

/**
 * 軸の名前を行に分ける。改行を含めれば複数行になる（例: '変位\n[m]'）。
 * 名前が空なら 0 行。
 */
function labelLines(label) {
	return label === '' ? [] : label.split('\n');
}

export class Plot2D {
	/**
	 * @param {string} containerId 描画先の要素の id。この中に canvas を作る
	 * @param {object} [options]
	 * @param {string} [options.title] グラフの表題
	 * @param {object} [options.xAxis] {label, min, max, tickInterval}。
	 *   min / max / tickInterval を省くとデータに合わせて自動で決まる
	 * @param {object} [options.yAxis] xAxis と同じ
	 * @param {string[]} [options.legend] 系列名。省略すると凡例を出さない
	 * @param {boolean} [options.lines] 点を線で結ぶ（既定 true）
	 * @param {boolean} [options.markers] 各点に丸を打つ（既定 false）
	 */
	constructor(containerId, options = {}) {
		const container = document.getElementById(containerId);
		if (container === null) {
			throw new Error(`Plot2D: #${containerId} が見つかりません`);
		}

		this.title = options.title ?? '';
		this.xAxis = { label: '', min: null, max: null, tickInterval: null, ...options.xAxis };
		this.yAxis = { label: '', min: null, max: null, tickInterval: null, ...options.yAxis };
		this.legend = options.legend ?? null;
		this.showLines = options.lines ?? true;
		this.showMarkers = options.markers ?? false;

		this.width = container.clientWidth;
		this.height = container.clientHeight;

		this.canvas = document.createElement('canvas');
		// canvas の実ピクセル数は画面の解像度に合わせる（文字と線がぼやけないように）。
		const ratio = window.devicePixelRatio || 1;
		this.canvas.width = Math.round(this.width * ratio);
		this.canvas.height = Math.round(this.height * ratio);
		this.canvas.style.width = `${this.width}px`;
		this.canvas.style.height = `${this.height}px`;
		container.appendChild(this.canvas);

		this.context = this.canvas.getContext('2d');
		this.context.scale(ratio, ratio);

		/** @type {Array<Array<[number, number]>>} 系列ごとの [x, y] の配列 */
		this.series = [];
	}

	/**
	 * 全部描き直す。
	 * @param {Array<Array<[number, number]>>} [series] 省略すると前回のデータを使う
	 */
	draw(series) {
		if (series !== undefined) {
			this.series = series;
		}

		const x = makeTicks(this.xAxis, () => this.#extent(0));
		const y = makeTicks(this.yAxis, () => this.#extent(1));
		const grid = this.#gridRect(x, y);

		this.context.clearRect(0, 0, this.width, this.height);
		this.#drawTitle();
		this.#drawGrid(grid, x, y);
		this.#drawAxisText(grid, x, y);
		this.#drawSeries(grid, x, y);
		if (this.legend !== null) {
			this.#drawLegend(grid);
		}
	}

	/** 全系列を通した index 番目の成分（0 なら x、1 なら y）の最小・最大。 */
	#extent(index) {
		let lo = Infinity;
		let hi = -Infinity;
		for (const points of this.series) {
			for (const point of points) {
				const value = point[index];
				if (value < lo) { lo = value; }
				if (value > hi) { hi = value; }
			}
		}
		return lo <= hi ? [lo, hi] : [0, 1];
	}

	/** グラフの枠（目盛りや表題を除いた、線を引く領域）の位置。 */
	#gridRect(x, y) {
		const ctx = this.context;

		ctx.font = `${TICK_SIZE}px ${FONT_FAMILY}`;
		let yTickWidth = 0;
		for (const tick of y.ticks) {
			yTickWidth = Math.max(yTickWidth, ctx.measureText(tick.text).width);
		}
		// 横軸の一番右の目盛りは枠の右端に中央を合わせて置くので、その半分だけ
		// 右に余白が要る（0.88 刻みのように桁数が増えると 10px では足りない）。
		const lastTick = x.ticks[x.ticks.length - 1];
		const rightMargin = lastTick === undefined
			? GAP
			: Math.max(GAP, Math.ceil(ctx.measureText(lastTick.text).width / 2));

		ctx.font = `${LABEL_SIZE}px ${FONT_FAMILY}`;
		const yLines = labelLines(this.yAxis.label);
		let yLabelWidth = 0;
		for (const line of yLines) {
			yLabelWidth = Math.max(yLabelWidth, ctx.measureText(line).width + GAP);
		}
		const xLines = labelLines(this.xAxis.label);
		const xLabelHeight = xLines.length === 0 ? 0 : xLines.length * lineHeight(LABEL_SIZE) + GAP;

		// 表題が無いときも、一番上の目盛りの文字がはみ出さないだけの余白は要る。
		const top = this.title === ''
			? Math.ceil(lineHeight(TICK_SIZE) / 2)
			: lineHeight(TITLE_SIZE) + Math.round(TITLE_SIZE / 2);
		const left = Math.ceil(yLabelWidth + yTickWidth + GAP);
		const right = this.width - rightMargin;
		const bottom = this.height - (GAP + lineHeight(TICK_SIZE) + xLabelHeight);

		return { left, top, right, bottom, width: right - left, height: bottom - top };
	}

	#drawTitle() {
		if (this.title === '') {
			return;
		}
		const ctx = this.context;
		ctx.fillStyle = TEXT_COLOR;
		ctx.font = `${TITLE_SIZE}px ${FONT_FAMILY}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.title, this.width / 2, lineHeight(TITLE_SIZE) / 2);
	}

	#drawGrid(grid, x, y) {
		const ctx = this.context;

		ctx.fillStyle = GRID_BACKGROUND;
		ctx.fillRect(grid.left, grid.top, grid.width, grid.height);

		// 1px の線は座標を .5 にずらさないと 2px 幅の薄い線になってしまう。
		ctx.strokeStyle = GRID_LINE_COLOR;
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (const tick of x.ticks) {
			const px = Math.round(project(tick.value, x, grid.left, grid.right)) + 0.5;
			ctx.moveTo(px, grid.top);
			ctx.lineTo(px, grid.bottom);
		}
		for (const tick of y.ticks) {
			const py = Math.round(project(tick.value, y, grid.bottom, grid.top)) + 0.5;
			ctx.moveTo(grid.left, py);
			ctx.lineTo(grid.right, py);
		}
		ctx.stroke();

		ctx.strokeStyle = GRID_BORDER_COLOR;
		ctx.lineWidth = GRID_BORDER_WIDTH;
		ctx.strokeRect(grid.left, grid.top, grid.width, grid.height);
	}

	#drawAxisText(grid, x, y) {
		const ctx = this.context;
		ctx.fillStyle = TEXT_COLOR;

		ctx.font = `${TICK_SIZE}px ${FONT_FAMILY}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		for (const tick of x.ticks) {
			ctx.fillText(tick.text, project(tick.value, x, grid.left, grid.right), grid.bottom + GAP);
		}
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		for (const tick of y.ticks) {
			ctx.fillText(tick.text, grid.left - GAP, project(tick.value, y, grid.bottom, grid.top));
		}

		ctx.font = `${LABEL_SIZE}px ${FONT_FAMILY}`;
		const step = lineHeight(LABEL_SIZE);

		const xLines = labelLines(this.xAxis.label);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		xLines.forEach((line, index) => {
			const baseline = this.height - (xLines.length - 1 - index) * step;
			ctx.fillText(line, (grid.left + grid.right) / 2, baseline);
		});

		// 縦軸の名前は枠の左端に、上下の中央を揃えて置く。
		const yLines = labelLines(this.yAxis.label);
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		const yCenter = (grid.top + grid.bottom) / 2;
		yLines.forEach((line, index) => {
			ctx.fillText(line, 0, yCenter + (index - (yLines.length - 1) / 2) * step);
		});
	}

	#drawSeries(grid, x, y) {
		const ctx = this.context;

		ctx.save();
		// 表示範囲の外に出た点は枠からはみ出さないよう切り落とす。
		ctx.beginPath();
		ctx.rect(grid.left, grid.top, grid.width, grid.height);
		ctx.clip();

		this.series.forEach((points, index) => {
			const color = SERIES_COLORS[index % SERIES_COLORS.length];

			if (this.showLines && points.length > 1) {
				ctx.strokeStyle = color;
				ctx.lineWidth = SERIES_LINE_WIDTH;
				ctx.lineJoin = 'round';
				ctx.beginPath();
				points.forEach(([px, py], i) => {
					const cx = project(px, x, grid.left, grid.right);
					const cy = project(py, y, grid.bottom, grid.top);
					if (i === 0) {
						ctx.moveTo(cx, cy);
					}
					else {
						ctx.lineTo(cx, cy);
					}
				});
				ctx.stroke();
			}

			if (this.showMarkers) {
				ctx.fillStyle = color;
				for (const [px, py] of points) {
					ctx.beginPath();
					ctx.arc(project(px, x, grid.left, grid.right),
						project(py, y, grid.bottom, grid.top),
						MARKER_RADIUS, 0, 2 * Math.PI);
					ctx.fill();
				}
			}
		});

		ctx.restore();
	}

	#drawLegend(grid) {
		const ctx = this.context;
		ctx.font = `${TICK_SIZE}px ${FONT_FAMILY}`;

		const padding = 3;
		const swatchWidth = 16;
		const swatchHeight = 14;
		const swatchGap = 2;
		const rowHeight = Math.max(swatchHeight + 5, lineHeight(TICK_SIZE));

		let labelWidth = 0;
		for (const label of this.legend) {
			labelWidth = Math.max(labelWidth, ctx.measureText(label).width);
		}

		const boxWidth = Math.ceil(padding * 2 + swatchWidth + swatchGap + labelWidth);
		const boxHeight = padding * 2 + rowHeight * this.legend.length;
		const boxLeft = grid.right - LEGEND_INSET - boxWidth;
		const boxTop = grid.top + LEGEND_INSET;

		ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
		ctx.fillRect(boxLeft, boxTop, boxWidth, boxHeight);
		ctx.strokeStyle = '#cccccc';
		ctx.lineWidth = 1;
		ctx.strokeRect(boxLeft + 0.5, boxTop + 0.5, boxWidth - 1, boxHeight - 1);

		this.legend.forEach((label, index) => {
			const rowTop = boxTop + padding + rowHeight * index;
			const swatchLeft = boxLeft + padding;
			const swatchTop = rowTop + (rowHeight - swatchHeight) / 2;

			ctx.strokeStyle = '#cccccc';
			ctx.lineWidth = 1;
			ctx.strokeRect(swatchLeft + 0.5, swatchTop + 0.5, swatchWidth - 1, swatchHeight - 1);
			ctx.fillStyle = SERIES_COLORS[index % SERIES_COLORS.length];
			ctx.fillRect(swatchLeft + 2, swatchTop + 2, swatchWidth - 4, swatchHeight - 4);

			ctx.fillStyle = TEXT_COLOR;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText(label, swatchLeft + swatchWidth + swatchGap, rowTop + rowHeight / 2);
		});
	}
}
