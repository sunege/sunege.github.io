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
var startTime; //FPS
var divs = [];
var imgs = [];
function plotStart(){
	var frame = document.getElementById('canvas-frame');
	for(var tn = 0; tn < Step; tn++){
		//create div element
		divs[tn] = document.createElement("div");
		//set id
		divs[tn].id = "f" + tn;
		//set size
		divs[tn].style.width = frame.clientWidth + "px";
		divs[tn].style.height = frame.clientHeight + "px";
		//add div
		frame.appendChild(divs[tn]);
		//create plot2d object
		var plot2D = new Plot2D(divs[tn].id);
		//options
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

		//calculate data
		var data = f(tn);
		//add data
		plot2D.pushData(data);
		//liner plot
		plot2D.linerPlot();
		//create imgs
		imgs[tn] = $("#" + divs[tn].id).jqplotToImageElem();
		//add img element
		frame.appendChild(imgs[tn]);
		imgs[tn].style.display = "none";
		divs[tn].style.display = "none";
	}
	startTime = new Date();
	loop();
}


/////////////////////////////////
// define loop
/////////////////////////////////
var step = 0;
function loop(){
	imgs[step%Step].style.display = "none";
	step++;
	imgs[step%Step].style.display = "inline";
	var time = new Date() - startTime;
	document.getElementById("fps").innerHTML = "FPS:" + (step/(time/1000)).toFixed(1);
	requestAnimationFrame(loop);
}

