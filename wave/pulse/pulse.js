////////////////////
//                //
// 1D H.O. System //
//                //
////////////////////

'use strict';

//System Parameter
let time = 0;		// time
let dt = 0.0001; // Delta t
let N = 150;	   // number of particle
const L = 100;	   // System length
let dl = L / (N-1); //discreat space
let step = 0; //step count
let skip = 100;

//oscillation
let A = 6;

//Field parameter
let gamma = 0.0; // air resistance param
let gravity = 0; // gravitational accelaration


//Particle parameter
let MASS = 0.5;
const RADIUS = 0.45*dl;

//boundary condition
let boundary = "d";

//Spring param
//natural length
let nl = 0.01;

const spring = { k: 1500, l: nl*dl };

let freq = 1;
let phi = 0;

//particle class
class Particle {
	constructor(parameter){
		//index
		this.index = parameter.index;
		//radius
		this.radius = parameter.radius;
		//mass
		this.mass = parameter.mass;
		//position vector
		this.x = parameter.x ?? 0;
		this.y = parameter.y ?? 0;
		this.z = parameter.z ?? 0;
		//velocity vector
		this.vx = parameter.vx ?? 0;
		this.vy = parameter.vy ?? 0;
		this.vz = parameter.vz ?? 0;
		//force vector
		this.fx = 0;
		this.fy = 0;
		this.fz = 0;
		//kinetic energy
		this.kinetic = 0;
	}
}

//calculation class
class Calculation {
	constructor(p){
		this.initParticle(p);
	}

	//init Particles
	initParticle(p){
		for(let i=0; i<p.length; i++){
			p[i].mass = MASS;
			p[i].x = 0;
			p[i].y = i * dl;
			p[i].z = 0;
			p[i].vx = 0;
			p[i].vy = 0;
			p[i].vz = 0;
			p[i].fx = 0;
			p[i].fy = 0;
			p[i].fz = 0;
			this.calculateForce(p);
		}
	}

	//calculation Force
	calculateForce(p){
		const force01 = { x: 0, y: 0, z: 0 };
		const force10 = { x: 0, y: 0, z: 0 };
		const d_r = { x: 0, y: 0, z: 0, norm: 0 };
		for(let i=0; i<N; i++){
			if(i !== 0){
				force10.x = -force01.x;
				force10.y = -force01.y;
				force10.z = -force01.z;
			}
			if(i !== N-1){
				d_r.x = p[i+1].x - p[i].x;
				d_r.y = p[i+1].y - p[i].y;
				d_r.z = p[i+1].z - p[i].z;
				d_r.norm = Math.sqrt(d_r.x*d_r.x + d_r.y*d_r.y + d_r.z*d_r.z);
				force01.x = -spring.k*(spring.l-d_r.norm)*d_r.x/d_r.norm;
				force01.y = -spring.k*(spring.l-d_r.norm)*d_r.y/d_r.norm;
				force01.z = -spring.k*(spring.l-d_r.norm)*d_r.z/d_r.norm;
			}
			//gravity and resistance
			if( i === 0 ){
				p[i].fx = force01.x-gamma*p[i].vx;
				p[i].fy = force01.y-gamma*p[i].vy;
				p[i].fz = force01.z-gravity*p[i].mass-gamma*p[i].vz;
			}
			else if( i === N-1 ){
				p[i].fx = force10.x-gamma*p[i].vx;
				p[i].fy = force10.y-gamma*p[i].vy;
				p[i].fz = force10.z-gravity*p[i].mass-gamma*p[i].vz;
			}
			else{
				p[i].fx = force01.x+force10.x-gamma*p[i].vx;
				p[i].fy = force01.y+force10.y-gamma*p[i].vy;
				p[i].fz = force01.z+force10.z-gravity*p[i].mass-gamma*p[i].vz;
			}
		}
	}

	//Velocity Verlet method
	timeDevelopment(p){
		// conserve f(t)
		const old_fx = [];
		const old_fy = [];
		const old_fz = [];

		for(let i=0; i<p.length; i++){
			//x(t+dt) = x(t) + v(t)*dt + f(t)*dt*dt/2m
			p[i].x = p[i].x + p[i].vx*dt + p[i].fx*dt*dt/(2*p[i].mass);
			p[i].y = p[i].y + p[i].vy*dt + p[i].fy*dt*dt/(2*p[i].mass);
			p[i].z = p[i].z + p[i].vz*dt + p[i].fz*dt*dt/(2*p[i].mass);

			old_fx[i] = p[i].fx;
			old_fy[i] = p[i].fy;
			old_fz[i] = p[i].fz;
		}

		// f(t+dt)
		this.calculateForce(p);

		//v(t+dt) = v(t) + (f(t) + f(t+dt))*dt/2m
		for(let i=0; i<p.length; i++){
			p[i].vx = p[i].vx + ( old_fx[i] + p[i].fx )*dt/(2*p[i].mass);
			p[i].vy = p[i].vy + ( old_fy[i] + p[i].fy )*dt/(2*p[i].mass);
			p[i].vz = p[i].vz + ( old_fz[i] + p[i].fz )*dt/(2*p[i].mass);
		}
	}

