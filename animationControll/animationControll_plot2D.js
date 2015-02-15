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
// window event
/////////////////////////////////
window.addEventListener("load", function(){
		initEvent();
		plotStart();
		loop();
});

/////////////////////////////////
// initEvent
/////////////////////////////////
function initEvent(){
	document.getElementById("startButton").addEventListener("click", function(){
			if(stopFlag){
				stopFlag = false;
				for(var i=0; i < Step; i++){
					divs[i].style.display = "none";
					imgs[i].style.display = "none";
				}
			}
			else{
				stopFlag = true;
			}
	})

	document.getElementById("png").addEventListener("click", function(){
			var n = step % Step;
			document.getElementById("png").href = imgs[n].src;
			document.getElementById("png").download = "png_" + n + ".png";
	});
}

/////////////////////////////////
// define initEvent
/////////////////////////////////
var stopFlag = true;
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
		plot2D.options.cursor.zoom = true;
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
// 	loop();
}


/////////////////////////////////
// define loop
/////////////////////////////////
var step = 0;
function loop(){
	if(stopFlag == false){
		imgs[step%Step].style.display = "none";
		step++;
		imgs[step%Step].style.display = "inline";
	}
	else{
		imgs[step%Step].style.display = "none";
		divs[step%Step].style.display = "block";
	}
		
	if(stopFlag){
		document.getElementById("startButton").value = "start";
	}
	else{
		document.getElementById("startButton").value = "stop";
	}
	requestAnimationFrame(loop);
}

