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
	$('#tabs').tabs({ heightStyle: 'content'});
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
	camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 100);

	//set camera options
	camera.position.set(0, 0, 50);
	camera.up.set(0,1,0);
	camera.lookAt({x: 0, y:0, z: 0});

	//create trackball object
	trackball = new THREE.TrackballControls(camera, canvasFrame);

	trackball.enabled = false;

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
	trackball.target = new THREE.Vector3(0, 0, 0);

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
var lattice; //sphere object

var N = 100;
var l = 1;
var x_ = 0;
var y_ = 0;
var sigma2 = 200;
var z0 = 50;

var R = 20;
var omega = Math.PI/50;

function initObject(){
	//create geometry
	var geometry = new THREE.Geometry();
	var colors = new Array();
	for(var j=0; j <= N; j++){
		for(var i=0; i <= N; i++){
			//calculate vartex
			var x = (-N/2 + i) * l;
			var y = (-N/2 + j) * l;
			var z = z0 * Math.exp(-((x - x_) * (x -x_) + (y - y_) * (y -y_)) / (2 * sigma2)); 
			var vertex = new THREE.Vector3(x, y, 0);
			//add vertex
			geometry.vertices.push(vertex);
			colors.push(new THREE.Color().setRGB(z/z0, 0, 0));
		}
	}
	for(var j=0; j < N; j++){
		for(var i=0; i < N; i++){
			var color1=[];
			var color2=[];
			color1[0] = colors[(N+1)*j+i];
			color1[1] = colors[(N+1)*j+i+1];
			color1[2] = colors[(N+1)*(j+1)+i+1];

			color2[0] = colors[(N+1)*j+i];
			color2[1] = colors[(N+1)*(j+1)+i+1];
			color2[2] = colors[(N+1)*(j+1)+i];
			var face = new THREE.Face3( (N+1)*j+i, (N+1)*j+i+1,  (N+1)*(j+1)+i+1, null, color1 );
			geometry.faces.push(face);
			face = new THREE.Face3( (N+1)*j+i, (N+1)*(j+1)+i+1, (N+1)*(j+1)+i, null, color2 );
			geometry.faces.push(face);
		}
	}

	geometry.computeFaceNormals();

	//create material
	var material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, vertexColors: THREE.VertexColors});

	//create sphere object
	lattice = new THREE.Mesh(geometry, material);

	//add scene
	scene.add(lattice);

	//create shadow
	// 	lattice.castShadow = true;

}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
var step = 0;

function loop(){
	//update trackball object
	trackball.update();

	step++;

	var colors = new Array();

	var x_ = R * Math.cos(omega * step);
	var y_ = R * Math.sin(omega * step);

	for(var j=0; j <= N; j++){
		for(var i=0; i <= N; i++){
			//calculate vartex
			var x = (-N/2 + i) * l;
			var y = (-N/2 + j) * l;
			var z = z0 * Math.exp(-((x - x_) * (x -x_) + (y - y_) * (y -y_)) / (2 * sigma2)); 
			colors.push(new THREE.Color().setRGB(z/z0, 0, 0));
		}
	}
	var n = 0;
	for(var j=0; j < N; j++){
		for(var i=0; i < N; i++){
			lattice.geometry.faces[n].vertexColors[0] = colors[(N+1) * j + i]; 
			lattice.geometry.faces[n].vertexColors[1] = colors[(N+1) * j + i + 1]; 
			lattice.geometry.faces[n].vertexColors[2] = colors[(N+1) * (j + 1) + i + 1]; 

			lattice.geometry.faces[n+1].vertexColors[0] = colors[(N+1) * j + i]; 
			lattice.geometry.faces[n+1].vertexColors[1] = colors[(N+1) * (j + 1) + i + 1]; 
			lattice.geometry.faces[n+1].vertexColors[2] = colors[(N+1) * (j + 1) + i]; 
			n += 2;
		}
	}

	lattice.geometry.colorsNeedUpdate = true;


	//init clear color
	renderer.clear();

	//rendering
	renderer.render(scene, camera);

	//call loop function
	requestAnimationFrame(loop);
}
