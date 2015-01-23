//////////////////////////////
// Window event
//////////////////////////////

window.addEventListener("load", function (){
	threeStart(); //three.js start
});
	
//////////////////////////////
//def threeStart()
//////////////////////////////
function threeStart(){
	initThree(); //init three.js
	initCamera(); //init camera
	initObject(); //init object
	initLight(); //init light
	loop(); //loop function
}
//////////////////////////////
//def initThree()
//////////////////////////////
// global var
var renderer, //renderer object
	 scene, //scene object
	 canvasFrame; //frame DOM element
function initThree(){
	//get canvas DOM element
	canvasFrame = document.getElementById('canvas-frame');
	//create renderer object
	renderer = new THREE.WebGLRenderer({antialias: true});
	if(!renderer) alert('faild : init three.js');
	//set size of renderer
	renderer.setSize(canvasFrame.clientWidth, canvasFrame.clientHeight);
	//add canvas to frame
	canvasFrame.appendChild(renderer.domElement);
	//set renderer clear color
	renderer.setClearColor(0x000000, 1.0);
	//create scene object
	scene = new THREE.Scene();
}

//////////////////////////////
// def initCamera()
//////////////////////////////
// global var
var camera;
function initCamera(){
	var fov = 45;
	var aspect = canvasFrame.clientWidth / canvasFrame.clientHeight;
	var near = 1;
	var far = 1000;
	//create camera object
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	//camera position
	camera.position.set(100, 100, 100);
	//camera up vector
	camera.up.set(0, 0, 1);
	//camera center vector
	camera.lookAt({x: 0, y: 0, z: 0});
}

//////////////////////////////
// def initObject()
//////////////////////////////
// global var
var axis; //axis object
var cube = []; //primitive object

function initObject(){
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
	axis.position.set(0, 0, 0);


	//create geometry
	var geometry = new THREE.BoxGeometry(20, 20, 20);
	//create material
	var material = new THREE.MeshLambertMaterial({color: 0xFF0000,wireframe: true});
	//create object
	cube[0] = new THREE.Mesh(geometry, material);
	//add object
	scene.add(cube[0]);
	//position
	cube[0].position.set(0, -30, 0);


	//create geometry
	var geometry = new THREE.BoxGeometry(20, 20, 20);
	//create material
	var material = new THREE.MeshLambertMaterial({color: 0x00FF00,wireframe: true});
	//create object
	cube[1] = new THREE.Mesh(geometry, material);
	//add object
	scene.add(cube[1]);
	//position
	cube[1].position.set(0, 0, 0);



	//create geometry
	var geometry = new THREE.BoxGeometry(20, 20, 20);
	//create material
	var material = new THREE.MeshLambertMaterial({color: 0x0000FF, wireframe: true});
	//create object
	cube[2] = new THREE.Mesh(geometry, material);
	//add object
	scene.add(cube[2]);
	//position
	cube[2].position.set(0, 30, 0);



}

//////////////////////////////
// def initLight()
//////////////////////////////
// global var
var directionalLight;

function initLight(){
	//create object
	directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	//light position
	directionalLight.position.set(50, 50, 100);
	//add light
	scene.add(directionalLight);

	//create object
	directionalLight1 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	//light position
	directionalLight1.position.set(-50, -50, -100);
	//add light
	scene.add(directionalLight1);
}

//////////////////////////////
// def loop()
//////////////////////////////
//global var
var step = 0; //step count

function loop(){
	//increment of step
	step++;

	//rotation cube
	cube[0].rotation.set(step / 100, 0, 0);
	cube[1].rotation.set(0, step / 100 , 0);
	cube[2].rotation.set(0, 0 , step / 100);

	//rotation light
	var cx = 100 * Math.cos(step / 50);
	var cy = 100 * Math.sin(step / 50);
	//set light
	directionalLight.position.set(cx, cy, 100);


	//rotation camera
	var cameraX = 100 * Math.cos(step / 100);
	var cameraY = 100 * Math.sin(step / 100);
	//set camra 
	camera.position.set(cameraX, cameraY, 100);
	camera.up.set(0, 0, 1);
	camera.lookAt({x: 0, y: 0, z: 0});


	//init clear color
	renderer.clear();
	//rendering
	renderer.render(scene, camera);
	//loop
	requestAnimationFrame(loop);
}
