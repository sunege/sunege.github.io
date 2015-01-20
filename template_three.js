//////////////////////////////
// Windowイベントの定義
//////////////////////////////
// HTML文章読み込み完了後に実行するイベントの定義
window.addEventListener("load", function (){
	threeStart(); //three.jsのスタート関数
});
	
//////////////////////////////
//three.jsスタート関数の定義
//////////////////////////////
function threeStart(){
	initThree(); //init three.js
	initCamera(); //init camera
	initObject(); //init object
	initLight(); //init light
	draw(); //draw
}
//////////////////////////////
//three.jsスタート関数の定義
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
	if(!renderer) alert('three.jsの初期化に失敗しました');
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
var cube; //primitive object

function initObject(){

	//create geometry
	//create material

}

//////////////////////////////
// def initLight()
//////////////////////////////
// global var

function initLight(){
	//create object

}

//////////////////////////////
// def draw()
//////////////////////////////
function draw(){
	//init clear color
	renderer.clear();
	//rendering
	renderer.render(scene, camera);
}
