var Plot2D = function (canvasDom){
	var plotDatas = [];

	this.options = {
		//default axis option
		axesDefaults : {
			pad : 1.05,		//padding
			labelRenderer : $.jqplot.CanvasAxisLabelRenderer, //renderer
			labelOptions : {
				show : true,	//label on off(default:true)
				angle : -90,	//label angle(default:-90)
				fontFamily : 'Times New Roman',	//label font(defaul)
				fontSize : '20px',
				fontWeight : 'bold',
				textColor : '#666666'
			},
			tickRenderer : $.jqplot.CanvasAxisTickRenderer,
			tickOptions : {
				show : true,
				showLabel : true,
				showMark : true,
				showGridline : true,
				mark : 'outside',
				markSize : 4,
				formatString : '',
				fontSize : '10pt',
				fontWeight : 'bold',
				textColor : '#666666',
				fontFamily : 'Times New Roman',
				angle : 0,
				prefix : ''
			}
		},
		//axis option
		axes : {
			xaxis : {
				label : 'x',
				min : null,
				max : null,
				tickInterval : null,
				labelOptions : { angle : 0 }
			},
			yaxis : {
				label : 'y',
				min : null,
				max : null,
				tickInterval : null,
				labelOptions : { angle : 0 }
			}
		},
		//grid option
		grid : {
			background : '#FFFFFF'
		},
		//legend option
		legend : {
			show : true,
			location : 'ne',
			placement : 'insideGrid'
		},
		//cursor option
		cursor : {
			show : true,
			style : 'crosshair',
			zoom : true,
			looseZoom : true,
			clickReset : false,
			dblClickReset : false,
			constrainOutsideZoom : false,
			showTooltipOutsideZoom : true
		},
		//high light option
		hightlighter : {
			show : true,
			showTooltip : true,
			fadaTooltip : true,
			tooltipFadaSpeed : 'def',
			tooltipAxes : 'xy',
			sizeAdjust : 7.5
		}
	};

	this.pushData = function (data){
		plotDatas.push(data);
	}

	//draw liner plot
	this.linerPlot = function (){
		this.clearCanvas();
		$.jqplot(canvasDom, plotDatas, this.options);
	}
	//draw log plot
	this.logPlot = function (base){
		var base = base || 10; //log_x (10, 2 or Math.E)
		//default option
		var oldYaxisOption = {
			min: this.options.axes.yaxis.min,
			max: this.options.axes.yaxis.max,
			tickInterval: this.options.axes.tickInterval
		}

		this.options.axes.yaxis.min = null;
		this.options.axes.yaxis.max = null;
		this.options.axes.yaxis.tickInterval = null;
		this.options.axes.yaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.rendererOptions = {base: base};
		this.linerPlot();

		this.options.axes.yaxis.min = oldYaxisOption.min;
		this.options.axes.yaxis.max = oldYaxisOption.max;
		this.options.axes.yaxis.tickInterval = oldYaxisOption.tickInterval;
		this.options.axes.yaxis.renderer = $.jqplot.LinerAxisRenderer;
	}

	this.clearCanvas = function (){
		document.getElementById(canvasDom).innerHTML = null;
	}
		
}
