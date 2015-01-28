//global 
var plot2D; 

//event
window.addEventListener("load", function () {
		plotStart();
		initEvent();
});

function initEvent(){
	//liner button click event
	document.getElementById("liner").addEventListener("click", function(){
			plotStart();
			plot2D.linerPlot();
	});

	//log button click event
	document.getElementById("log").addEventListener("click", function(){
			plotStart();
			plot2D.logPlot(Math.E);
	});
}
	
function plotStart(){
	//create instance
	plot2D = new Plot2D('canvas-frame');

	var text_function = document.getElementById("text_function").value;
	var fs = text_function.split("\n");

	var series = [];

	var N = 20,
		 x_min = 0,
		 x_max = 2;

	for(var n=0; n<fs.length; n++){
		series.push({
				showLine: true,
				label: "y=" + fs[n],
				markerOptions: { show: true }
		});
		var data = [];
		for(var i=0; i<=N; i++){
			var x = x_min + (x_max + x_min) * i / N;
			var y = eval(fs[n]);
			data.push([x, y]);
		}
		plot2D.pushData(data);
	}

	plot2D.options.series = series;
	plot2D.options.legend.location = "nw";
	plot2D.options.cursor.dblClickReset = true;

	plot2D.linerPlot();
}
