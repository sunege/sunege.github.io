////////////////////
//                //
// 1D H.O. System //
//                //
////////////////////

//System Parameter
var time = 0;		// time
var dt = 0.0001; // Delta t
var N = 8;	   // number of particle
var L = 20;	   // System length
var dl = L / (N-1);


var step = 0; //step count
var skip = 500;

//Particle parameter
var MASS = 1;
var RADIUS = 1*dl;

var spring = { k: 1000, l: 0.6*dl };

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
	//velocity vector
	this.vx = parameter.vx || 0;
	this.vy = parameter.vy || 0;
	this.vz = parameter.vz || 0;
	//force vector
	this.fx; 
	this.fy; 
	this.fz; 
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
		for(var i=0; i<p.length; i++){
			p[i].x = 0;
			p[i].y = i * dl;
			p[i].z = 0;
			this.calculateForce(p);
		}
		p[(N/4)].vz = 15;
		p[3*N/4].vz = -15;
	},
	//calculation Force
	calculateForce: function(p){
		var force01,force10;
		var d_r;
		force01={ x: 0, y: 0, z: 0 };
		force10={ x: 0, y: 0, z: 0 };
		d_r={ x: 0, y: 0, z: 0, norm: 0 };
		for(var i=0; i<N; i++){
			if(i != 0){
				force10.x = -force01.x;
				force10.y = -force01.y;
				force10.z = -force01.z;
			}
			if(i != N-1){
				d_r.x = p[i+1].x - p[i].x;
				d_r.y = p[i+1].y - p[i].y;
				d_r.z = p[i+1].z - p[i].z;
				d_r.norm = Math.sqrt(d_r.x*d_r.x + d_r.y*d_r.y + d_r.z*d_r.z);
				force01.x = -spring.k*(spring.l-d_r.norm)*d_r.x/d_r.norm;
				force01.y = -spring.k*(spring.l-d_r.norm)*d_r.y/d_r.norm;
				force01.z = -spring.k*(spring.l-d_r.norm)*d_r.z/d_r.norm;
		}
			if( i == 0 ){
				p[i].fx = force01.x;
				p[i].fy = force01.y;
				p[i].fz = force01.z;
			}
			else if( i == N-1 ){
				p[i].fx = force10.x;
				p[i].fy = force10.y;
				p[i].fz = force10.z;
			}
			else{
				p[i].fx = force01.x+force10.x;
				p[i].fy = force01.y+force10.y;
				p[i].fz = force01.z+force10.z;
			}
		}
	},
	//Velocity Verlet method
	timeDevelopment: function(p){
		// conserve f(t)
		var old_fx = [];
		var old_fy = [];
		var old_fz = [];

		for(var i=0; i<p.length; i++){
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
		for(var i=0; i<p.length; i++){
			p[i].vx = p[i].vx + ( old_fx[i] + p[i].fx )*dt/(2*p[i].mass); 
			p[i].vy = p[i].vy + ( old_fy[i] + p[i].fy )*dt/(2*p[i].mass); 
			p[i].vz = p[i].vz + ( old_fz[i] + p[i].fz )*dt/(2*p[i].mass); 
		}
		p[0].x = 0;
		p[0].y = 0;
		p[0].z = 0;
		p[0].vx = 0;
		p[0].vy = 0;
		p[0].vz = 0;
		
		p[N-1].x = 0;
		p[N-1].y = L;
		p[N-1].z = 0;
		p[N-1].vx = 0;
		p[N-1].vy = 0;
		p[N-1].vz = 0;
		//p[0] = { vx: 0, vy: 0, vz: 0};
	}
};

//particle object
var p = [];


//calculation object
var cal;


//////////////////////////////
// Window event
//////////////////////////////

window.addEventListener("load", function (){
		for(var i=0; i<N; i++)
			p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
		cal = new Calculation(p);
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
	renderer.setClearColor(0xE1FCEF, 1.0);
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
	camera.position.set(24*1.1, L/2, 0);
	//camera up vector
	camera.up.set(0, 0, 1);
	//camera center vector
	camera.lookAt({x: 0, y: L/2, z: 0});
}

//////////////////////////////
// def initObject()
//////////////////////////////
// global var
var axis; //axis object
var sphere = []; //primitive object

function initObject(){
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
	axis.position.set(0, 0, 0);


	for(var i=0; i<N; i++){
		//create geometry
		var geometry = new THREE.SphereGeometry(p[i].radius, 20, 20);
		//create material
		var material = new THREE.MeshLambertMaterial({color: 0xFF0000 });
		//create object
		sphere[i] = new THREE.Mesh(geometry, material);
		//add object
		scene.add(sphere[i]);
		//position
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}
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
	directionalLight1.position.set(50, 50, 50);
	//add light
	scene.add(directionalLight1);
}

//////////////////////////////
// def loop()
//////////////////////////////

function loop(){

	for(var n=0; n<skip; n++){
		//increment of step
		step++;
		cal.timeDevelopment(p);
	}
	time = step * dt;

	//set draw object
	for(var i=0; i<N; i++){
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}

	//init clear color
	renderer.clear();
	//rendering
	renderer.render(scene, camera);
	//loop
	requestAnimationFrame(loop);
}
