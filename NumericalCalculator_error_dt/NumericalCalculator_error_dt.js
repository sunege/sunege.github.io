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
	$("#slider_t").slider({
			min: 0,
			max: 20,
			step: 1,
			values: [0, 5],
			//slide ivent
			slide: function(event, ui){
				var values = ui.values;
				document.getElementById("t_min").value = values[0];
				document.getElementById("t_max").value = values[1];
				calculate();
// 				plot2D.replot();
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
// 				plot2D.replot();
			}
	});


	//click event
	document.getElementById("graphPlot").addEventListener("click", function(){
			calculate();
			//radio button scale plot
			var x_scaleList = document.getElementsByName("x_scale");
			var y_scaleList = document.getElementsByName("y_scale");
			var x_scale, y_scale;
			for(var i=0; i<x_scaleList.length; i++){
				if(x_scaleList[i].checked && x_scaleList[i].value == "liner")
					x_scale = "liner";
				else if(x_scaleList[i].checked && x_scaleList[i].value == "log")
					x_scale = "log";
			}
			for(var i=0; i<y_scaleList.length; i++){
				if(y_scaleList[i].checked && y_scaleList[i].value == "liner")
					y_scale = "liner";
				else if(y_scaleList[i].checked && y_scaleList[i].value == "log")
					y_scale = "log";
			}

			//plot
			if(x_scale == "liner" && y_scale == "liner") plot2D.linerPlot();
			if(x_scale == "liner" && y_scale == "log") plot2D.logPlot();
			if(x_scale == "log" && y_scale == "log") plot2D.loglogPlot();
			if(x_scale == "log" && y_scale == "liner") plot2D.loglinerPlot();
	});

	//cordinate param
	document.getElementById("N").value = 20;
	document.getElementById("t_min").value = 0;
	document.getElementById("t_max").value = 5;

	//new value cordinate param event
	document.getElementById("N").addEventListener("change", function(){
			calculate();
			plot2D.replot();
	});
	document.getElementById("t_min").addEventListener("change", function(){
			calculate();
			plot2D.replot();
	});
	document.getElementById("t_max").addEventListener("change", function(){
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
	var t_min = parseFloat(document.getElementById("t_min").value);
	var t_max = parseFloat(document.getElementById("t_max").value);
	var N = parseFloat(document.getElementById("N").value);
	//input param = slider value
	$("#slider_t").slider({values: [t_min, t_max] });
	$("#slider_N").slider({values: N});

	//get checkbox param
	var showLine = document.getElementById("showLine").checked;
	var showMark = document.getElementById("showMark").checked;
	var useLegend = document.getElementById("useLegend").checked;

	//get Analysis solution
	var text_function = document.getElementById("text_function").value;
	var functions = text_function.split("\n");

	//get dt and init condition
	var text_parameter = document.getElementById("text_parameter").value;
	var parameters = text_parameter.split("\n");
	eval("var " + parameters[0]);

	//get Algorithm
	var text_algorithm = document.getElementById("text_algorithm").value;
	var algorithms = text_algorithm.split("\n\n");
	
	//data option []
	var series = [];

	////////////////////////////////////////
	// plot analysis solution
	////////////////////////////////////////
	for(var n=1; n<functions.length; n++){
		//space >> continue
		if(functions[n] == "") continue;
		var label = "|Delta_x|" + functions[n];
		series.push({
				showLine: showLine,
				label: label,
				markerOptions: { show: showMark }
		});
		var data = [];
		for(var m=0; m<=N; m++){
			var dt = Math.pow(10, -5*m/N);
			var dx = eval(functions[n]);
			data.push([dt, dx]);
			if(dx < 1E-16){
			  	break;
			}
		}
		plot2D.pushData(data);
	}
	////////////////////////////////////////
	// plot numerical analysis
	////////////////////////////////////////
	for(var n=0; n<algorithms.length; n++){
		var as = algorithms[n].split("//");
		var label = as[0];
		var algorithm = as[1];
		series.push({
				showLine: false,
				label: label, 
				markerOptions: { show: true}
		});
		var data = [];
		for(var m=0; m<=N; m++){
			var dt = Math.pow(10, -5*m/N);
			var t = t_min;
			eval(text_parameter);
			while(t <= t_max){
				t += dt;
				eval(algorithm);
			}
			var dx = Math.abs(x - eval(functions[0]));
			data.push([dt, dx]);
		}
		plot2D.pushData(data);
	}


	//set options
	plot2D.options.series = series;

	//axes options
	plot2D.options.axes.xaxis.label = "delta_t";
	plot2D.options.axes.yaxis.label = "x_error";

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