	calculateKinetic(p){
		for(let i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	}
}

//particle object
const p = [];


//calculation object
let cal;

//stop flag
let restartFlag = true; // restert flag
let stopFlag = false; // stop flag
let pulseFlag = false;


////////////////////////////////////////
// define window event
////////////////////////////////////////
window.addEventListener("load", () => {
	for(let i=0; i<N; i++)
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
			min: 1,
			max: 1000,
			step: 1,
			value: skip,
			slide: (event, ui) => {
				skip = ui.value;
				document.getElementById("input_skip").value = ui.value;
			}
	});
	$('#slider_mass').slider({
			min: 0.01,
			max: 10,
			step: 0.01,
			value: MASS,
			slide: (event, ui) => {
				document.getElementById("input_mass").value = ui.value;
			}
	});
	$('#slider_N').slider({
			min: 3,
			max: 200,
			step: 1,
			value: N,
			slide: (event, ui) => {
				document.getElementById("input_N").value = ui.value;
			}
	});
	$('#slider_freq').slider({
			min: 0,
			max: 10,
			step: 0.0001,
			value: freq,
			slide: (event, ui) => {
				phi = 2*Math.PI*time*(freq - ui.value) + phi;
				freq = ui.value;
				document.getElementById("input_freq").value = ui.value;
			}
	});
	$('#slider_A').slider({
			min: 0,
			max: 15,
			step: 0.1,
			value: A,
			slide: (event, ui) => {
				A = ui.value;
				document.getElementById("input_A").value = ui.value;
			}
	});
	$('#slider_k').slider({
			min: 0,
			max: 5000,
			step: 10,
			value: spring.k,
			slide: (event, ui) => {
				document.getElementById("input_k").value = ui.value;
			}
	});
	$('#slider_nl').slider({
			min: 0.01,
			max: 1.1,
			step: 0.01,
			value: nl,
			slide: (event, ui) => {
				document.getElementById("input_nl").value = ui.value;
			}
	});
	$('#slider_gamma').slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: gamma,
			slide: (event, ui) => {
				gamma = ui.value;
				document.getElementById("input_gamma").value = ui.value;
			}
	});

	//checkbox
	$('#checkbox_gravity').click(function(){
			gravity = $(this).prop('checked') ? 9.8 : 0;
	});


	//input interface
	document.getElementById("input_skip").value = skip;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_mass").value = MASS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_freq").value = freq;
	document.getElementById("input_A").value = A;
	document.getElementById("input_k").value = spring.k;
	document.getElementById("input_nl").value = nl;
	document.getElementById("input_gamma").value = gamma;


	//button interface
	//start button
	document.getElementById("startButton").addEventListener("click", () => {
			restartFlag = true;
	});

	//stop button
	document.getElementById("stopButton").addEventListener("click", () => {
			stopFlag = !stopFlag;
	});

	document.getElementById("l").innerHTML = L.toFixed(0);
	document.getElementById("dl").innerHTML = dl.toFixed(3);
	document.getElementById("nl").innerHTML = spring.l.toFixed(3);
}

function mouseEvent(){
	canvasFrame.addEventListener('mousedown', () => {
		// p[parseInt(N/2)].vz = 40;
		pulseFlag = true;
	}, false );
}

////////////////////////////////////////
// define threeStart()
////////////////////////////////////////
function threeStart(){
	initThree();
	mouseEvent();
	initCamera();
	initLight();
	initObject();
	loop();
}

/*  init Three functions  */

//global variables
let renderer, // renderer object
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
let camera, // camera object
	 trackball; // trackball object

function initCamera(){
	//create camera object
	const fov = 45,
		aspect = canvasFrame.clientWidth/canvasFrame.clientHeight,
		near = 1,
		far = 10000;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	//set camera options
	camera.position.set(70, L/2, 0);
	camera.up.set(0,0,1);
	camera.lookAt(new THREE.Vector3(0, L/2, 0));

	//create trackball object
	trackball = new THREE.TrackballControls(camera, canvasFrame);

	//set trackball options
	trackball.screen.width = canvasFrame.clientWidth;
	trackball.screen.height = canvasFrame.clientHeight;
	trackball.screen.offsetLeft = canvasFrame.getBoundingClientRect().left;
	trackball.screen.offsetTop = canvasFrame.getBoundingClientRect().top;

	trackball.noRotate = true;//false;
	trackball.rotateSpeed = 2.0;

	trackball.noZoom = false;
	trackball.zoomSpeed = 0.5;

	trackball.noPan = false;
	trackball.panSpeed = 0.6;
	trackball.target = new THREE.Vector3(0, L/2, 0);

	trackball.staticMoving = true;

	trackball.dynamicDampingFactor = 0.3;
}

