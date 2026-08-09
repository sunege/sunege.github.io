////////////////////////////////////////
// define window event 
////////////////////////////////////////
import { initThree, initLight } from '../../js/common/three-setup.js';

window.addEventListener("load", function(){
		initEvent();
		threeStart();
});


////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
let stopFlag = true;
let resetFlag = false;
let wave1Flag = true;
let wave2Flag = false;
let wave3Flag = false;
let pngData;
let pngName;
function initEvent(){
	document.getElementById("startButton").addEventListener("click", function(){
			if(stopFlag){
				stopFlag = false;
			}
			else{
				stopFlag = true;
			}
	});

	document.getElementById("png").addEventListener("click", function(){
			document.getElementById("png").href = pngData;
			document.getElementById("png").download = pngName;
	});

	document.getElementById("resetButton").addEventListener("click", function(){
			resetFlag = true;
	});
	document.getElementById("resetButton").value = "reset";

	//checkbox
	$('#checkbox_wave1').click(function(){
			if($(this).prop('checked') === true){
				wave1Flag = true;
			}
			else{
				wave1Flag = false;
			}
	});
	$('#checkbox_wave2').click(function(){
			if($(this).prop('checked') === true){
				wave2Flag = true;
			}
			else{
				wave2Flag = false;
			}
	});
	$('#checkbox_wave3').click(function(){
			if($(this).prop('checked') === true){
				wave3Flag = true;
			}
			else{
				wave3Flag = false;
			}
	});

	//slider interface
	$('#slider_direction1').slider({
			min: -1,
			max: 1,
			step: 2,
			value: direction1,
			slide: function(event, ui){
				const value = ui.value;
				direction1 = value;
			}
	});
	$('#slider_direction2').slider({
			min: -1,
			max: 1,
			step: 2,
			value: direction2,
			slide: function(event, ui){
				const value = ui.value;
				direction2 = value;
			}
	});
	$('#slider_amp1').slider({
			min: 0,
			max: 5,
			step: 0.1,
			value: amp1,
			slide: function(event, ui){
				const value = ui.value;
				amp1 = value;
				document.getElementById("input_amp1").value = value;
			}
	});
	document.getElementById("input_amp1").value = amp1;

	$('#slider_lambda1').slider({
			min: 0.01,
			max: 5,
			step: 0.01,
			value: lambda1,
			slide: function(event, ui){
				const value = ui.value;
				lambda1 = value;
				document.getElementById("input_lambda1").value = value;
				freq1 = vel/lambda1;
				document.getElementById("input_freq1").value = freq1;
				$("#slider_freq1").slider("value", freq1);
			}
	});
	document.getElementById("input_lambda1").value = lambda1;

	$('#slider_freq1').slider({
			min: 1,
			max: 30,
			step: 0.1,
			value: freq1,
			slide: function(event, ui){
				const value = ui.value;
				freq1 = value;
				document.getElementById("input_freq1").value = value;
				lambda1 = vel/freq1;
				document.getElementById("input_lambda1").value = lambda1;
				$('#slider_lambda1').slider("value", lambda1);
			}
	});
	document.getElementById("input_freq1").value = freq1;

	$('#slider_vel').slider({
			min: 0,
			max: 10,
			step: 0.1,
			value: vel,
			slide: function(event, ui){
				const value = ui.value;
				vel = value;
				document.getElementById("input_vel").value = value;
			}
	});
	document.getElementById("input_vel").value = vel;

	$('#slider_amp2').slider({
			min: 0,
			max: 5,
			step: 0.1,
			value: amp2,
			slide: function(event, ui){
				const value = ui.value;
				amp2 = value;
				document.getElementById("input_amp2").value = value;
			}
	});
	document.getElementById("input_amp2").value = amp2;

// 	$('#slider_lambda2').slider({
// 			min: 0.01,
// 			max: 20,
// 			step: 0.01,
// 			value: lambda2,
// 			slide: function(event, ui){
// 				var value = ui.value;
// 				lambda2 = value;
// 				document.getElementById("input_lambda2").value = value;
// 			}
// 	});
// 	document.getElementById("input_lambda2").value = lambda2;
	$('#slider_lambda2').slider({
			min: 0.01,
			max: 5,
			step: 0.01,
			value: lambda2,
			slide: function(event, ui){
				const value = ui.value;
				lambda2 = value;
				document.getElementById("input_lambda2").value = value;
				freq2 = vel/lambda2;
				document.getElementById("input_freq2").value = freq2;
				$("#slider_freq2").slider("value", freq2);
			}
	});
	document.getElementById("input_lambda2").value = lambda2;

	$('#slider_freq2').slider({
			min: 1,
			max: 30,
			step: 0.1,
			value: freq2,
			slide: function(event, ui){
				const value = ui.value;
				freq2 = value;
				document.getElementById("input_freq2").value = value;
				lambda2 = vel/freq2;
				document.getElementById("input_lambda2").value = lambda2;
				$('#slider_lambda2').slider("value", lambda2);
			}
	});
	document.getElementById("input_freq2").value = freq2;

};
////////////////////////////////////////
// define threeStart()
////////////////////////////////////////
function threeStart(){
	({ renderer, scene, canvasFrame } = initThree());
	initCamera();
	initLight(scene, { positions: [[30, 30, 100]], ambient: 0x222222 });
	initObject();
	loop();
}

