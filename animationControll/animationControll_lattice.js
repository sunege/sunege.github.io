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
	document.getElementById("startButton").addEventListener("click", function(){
			if(stopFlag){
				stopFlag = false;
// 				for(var i=0; i < Step; i++){
// 					divs[i].style.display = "none";
// 					imgs[i].style.display = "none";
				}
			}
			else{
				stopFlag = true;
			}
	})

	document.getElementById("png").addEventListener("click", function(){
// 			var n = step % Step;
// 			document.getElementById("png").href = imgs[n].src;
// 			document.getElementById("png").download = "png_" + n + ".png";
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
	camera.position.set(40, 40, 120);
	camera.up.set(0,0,1);
	camera.lookAt({x: 0, y:0, z: 0});

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
var axis; //axis object
var lattice = []; //lattice object
//number of object
var N = 50;
//edge length
var l = 1;
var Step = 100;

function initObject(){
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
	axis.position.set(0, 0, 0);

	//create geometry
	var R = 10;
	var omega = 2 * Math.PI / Step;

	for(var n=0; n < Step; n++){
		var geometry = new THREE.Geometry();
		//gaussian
		var x_ = R * Math.cos(omega * n); //x
		var y_ = R * Math.sin(omega * n); //y
		var sigma2 = 10; //sigma
		var z0 = 50; //peak

		for(var j=0; j <= N; j++){
			for(var i=0; i <= N; i++){
				//calculate vartex
				var x = (-N/2 + i) * l;
				var y = (-N/2 + j) * l;
				var z = z0 * Math.exp(-((x - x_) * (x -x_) + (y - y_) * (y -y_)) / (2 * sigma2)); 
				var vertex = new THREE.Vector3(x, y, z);
				//add vertex
				geometry.vertices.push(vertex);
			}
		}
		for(var j=0; j < N; j++){
			for(var i=0; i < N; i++){
				var face = new THREE.Face3( (N+1)*j+i, (N+1)*j+i+1,  (N+1)*(j+1)+i+1 );
				geometry.faces.push(face);
				face = new THREE.Face3( (N+1)*j+i, (N+1)*(j+1)+i+1, (N+1)*(j+1)+i );
				geometry.faces.push(face);
			}
		}
		//calculate surface normal
		geometry.computeFaceNormals();
		//calculate vertex normal vector
		geometry.computeVertexNormals();

		//create material
		var material = new THREE.MeshPhongMaterial({ color: 0xFF0000, ambient: 0xFF0000,
				side: THREE.DoubleSide, specular: 0xFFFFFF, shininess: 250 });

		//create sphere object
		lattice[n] = new THREE.Mesh(geometry, material);
		//create shadow
		lattice[n].castShadow = true;
	}


}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
var step = 0;
function loop(){
	step++;
	//update trackball object
	trackball.update();

	var n = step%Step;
	scene.add(lattice[n]);

	//init clear color
	renderer.clear();

	//rendering
	renderer.render(scene, camera);
	scene.remove(lattice[n]);
	step++;

	//call loop function
	requestAnimationFrame(loop);
}

