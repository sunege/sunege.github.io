//////////////////////////
//                      //
// horizontal injection //
//                      //
//////////////////////////

//System Parameter
var time = 0;		// time
var dt = 0.0001; // Delta t
var N = 4;	   // number of particle
// var L = 20;	   // System length
// var dl = L / (N-1); //discreat space
var step = 0; //step count
var skip = 5;
var _skip = 0.1;

//oscillation
// var A = 0;

//Field parameter
// var T = 300; // temp
// var k_B = 1.38e-23;
var gamma = 0.0; // air resistance param
var gravity = 9.8; // gravitational accelaration


//Particle parameter
var MASS = 10; //kg
var RADIUS = 0.3;


//particle class
var Particle = function(parameter){
	//index
	this.index = parameter.index;
	//radius
	this.radius = parameter.radius;
	//mass
	this.mass = parameter.mass;
	//position vector
	this.x = parameter.x || 0;
	this.y = parameter.y || 0;
	this.z = parameter.z || 0;
	//temp position vector
	this.tempx = parameter.x || 0;
	this.tempy = parameter.y || 0;
	this.tempz = parameter.z || 0;
	//velocity vector
	this.vx = parameter.vx || 0;
	this.vy = parameter.vy || 0;
	this.vz = parameter.vz || 0;
	this.v = 0;
	//force vector
	this.fx; 
	this.fy; 
	this.fz; 
	//kinetic energy
	this.kinetic = 0;
};

Particle.prototype = {
	constructor: Particle
};

//calculation class
var Calculation = function(p){
	this.initParticle(p);
};

Calculation.prototype = {
	constructor: Calculation,
	//init Particles
	initParticle: function(p){
		for(var i=0; i<N; i++){
			var vx = i*15/N;
			var vy = 0.0;
			var vz = 0.0;
			p[i].mass = MASS;
			p[i].x = 0;
			p[i].y = 0;
			p[i].z = 0;
			p[i].fx = 0;
			p[i].fy = 0;
			p[i].fz = 0;
			p[i].vx = vx;
			p[i].vy = vy;
			p[i].vz = vz;
			p[i].v = Math.sqrt(vx*vx+vy*vy+vz*vz);
			this.calculateForce(p);
		}
	},

	//calculation Force
	calculateForce: function(p){
		for(var i=0; i<N; i++){
			p[i].fx = -gamma*p[i].vx;
			p[i].fy = -gravity*p[i].mass-gamma*p[i].vy;
			p[i].fz = -gamma*p[i].vz;
		}
	},

	//Velocity Verlet method
	timeDevelopment: function(p){
		// conserve f(t)
		var old_fx = [];
		var old_fy = [];
		var old_fz = [];

		for(var i=0; i<N; i++){
			//x(t+dt) = x(t) + v(t)*dt + f(t)*dt*dt/2m
			p[i].x = p[i].x + p[i].vx*dt + p[i].fx*dt*dt/(2*p[i].mass);
			p[i].y = p[i].y + p[i].vy*dt + p[i].fy*dt*dt/(2*p[i].mass);
			p[i].z = p[i].z + p[i].vz*dt + p[i].fz*dt*dt/(2*p[i].mass);

			old_fx[i] = p[i].fx;
			old_fy[i] = p[i].fy;
			old_fz[i] = p[i].fz;
		}

		// f(t+dt)
		//this.calculateForce(p);

		//v(t+dt) = v(t) + (f(t) + f(t+dt))*dt/2m
		for(var i=0; i<N; i++){
			p[i].vx = p[i].vx + ( old_fx[i] + p[i].fx )*dt/(2*p[i].mass); 
			p[i].vy = p[i].vy + ( old_fy[i] + p[i].fy )*dt/(2*p[i].mass); 
			p[i].vz = p[i].vz + ( old_fz[i] + p[i].fz )*dt/(2*p[i].mass); 
		}
		//p[0] = { vx: 0, vy: 0, vz: 0};
	},
	calculateKinetic: function(p){
		for(var i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	},
};

//particle object
var p = [];

//calculation object
var cal;

//stop flag
var restartFlag = false; // restert flag
var stopFlag = false; // stop flag


////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
		for(var i=0; i<N; i++)
			p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
		cal = new Calculation(p);
		initEvent();
		threeStart();
});

