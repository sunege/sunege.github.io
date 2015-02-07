////////////////////////////////////////
// define physics class
////////////////////////////////////////
//class ball
var Ball = function(parameter){
	this.radius = parameter.radius;
	this.x = parameter.x;
	this.y = parameter.y;
	this.z = parameter.z;
};

//create ball object
var ball = new Ball({ radius: 50, x: 0, y: 0, z: 75});

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
function initEvent(){
	//tab interface
	$('#tabs').tabs({ heightStyle: 'content'});

	//slider interface
	$('#slider_x').slider({
			min: -100,
			max: 100,
			step: 1,
			value: ball.x,
			slide: function(event, ui){
				//get slider value
				var value = ui.value || 0;
				ball.x = value;
				document.getElementById("input_x").value = value;
			}
	});
	$('#slider_y').slider({
			min: -100,
			max: 100,
			step: 1,
			value: ball.y,
			slide: function(event, ui){
				//get slider value
				var value = ui.value || 0;
				ball.y = value;
				document.getElementById("input_y").value = value;
			}
	});
	$('#slider_z').slider({
			min: 0,
			max: 200,
			step: 1,
			value: ball.z,
			slide: function(event, ui){
				//get slider value
				var value = ui.value || 0;
				ball.z = value;
				document.getElementById("input_z").value = value;
			}
	});

	//input interface
	document.getElementById("input_x").value = ball.x;
	document.getElementById("input_x").addEventListener("change", function(){
			//get input value
			var value = parseFloat(this.value) || 0;
			ball.x = value;
			//set slider position
			$('#slider_x').slider({ value: value });
	});
	document.getElementById("input_y").value = ball.y;
	document.getElementById("input_y").addEventListener("change", function(){
			//get input value
			var value = parseFloat(this.value) || 0;
			ball.y = value;
			//set slider position
			$('#slider_y').slider({ value: value });
	});
	document.getElementById("input_z").value = ball.z;
	document.getElementById("input_z").addEventListener("change", function(){
			//get input value
			var value = parseFloat(this.value) || 0;
			ball.z = value;
			//set slider position
			$('#slider_z').slider({ value: value });
	});

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
	renderer.setClearColor(0xE1FCFF, 1.0);
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
	camera.position.set(1000, 0, 300);
	camera.up.set(0,0,1);
	camera.lookAt({x: 0, y:0, z: 100});

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
	trackball.target = new THREE.Vector3(0, 0, 100);

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
	directionalLight.position.set(100, 100, 100);

	directionalLight.castShadow = true;

	//add scene
	scene.add(directionalLight);

	//create ambientLight object
	ambientLight = new THREE.AmbientLight(0x777777);

	//add scene
	scene.add(ambientLight);
}

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
var sphere; //sphere object

function initObject(){
	//create geometry
	var geometry = new THREE.SphereGeometry( ball.radius, 20, 20 );
	//create material
	var material = new THREE.MeshLambertMaterial({ color: 0xFF0000, ambient: 0x880000 });

	//create sphere object
	sphere = new THREE.Mesh(geometry, material);

	//add scene
	scene.add(sphere);

	//create shadow
	sphere.castShadow = true;
	
	/*  floar drow  */
	var yuka_n = 20,
		 yuka_w = 100;
	for(var i=-yuka_n/2; i<=yuka_n/2; i++){
		for(var j=-yuka_n/2; j<=yuka_n/2; j++){
			//position
			var x = j*yuka_w;
			var y = i*yuka_w;
			geometry = new THREE.PlaneGeometry(yuka_w, yuka_w);
			if(Math.abs(i+j) % 2 == 0){
				material = new THREE.MeshLambertMaterial({ color: 0x999999, ambient: 0x050505});
			}else{
				material = new THREE.MeshLambertMaterial({ color: 0x4d4d4d, ambient: 0x050505});
			}
			var plane = new THREE.Mesh(geometry, material);
			plane.position.set(x, y, 0);
			plane.receiveShadow = true;
			scene.add(plane);
		}
	}
}

////////////////////////////////////////
// define loop()
////////////////////////////////////////
function loop(){
	//update trackball object
	trackball.update();

	//set sphere position
	sphere.position.set(ball.x, ball.y, ball.z);
	
	//init clear color
	renderer.clear();

	//rendering
	renderer.render(scene, camera);

	//call loop function
	requestAnimationFrame(loop);
}

