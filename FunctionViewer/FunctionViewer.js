//global 
var plot2D; 

////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
	resizeTo(850, 610);  //window size
	initEvent();
	plotStart();
});

////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
function initEvent(){
	$('#tabs').tabs({ heightStyle: 'content'});
	//liner button click event
// 	document.getElementById("liner").addEventListener("click", function(){
// 			plotStart();
// 			plot2D.Plot();
// 	});

	//log button click event
// 	document.getElementById("log").addEventListener("click", function(){
// 			plotStart();
// 			plot2D.logPlot(Math.E);
// 	});

	//jQueryUI slider
	$("#slider_x").slider({
			range: true,
			min: -100,
			max: 100,
			step: 1,
			values: [-5, 5],
			//slide ivent
			slide: function(event, ui){
				var values = ui.values;
				document.getElementById("x_min").value = values[0];
				document.getElementById("x_max").value = values[1];
				calculate();
				plot2D.replot();
			}
	});
	$("#slider_N").slider({
			min: 1,
			max: 100,
			step: 1,
			value: 20,
			//slide ivent
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("N").value = value;
				calculate();
				plot2D.replot();
			}
	});


	//click event
	document.getElementById("graphPlot").addEventListener("click", function(){
			calculate();
			//radio button scale plot
			var radioList = document.getElementsByName("scale");
			for(var i=0; i< radioList.length; i++){
				if(radioList[i].checked && radioList[i].value == "liner")
					plot2D.linerPlot();
				else if(radioList[i].checked && radioList[i].value == "log")
					plot2D.logPlot(10);
			}
	});

	//cordinate param
	document.getElementById("N").value = 20;
	document.getElementById("x_min").value = -5;
	document.getElementById("x_max").value = 5;

	//new value cordinate param event
	document.getElementById("N").addEventListener("change", function(){
			calculate();
			plot2D.replot();
	});
	document.getElementById("x_min").addEventListener("change", function(){
			calculate();
			plot2D.replot();
	});
	document.getElementById("x_max").addEventListener("change", function(){
			calculate();
			plot2D.replot();
	});
}
	
////////////////////////////////////////
// define plotStart()
////////////////////////////////////////
function plotStart(){
	//create instance
	plot2D = new Plot2D('canvas-frame');
	//calculate
	calculate();
	//plot
	plot2D.linerPlot();
}

////////////////////////////////////////
// define calculate()
////////////////////////////////////////
function calculate(){
	//clear data
	plot2D.clearData();

	//get input param
	var x_min = parseFloat(document.getElementById("x_min").value);
	var x_max = parseFloat(document.getElementById("x_max").value);
	var N = parseFloat(document.getElementById("N").value);
	//input param = slider value
	$("#slider_x").slider({values: [x_min, x_max] });
	$("#slider_N").slider({values: N});

	//get checkbox param
	var showLine = document.getElementById("showLine").checked;
	var showMark = document.getElementById("showMark").checked;
	var useLegend = document.getElementById("useLegend").checked;

	//data option []
	var series = [];

	//get text
	var text_function = document.getElementById("text_function").value;
	var fs = text_function.split("\n");

	for(var n=0; n<fs.length; n++){
		series.push({
				showLine: showLine,
				label: "y=" + fs[n],
				markerOptions: { show: showMark }
		});
		//init plotdata
		var data = [];
		for(var i=0; i<=N; i++){
			var x = x_min + (x_max - x_min) * i / N;
			var y = eval(fs[n]);
			data.push([x, y]);
		}
		//add plotdata
		plot2D.pushData(data);
	}
	//set options
	plot2D.options.series = series;

	//legend options
	if(useLegend){
		plot2D.options.legend.show = true;
		//get radio button DOM
		var radioList = document.getElementsByName("legend");

		//set legend options from radio button
		for(var i=0; i< radioList.length; i++){
			if(radioList[i].checked){
				plot2D.options.legend.location = radioList[i].value;
				break;
			}
		}
	} else{
		//set no legend
		plot2D.options.legend.show = false;
	}


	plot2D.Plot();
}
