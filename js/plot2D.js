var Plot2D = function (canvasDom){
	var plot;
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
		highlighter : {
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
	};

	//draw plot 
	this.Plot = function (){
		this.clearCanvas();
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};

	//draw liner plot
	this.linerPlot = function (){
		this.clearCanvas();
		this.options.axes.xaxis.renderer = $.jqplot.LinerAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LinerAxisRenderer;
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};

	//draw y-log plot
	this.logPlot = function (base){
		this.logPlotDataCheck();
		var base = base || 10; //log_x (10, 2 or Math.E)
		this.clearCanvas();
		this.options.axes.xaxis.renderer = $.jqplot.LinerAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.rendererOptions = { base: base };
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};

	//draw xy-log plot
	this.loglogPlot = function (base){
		this.logPlotDataCheck();
		var base = base || 10; //log_x (10, 2 or Math.E)
		this.clearCanvas();
		this.options.axes.xaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.xaxis.rendererOptions = { base: base };
		this.options.axes.yaxis.rendererOptions = { base: base };
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};
	
	//draw x-log plot
	this.loglinerPlot = function (base){
		this.logPlotDataCheck();
		var base = base || 10; //log_x (10, 2 or Math.E)
		this.clearCanvas();
		this.options.axes.xaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LinerAxisRenderer;
		this.options.axes.xaxis.rendererOptions = { base: base };
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};

	//replot
	this.replot = function (){
		this.clearCanvas();

		if(this.options.axes.yaxis.renderer == $.jqplot.LogAxisRenderer)
			this.logPlotDataCheck();

		for(var i=0; i< plotDatas.length ; i++)
			plot.series[i].data = plotDatas[i];
		plot.replot();
		plot.resetAxesScale();
		plot.replot();
	};

	//animation
	this.animationPlot = function(){
		this.clearCanvas();
		for(var i=0; i < plotDatas.length; i++)
			plot.series[i].data = plotDatas[i];
		plot.replot();
	};

	this.clearData = function (){
		plotDatas = [];
	};

	this.logPlotDataCheck = function (){
		delete y<0
		for(var i=0; i< plotDatas.length; i++){
			var _data = [];
			for(var j=0; j< plotDatas[i].length; j++){
				if(plotDatas[i][j][1] > 0)
					_data.push(plotDatas[i][j]);
			}
			plotDatas[i] = _data;
		}
	};

	this.clearCanvas = function (){
		document.getElementById(canvasDom).innerHTML = null;
	};
		
}

//////////////////////////////
// Math class method define
//////////////////////////////
function sin(theta){
	return Math.sin(theta);
}
function cos(theta){
	return Math.cos(theta);
}
function tan(theta){
	return Math.tan(theta);
}
function pow(a,x){
	return Math.pow(a,x);
}
function exp(x){
	return Math.exp(x);
}
function log(x){
	return Math.log(x);
}
function asin(x){
	return Math.asin(x);
}
function acos(x){
	return Math.acos(x);
}
function atan(x){
	return Math.atan(x);
}
function abs(x){
	return Math.abs(x);
}