////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
function initEvent(){

	//slider interface
	$('#slider_skip').slider({
			min: 0.01,
			max: 1.01,
			step: 0.01,
			value: _skip,
			slide: function(event, ui){
				var value = ui.value;
				_skip = value;
				skip = 1/(60*dt)*_skip;
				document.getElementById("input_skip").value = value;
			}
	});

	$('#slider_radius').slider({
			min: 0.01,
			max: 5,
			step: 0.01,
			value: RADIUS,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_radius").value = value;
			}
	});
	// 	$('#slider_mass').slider({
	// 		min: 0.01,
	// 		max: 10,
	// 		step: 0.01,
	// 		value: MASS,
	// 		slide: function(event, ui){
	// 			var value = ui.value;
	// 			document.getElementById("input_mass").value = value;
	// 		}
	// 	});
	$('#slider_N').slider({
			min: 3,
			max: 200,
			step: 1,
			value: N,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_N").value = value;
			}
	});
	$('#slider_gamma').slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: gamma,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_gamma").value = value;
			}
	});
	//input interface
	document.getElementById("input_skip").value = _skip;
	document.getElementById("input_radius").value = RADIUS;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_mass").value = MASS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_gamma").value = gamma;


	//button interface
	//start button
	document.getElementById("startButton").addEventListener("click", function(){
			restartFlag = true;
	});

	//stop button
	document.getElementById("stopButton").addEventListener("click", function(){
			if(stopFlag){
				stopFlag = false;
			}else{
				stopFlag = true;
			}
	});

}

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
	camera.position.set(5.0,-3.0,10.0);
	camera.up.set(0,1,0);
	camera.lookAt({x: 0.0, y: 0.0, z: 0.0});

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
	trackball.target = new THREE.Vector3(5.0, -3.0, 0.0);

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
	directionalLight.position.set(40, 80, 100);

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
var axis;
var sphere=[]; //sphere object
var wall1;

