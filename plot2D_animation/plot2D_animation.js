/////////////////////////////////
// plot param
/////////////////////////////////
//plot data param
var N = 100;
var x_min = 0;
var x_max = 20;

//period
var Step = 100;

//[rad/step]
var omega = 2 * Math.PI / Step;

//[rad/m]
var k = Math.PI / 3;

function f(t){
	var data = [];
	//calculate plot
	for(var i = 0; i<= N; i++){
		var x = x_min + (x_max - x_min) * i/N;
		var y = Math.sin(k*x - omega*t);
		data.push([x, y]);
	}
	return data;
}

/////////////////////////////////
// requestAnimationFrame
/////////////////////////////////
var requestAnimationFrame
	= window.requestAnimationFrame ||
	  window.moxRequestAnimationFrame ||
	  window.oRequestAnimationFrame ||
	  window.msRequestAnimationFrame ||
	  function(callback, element){ window.setTimeout(callback, 1000/60); };

/////////////////////////////////
// define initEvent
/////////////////////////////////
window.addEventListener("load", function(){
		plotStart();
});


/////////////////////////////////
// define initEvent
/////////////////////////////////
var plot2D; //Plot2D object
var startTime; //FPS
function plotStart(){
	plot2D = new Plot2D('canvas-frame');
	plot2D.options.series = [{ label: 'y=sin(kx-omegat)', markerOptions: {show:false}}];

	plot2D.options.legend.location = "nw";
	plot2D.options.axesDefaults.pad = 1;
	plot2D.options.axes.xaxis.min = 0;
	plot2D.options.axes.xaxis.max = 20;
	plot2D.options.axes.xaxis.tickInterval = 2;
	plot2D.options.axes.yaxis.min = -1;
	plot2D.options.axes.yaxis.max = 1;
	plot2D.options.axes.yaxis.tickInterval = 0.2;
	plot2D.options.cursor.show = true;
	plot2D.options.highlighter.show = true;

	//calculate plot data
	var data = f(step);
	//add data
	plot2D.pushData(data);
	//liner plot
	plot2D.linerPlot();
	//get start time
	startTime = new Date();
	loop();
}


/////////////////////////////////
// define loop
/////////////////////////////////
var step = 0;
function loop(){
	plot2D.clearData();
	var data = f(step);
	plot2D.pushData(data);
	plot2D.animationPlot();
	var time = new Date() - startTime;
	document.getElementById("fps").innerHTML = "FPS:" + (step/(time/1000)).toFixed(1);
	step++;
	requestAnimationFrame(loop);
}