/*  init Three functions  */

//global variables
let renderer, // renderer object
	 scene, // scene object
	 canvasFrame;////////////////////////////////////////
// define initCamera()
////////////////////////////////////////
//global variables
let camera, // camera object
	 trackball; // trackball object

function initCamera(){
	//create camera object
	const fov = 45,
		 aspect = canvasFrame.clientWidth/canvasFrame.clientHeight,
		 near = 1,
		 far = 10000;
	camera = new THREE.PerspectiveCamera(45, aspect, near, far);

	//set camera options
	camera.position.set(l/2, 0, 10);
	camera.up.set(0,1,0);
	camera.lookAt({x: l/2, y:0, z: 0});

	//create trackball object
	trackball = new THREE.TrackballControls(camera, canvasFrame);

	//set trackball options
	trackball.screen.width = canvasFrame.clientWidth;
	trackball.screen.height = canvasFrame.clientHeight;
	trackball.screen.offsetLeft = canvasFrame.getBoundingClientRect().left;
	trackball.screen.offsetTop = canvasFrame.getBoundingClientRect().top;

    trackball.noRotate = true;
	trackball.rotateSpeed = 2.0;

	trackball.noZoom = false;
	trackball.zoomSpeed = 0.5;

	trackball.noPan = false;
	trackball.panSpeed = 0.6;
	trackball.target = new THREE.Vector3(l/2, 0, 0);

	trackball.staticMoving = true;

	trackball.dynamicDampingFactor = 0.3;
}

////////////////////////////////////////
// define initLight()
////////////////////////////////////////
//global variables
let directionalLight, //directionalLight object
	 ambientLight; // ambientlighLight object

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
let line1; //wave line object
let line2; //wave line object
let line3; //wave line object

//number of object
const N = 800;

/* Wave format */
//wave
const u1 = new Array(N+1);
const u2 = new Array(N+1);
const u3 = new Array(N+1);

//length param
const l = 10;
const dx = l/N;

//time param
const Step = 300;
const Time = 1;
const dt = Time / Step;
let time = 0;

//wave param
let vel = 3;
//wave1
let lambda1 = 2; //wave length
let freq1 = vel/lambda1;
let amp1 = 1; //ampritude
let direction1 = 1; //wave direction right:1

//wave2
let lambda2 = 2; //wave length
let freq2 = vel/lambda2;
let amp2 = 1; //ampritude
let direction2 = -1; //wave direction left:-1

//grid
let grid;
const grid_diff = 0.5; //グリッドの間隔
const num_grid_x = 21; //x方向の本数 奇数を入力
const num_grid_y = parseInt(l/grid_diff + 1); //y方向の本数


