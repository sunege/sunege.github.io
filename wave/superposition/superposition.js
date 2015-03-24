////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
		initEvent();
		threeStart();
});


////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
var stopFlag = true;
var resetFlag = false;
var wave1Flag = true;
var wave2Flag = false;
var wave3Flag = false;
var pngData;
var pngName;
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
			if($(this).prop('checked') == true){
				wave1Flag = true;
			}
			else{
				wave1Flag = false;
			}
	});
	$('#checkbox_wave2').click(function(){
			if($(this).prop('checked') == true){
				wave2Flag = true;
			}
			else{
				wave2Flag = false;
			}
	});
	$('#checkbox_wave3').click(function(){
			if($(this).prop('checked') == true){
				wave3Flag = true;
			}
			else{
				wave3Flag = false;
			}
	});

	//slider interface
	$('#slider_amp1').slider({
			min: 0,
			max: 5,
			step: 0.1,
			value: amp1,
			slide: function(event, ui){
				var value = ui.value;
				amp1 = value;
				document.getElementById("input_amp1").value = value;
			}
	});
	document.getElementById("input_amp1").value = amp1;

	$('#slider_freq1').slider({
			min: 0.01,
			max: 20,
			step: 0.01,
			value: freq1,
			slide: function(event, ui){
				var value = ui.value;
				freq1 = value;
				document.getElementById("input_freq1").value = value;
			}
	});
	document.getElementById("input_freq1").value = freq1;

	$('#slider_vel1').slider({
			min: 0,
			max: 10,
			step: 0.1,
			value: vel1,
			slide: function(event, ui){
				var value = ui.value;
				vel1 = value;
				document.getElementById("input_vel1").value = value;
			}
	});
	document.getElementById("input_vel1").value = vel1;

	$('#slider_amp2').slider({
			min: 0,
			max: 5,
			step: 0.1,
			value: amp2,
			slide: function(event, ui){
				var value = ui.value;
				amp2 = value;
				document.getElementById("input_amp2").value = value;
			}
	});
	document.getElementById("input_amp2").value = amp2;

	$('#slider_freq2').slider({
			min: 0.01,
			max: 20,
			step: 0.01,
			value: freq2,
			slide: function(event, ui){
				var value = ui.value;
				freq2 = value;
				document.getElementById("input_freq2").value = value;
			}
	});
	document.getElementById("input_freq2").value = freq2;

	$('#slider_vel2').slider({
			min: 0,
			max: 10,
			step: 0.1,
			value: vel2,
			slide: function(event, ui){
				var value = ui.value;
				vel2 = value;
				document.getElementById("input_vel2").value = value;
			}
	});
	document.getElementById("input_vel2").value = vel1;
};
////////////////////////////////////////
// define threeStart()
////////////////////////////////////////
function threeStart(){
	initThree();
	initCamera();
	initLight();
	initObject();
	loop();
}

/*  init Three functions  */

//global variables
var renderer, // renderer object
	 scene, // scene object
	 canvasFrame; //DOM element

////////////////////////////////////////
// define initThree()
////////////////////////////////////////
function initThree(){
	canvasFrame = document.getElementById('canvas-frame');

	//create renderer object
	renderer = new THREE.WebGLRenderer({ antialias: true });
	if(!renderer) alert('Fale: init three.js');

	//set renderer size
	renderer.setSize(canvasFrame.clientWidth, canvasFrame.clientHeight);

	//add canvas element to DOM
	canvasFrame.appendChild(renderer.domElement);

	//set renderer options
	renderer.setClearColor(0x000000, 1.0);
	renderer.shadowMapEnabled = true;

	//create scene object
	scene = new THREE.Scene();
}

////////////////////////////////////////
// define initCamera()
////////////////////////////////////////
//global variables
var camera, // camera object
	 trackball; // trackball object

function initCamera(){
	//create camera object
	var fov = 45,
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

	trackball.noRotate = false;
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
var directionalLight, //directionalLight object
	 ambientLight; // ambientlighLight object

function initLight(){
	//create directionalLight object
	directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);

	//set directionalLight options
	directionalLight.position.set(30, 30, 100);

	directionalLight.castShadow = true;

	//add scene
	scene.add(directionalLight);

	//create ambientLight object
	ambientLight = new THREE.AmbientLight(0x222222);

	//add scene
	scene.add(ambientLight);
}

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
var line1; //wave line object
var line2; //wave line object
var line3; //wave line object

//number of object
var N = 800;

/* Wave format */
//wave
var u1 = new Array(N+1);
var u2 = new Array(N+1);
var u3 = new Array(N+1);

//length param
var l = 15;
var dx = l/N;

//time param
var Step = 100;
var Time = 1;
var dt = Time / Step;
var time = 0;

//wave param
//wave1
var freq1 = 5; //wave length
var amp1 = 1; //ampritude
var vel1 = 3; //velocity
var direction1 = -1; //wave direction right:-1

//wave2
var freq2 = 5; //wave length
var amp2 = 1; //ampritude
var vel2 = 3; //velocity
var direction2 = 1; //wave direction left:1


function initObject(){
	calculate();
	scene.add(line1);
	scene.add(line2);
	scene.add(line3);
}
function calculate(){
	var geometry1 = new THREE.Geometry(); //geometry object
	var geometry2 = new THREE.Geometry(); //geometry object
	var geometry3 = new THREE.Geometry(); //geometry object
	var n=0;
	for(var i=0; i<=N; i++){
		var omega1 = 2*Math.PI*freq1;
		var omega2 = 2*Math.PI*freq2;
		var k1 = 2*Math.PI*freq1/vel1;
		var k2 = 2*Math.PI*freq2/vel2;

		var x = i*dx;
		u1[i] = amp1 * Math.sin(omega1*time + direction1*k1*x);
		u2[i] = amp2 * Math.sin(omega2*time + direction2*k2*x);
		u3[i] = u1[i] + u2[i];
		var vertex1 = new THREE.Vector3(x, u1[i], 0);
		var vertex2 = new THREE.Vector3(x, u2[i], 0);
		var vertex3 = new THREE.Vector3(x, u3[i], 0);

		//add vertex
		geometry1.vertices[n] = vertex1;
		geometry2.vertices[n] = vertex2;
		geometry3.vertices[n] = vertex3;
		n++;
	}
	var line1Material = new THREE.LineBasicMaterial({ color: 0xDD88FF ,linewidth: 4});
	var line2Material = new THREE.LineBasicMaterial({ color: 0x88DDFF ,linewidth: 4});
	var line3Material = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 4});
	line1 = new THREE.Line(geometry1, line1Material);
	line2 = new THREE.Line(geometry2, line2Material);
	line3 = new THREE.Line(geometry3, line3Material);

	
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
var step = 0;
var png_count = 0;
function loop(){
	//update trackball object
	trackball.update();
	if(resetFlag == true){
		time = 0;
		png_count = 0;
		//wave1
		var freq1 = 5; //wave length
		var amp1 = 1; //ampritude
		var vel1 = 3; //velocity
		var direction1 = -1; //wave direction right:-1

		//wave2
		var freq2 = 5; //wave length
		var amp2 = 1; //ampritude
		var vel2 = 3; //velocity
		var direction2 = 1; //wave direction left:1

		document.getElementById("input_amp1").value = amp1;
		document.getElementById("slider_amp1").value = amp1;

		resetFlag = false;
	}

	scene.remove(line1);
	scene.remove(line2);
	scene.remove(line3);

	if(stopFlag == false){
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

