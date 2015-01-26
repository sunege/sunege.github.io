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
			plot2D.linerPlot();
	});

	//log button click event
	document.getElementById("log").addEventListener("click", function(){
			plot2D.logPlot(2);
	});
}
	
function plotStart(){
	//create instance
	plot2D = new Plot2D('canvas-frame');
	var series = [];

	var N = 20,
		 x_min = 0,
		 x_max = 2;

	//data
	for(var a=1; a<=5; a++){
		data = [];
		series.push({ label: ' = pow( ' + a + ' , x) '} );

		for(var i=0; i<=N; i++){
			var x = x_min + (x_max - x_min) * i / N;
			var y = Math.pow(a, x);
			data.push([x, y]);
		}
		//pushData
		plot2D.pushData(data);
	}

	plot2D.options.series = series;
	plot2D.options.legend.location = "nw";
	plot2D.options.cursor.dblClickReset = true;

	plot2D.linerPlot();
}