////////////////////////////////////////
// define initLight()
////////////////////////////////////////
function initLight(){
	//create directionalLight object
	const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);

	//set directionalLight options
	directionalLight.position.set(100, 100, 100);

	directionalLight.castShadow = true;

	//add scene
	scene.add(directionalLight);

	//create ambientLight object
	const ambientLight = new THREE.AmbientLight(0x777777);

	//add scene
	scene.add(ambientLight);
}

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
let sphere = []; //sphere object

function initObject(){
	//create axis object
	const axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
	axis.position.set(0, 0, 0);

	sphere = [];
	for(let i=0; i<N; i++){
		//create geometry
		const geometry = new THREE.SphereGeometry(p[i].radius, 20, 20);
		//create material
		const material = new THREE.MeshLambertMaterial({color: 0x88eeFF, ambient: 0x88FFFF });
		//create object
		sphere[i] = new THREE.Mesh(geometry, material);
		//add object
		scene.add(sphere[i]);
		//position
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}
}


let pulseTime = 0;
////////////////////////////////////////
// define loop()
////////////////////////////////////////
function loop(){
	//update trackball object
	trackball.update();


	if(restartFlag){
		//remove sphere
		for(let i=0; i<N; i++)
			scene.remove(sphere[i]);

		//init time param
		step = 0;
		skip = parseInt(document.getElementById("input_skip").value, 10);
		dt = parseFloat(document.getElementById("input_dt").value);
		MASS = parseFloat(document.getElementById("input_mass").value);
		N = parseFloat(document.getElementById("input_N").value);
		freq = parseFloat(document.getElementById("input_freq").value);
		phi = 0;
		A = parseFloat(document.getElementById("input_A").value);
		spring.k = parseFloat(document.getElementById("input_k").value);
		nl = parseFloat(document.getElementById("input_nl").value);
		gamma = parseFloat(document.getElementById("input_gamma").value);

		//update boundary condition
		const radioList = document.getElementsByName("boundary");
		for(let i=0; i<radioList.length; i++){
			if(radioList[i].checked){
				boundary = radioList[i].value;
			}
		}

		//update discreat space
		dl = L / (N-1);
		//update natural length
		spring.l = nl*dl;

		//init particle and calculation class
		for(let i=0; i<N; i++){
			p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
		}
		cal = new Calculation(p);
		initObject();
		restartFlag = false;
		stopFlag = false;

		document.getElementById("l").innerHTML = L.toFixed(0);
		document.getElementById("dl").innerHTML = dl.toFixed(3);
		document.getElementById("nl").innerHTML = spring.l.toFixed(3);

		document.getElementById("startButton").value = "Restart";
	}

	document.getElementById("stopButton").value = stopFlag ? "start" : "stop";

	//time development
	// 	var time = step * dt;
	if(!stopFlag){
		for(let n=0; n<skip; n++){
			//increment of step
			step++;
			time = dt * step;

			cal.timeDevelopment(p);

			//p[0].x = A * Math.cos(2*Math.PI*freq * time);
			p[0].x = 0;
			p[0].y = 0;
			p[0].z = 0;
// 			p[0].z = A * Math.sin(2*Math.PI*freq * time + phi);
			//p[0].vx = -A * 2*Math.PI*freq*Math.sin(2*Math.PI*freq * time);
			p[0].vx = 0;
			p[0].vy = 0;
// 			p[0].vz = A * 2*Math.PI*freq*Math.cos(2*Math.PI*freq * time);

			if(pulseFlag){
				pulseTime += dt;
				p[0].z = A * Math.sin(2*Math.PI*freq * pulseTime);
				if(p[0].z <= 0){
					pulseTime = 0;
					pulseFlag = false;
				}
			}
			if(boundary === "d"){
				p[N-1].x = 0;
				p[N-1].y = L;
				p[N-1].z = 0;
				p[N-1].vx = 0;
				p[N-1].vy = 0;
				p[N-1].vz = 0;
			}else if(boundary === "n"){
				p[N-1].x = 0;
				p[N-1].y = L;
				p[N-1].vx = 0;
				p[N-1].vy = 0;
			}

		}
	}
	//set draw object
	for(let i=0; i<N; i++){
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}

	document.getElementById("time").innerHTML = time.toFixed(2);

	//init clear color
	renderer.clear();


	//rendering
	renderer.render(scene, camera);


	//call loop function
	requestAnimationFrame(loop);
}
