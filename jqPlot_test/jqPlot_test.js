window.addEventListener("load", function () {
		plotStart();
});

function plotStart(){
	var data = [];
	var plotDatas = [];
	var N = 30;
		 x_min = -2,
		 x_max = 2;

	for(var a = 1; a <=5; a++){
		data = [];
		for(var i = 0; i <= N; i++){
			var x = x_min + (x_max - x_min) * i / N;
			var y = Math.sin(a * Math.PI * i/10);
			data.push([x, y]);
		}
		plotDatas.push(data);
	}

	var options = {
		axes: {
			xaxis: {
				label: 'x',
				min: -2,
				max: 2,
				tickInterval: 0.5
			},
			yaxis: {
				label: 'y',
				min: -2,
				max: 2,
				tickInterval: 1.0
			}
		},
		legend: {
			show: true,
			labels: ['a=1', 'a=2', 'a=3', 'a=4', 'a=5'],
			location: 'ne',
			placement: 'insideGrid',
			showSwatches: true
		}
	};

	$.jqplot("canvas-frame", plotDatas, options);
}