function initObject(){
	let gridGeometry, gridMaterial, v1, v2;
	//calculate wave and create wave
	calculate();
	scene.add(line1);
	scene.add(line2);
	scene.add(line3);

	//create grid
	grid = new Array(num_grid_x + num_grid_y);
	//pallarel x axial
	for(let i=0; i<num_grid_x; i++){
		gridGeometry = new THREE.Geometry();
		const y = (i-(num_grid_x - 1) / 2) * grid_diff
		v1 = new THREE.Vector3(0, y, -0.05);  
		v2 = new THREE.Vector3(l, y, -0.05);  
		gridGeometry.vertices.push(v1);
		gridGeometry.vertices.push(v2);
		if(i===(num_grid_x - 1) / 2){
			gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 2});
		}
		else{
			gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 1});
		}
		grid[i] = new THREE.Line(gridGeometry, gridMaterial);
		scene.add(grid[i]);
	}
	//pallarel y axial
	for(let i=0; i<num_grid_y; i++){
		gridGeometry = new THREE.Geometry();
		const x = i * grid_diff
		v1 = new THREE.Vector3(x, (-1)*((num_grid_x - 1) / 2) * grid_diff, -0.05);  
		v2 = new THREE.Vector3(x, ((num_grid_x - 1) / 2) * grid_diff, -0.05);  
		gridGeometry.vertices.push(v1);
		gridGeometry.vertices.push(v2);
		gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 1});
		grid[i + num_grid_x] = new THREE.Line(gridGeometry, gridMaterial);
		scene.add(grid[i + num_grid_x]);
	}

}
function calculate(){
	const geometry1 = new THREE.Geometry(); //geometry object
	const geometry2 = new THREE.Geometry(); //geometry object
	const geometry3 = new THREE.Geometry(); //geometry object
	let n=0;
	for(let i=0; i<=N; i++){
		const omega1 = 2*Math.PI*vel/lambda1;
		const omega2 = 2*Math.PI*vel/lambda2;
		const k1 = 2*Math.PI/lambda1;
		const k2 = 2*Math.PI/lambda2;

		const x = i*dx;
		u1[i] = amp1 * Math.sin(omega1*time - direction1*k1*x);
		u2[i] = amp2 * Math.sin(omega2*time - direction2*k2*x);
		u3[i] = u1[i] + u2[i];
		const vertex1 = new THREE.Vector3(x, u1[i], 0);
		const vertex2 = new THREE.Vector3(x, u2[i], 0);
		const vertex3 = new THREE.Vector3(x, u3[i], 0);

		//add vertex
		geometry1.vertices[n] = vertex1;
		geometry2.vertices[n] = vertex2;
		geometry3.vertices[n] = vertex3;
		n++;
	}
	const line1Material = new THREE.LineBasicMaterial({ color: 0xDD88FF ,linewidth: 4});
	const line2Material = new THREE.LineBasicMaterial({ color: 0x88DDFF ,linewidth: 4});
	const line3Material = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 4});
	line1 = new THREE.Line(geometry1, line1Material);
	line2 = new THREE.Line(geometry2, line2Material);
	line3 = new THREE.Line(geometry3, line3Material);
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
let step = 0;
let png_count = 0;
function loop(){
	//update trackball object
	trackball.update();

	//reset
	if(resetFlag === true){
		time = 0;
		png_count = 0;
		//wave1
		lambda1 = 2; //wave length
		amp1 = 1; //ampritude
		direction1 = 1; //wave direction right:-1
		document.getElementById("input_amp1").value = amp1;
		$('#slider_amp1').slider("value", amp1);
		document.getElementById("input_lambda1").value = lambda1;
		$('#slider_lambda1').slider("value", lambda1);
		document.getElementById("input_freq1").value = vel/lambda1;
		$('#slider_freq1').slider("value", vel/lambda1);
		document.getElementById("slider_direction1").value = direction1;
		$('#slider_direction1').slider("value", direction1);

		//wave2
		lambda2 = 2; //wave length
		amp2 = 1; //ampritude
		direction2 = -1; //wave direction left:1
// 		document.getElementById("input_amp2").value = amp2;
// 		document.getElementById("slider_amp2").value = amp2;
// 		document.getElementById("input_lambda2").value = lambda2;
// 		document.getElementById("slider_lambda2").value = lambda2;
// 		document.getElementById("slider_direction2").value = direction2;

		document.getElementById("input_amp2").value = amp2;
		$('#slider_amp2').slider("value", amp2);
		document.getElementById("input_lambda2").value = lambda2;
		$('#slider_lambda2').slider("value", lambda2);
		document.getElementById("input_freq2").value = vel/lambda2;
		$('#slider_freq2').slider("value", vel/lambda2);
		document.getElementById("slider_direction2").value = direction2;
		$('#slider_direction2').slider("value", direction2);

		resetFlag = false;
	}

	scene.remove(line1);
	scene.remove(line2);
	scene.remove(line3);

	if(stopFlag === false){
		step++;
		time += dt;
	}
	calculate();

	if(wave1Flag){
		scene.add(line1);
	}
	if(wave2Flag){
		scene.add(line2);
	}
	if(wave3Flag){
		scene.add(line3);
	}
	//init clear color
	renderer.clear();

	//rendering
	renderer.render(scene, camera);

	if(stopFlag){
		png_count++;
		if(png_count > 30){
			document.getElementById("startButton").value = "start";
			pngData = renderer.domElement.toDataURL("image/png");
			pngName = "png_"+step%Step+".png";
			png_count = 0;
		}
	}
	else{
		document.getElementById("startButton").value = "stop";
	}

	//call loop function
	requestAnimationFrame(loop);
}