function initObject(){
	//create geometry
	// 	var geometry = new THREE.SphereGeometry( ball.radius, 20, 20 );
	//create material
	// 	var material = new THREE.MeshLambertMaterial({ color: 0xFF0000, ambient: 0x880000 });

	//create sphere object
	// 	sphere = new THREE.Mesh(geometry, material);

	//add scene
	// 	scene.add(sphere);

	//create shadow
	// 	sphere.castShadow = true;

	/*  floar drow  */
	// 	var yuka_n = 20,
	// 		 yuka_w = 100;
	// 	for(var i=-yuka_n/2; i<=yuka_n/2; i++){
	// 		for(var j=-yuka_n/2; j<=yuka_n/2; j++){
	// 			position
	// 			var x = j*yuka_w;
	// 			var y = i*yuka_w;
	// 			geometry = new THREE.PlaneGeometry(yuka_w, yuka_w);
	// 			if(Math.abs(i+j) % 2 == 0){
	// 				material = new THREE.MeshLambertMaterial({ color: 0x999999, ambient: 0x050505});
	// 			}else{
	// 				material = new THREE.MeshLambertMaterial({ color: 0x4d4d4d, ambient: 0x050505});
	// 			}
	// 			var plane = new THREE.Mesh(geometry, material);
	// 			plane.position.set(x, y, 0);
	// 			plane.receiveShadow = true;
	// 			scene.add(plane);
	// 		}
	// 	}
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
	axis.position.set(0, 0, 0);

	sphere = [];
	for(var i=0; i<N; i++){
		//create geometry
		var geometry = new THREE.SphereGeometry(p[i].radius, 20, 20);
		//create material
		//
		/*	
		 var velocity = Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		 var v_center = 400;
		 var v_ratio = parseFloat(velocity / v_center, 10);
		 if(v_ratio > 1){
			 v_ratio = 1;
		 }
		 var shine = parseInt(255*v_ratio, 10);

		 var red = parseInt(255 * v_ratio, 10);
		 var red_hex = red.toString(16);

		 var green_hex = "88";

		 var blue = parseInt(255 * (1-v_ratio), 10);
		 var blue_hex = blue.toString(16);

		 var color_code = red_hex + green_hex + blue_hex;
		 var material = new THREE.MeshPhongMaterial({ color: color_code, ambient: color_code, side: THREE.DoubleSide, specular: 0xFFFFFF, shininess: shine});

		 */
		//速度によって色変化

		var velocity = Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		var v_center = 8;
		var v_ratio = parseFloat(velocity / v_center, 10);
		if(v_ratio > 1){
			var red_hex = "ff";
			var blue_hex = "00";

			if(v_ratio > 2){
				green_hex = "00";
			}
			else{
				var green = parseInt(254 - 254*(v_ratio - 1), 10);
				if(green < 16){
					var green_hex = "0" + green.toString(16);
				}
				else{
					var green_hex = green.toString(16);
				}
			}
		}
		else{
			var red = parseInt(254 * v_ratio, 10);
			if(red < 16){
				var red_hex = "0" + red.toString(16);
			}
			else{
				var red_hex = red.toString(16);
			}

			var green_hex = "ff";

			var blue = parseInt(254 * (1-v_ratio), 10);
			if(blue < 16){
				var blue_hex = "0" + blue.toString(16);
			}
			else{
				var blue_hex = blue.toString(16);
			}
		}

		var color_code = red_hex + green_hex + blue_hex;
		var material = new THREE.MeshLambertMaterial({color: parseInt(color_code, 16), ambient: parseInt(color_code, 16) });



		//create object
		sphere[i] = new THREE.Mesh(geometry, material);
		//add object
		scene.add(sphere[i]);
		//position
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		sphere[i].castShadow = true;
	}

}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
function loop(){
	//update trackball object
	trackball.update();

	//set sphere position
	// 	sphere.position.set(ball.x, ball.y, ball.z);


	if(restartFlag == true){
		//remove sphere
		for(var i=0; i<N; i++)
			scene.remove(sphere[i]);

		//init time param
		step = 0;
		_skip = parseInt(document.getElementById("input_skip").value);
		RADIUS = parseFloat(document.getElementById("input_radius").value);
		dt = parseFloat(document.getElementById("input_dt").value);
		MASS = parseFloat(document.getElementById("input_mass").value);
		N = parseFloat(document.getElementById("input_N").value);
		gamma = parseFloat(document.getElementById("input_gamma").value);

		//init particle and calculation class
		for(var i=0; i<N; i++){
			p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
		}
		cal = new Calculation(p);
		initObject();
		restartFlag = false;
		stopFlag = false;

		document.getElementById("startButton").value = "Restart";
	}

	if(stopFlag){
		document.getElementById("stopButton").value = "start";
	}else{
		document.getElementById("stopButton").value = "stop";
	}

	//time development
	// 	var time = step * dt;
	if(stopFlag == false){
		for(var n=0; n<skip; n++){
			//increment of step
			step++;
			time = dt * step;

			cal.timeDevelopment(p);
		}
		//set draw object
		for(var i=0; i<N; i++){
			sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		}
	}

	document.getElementById("time").innerHTML = time.toFixed(2);

	//init clear color
	renderer.clear();


	//rendering
	renderer.render(scene, camera);

	//remove line
	// 	scene.remove(line);

	//call loop function
	requestAnimationFrame(loop);
}

