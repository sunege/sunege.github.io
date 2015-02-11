////////////////////
//                //
// 1D H.O. System //
//                //
////////////////////

//System Parameter
var time = 0;		// time
var dt = 0.0001; // Delta t
var N = 50;	   // number of particle
var L = 20;	   // System length
var dl = L / (N-1); //discreat space
var step = 0; //step count
var skip = 500;

//oscillation
var freq =5.8201/(2*Math.PI);
var A = 0.2;


//Particle parameter
var MASS = 1;
var RADIUS = 0.45*dl;

//boundary condition
var boundary="d";

//Spring param
//natural length
var nl = 0.7;

var spring = { k: 1000, l: nl*dl };

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
		for(var i=0; i<p.length; i++){
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
		//p[0] = { vx: 0, vy: 0, vz: 0};
	},
	calculateKinetic: function(p){
		for(var i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	}
};

//particle object
var p = [];


//calculation object
var cal;

////////////////////////////////////////
// define physics system
////////////////////////////////////////
//class ball
var Ball = function(parameter){
	this.radius = parameter.radius;
	this.mass = parameter.mass;
	this.x = parameter.x;
	this.y = parameter.y;
	this.z = parameter.z;
	this.vx = parameter.vx;
	this.vy = parameter.vy;
	this.vz = parameter.vz;
	this.ax = parameter.ax;
	this.ay = parameter.ay;
	this.az = parameter.az;

	//init trajectory
	trajectory = [];

	//plot data
	data_x = []; // x position
	data_y = []; // y position
	data_z = []; // z position
	data_vx = []; // x velocity
	data_vy = []; // y velocity
	data_vz = []; // z velocity
	data_kinetic = []; // kinetic energy
	data_potential = []; // potential energy
	data_energy = []; // energy

	//init plot data
	data_x.push([0, this.x]);
	data_y.push([0, this.y]);
	data_z.push([0, this.z]);
	data_vx.push([0, this.vx]);
	data_vy.push([0, this.vy]);
	data_vz.push([0, this.vz]);
	var energy = this.calculateEnergy();
	data_kinetic.push([0, energy.kinetic]);
	data_potential.push([0, energy.potential]);
	data_energy.push([0, energy.kinetic + energy.potential]);
};
//add Method
Ball.prototype = {
	constructor: Ball,
	//Euler method
	timeEvolution: function(dt){
		//force
		f = this.calculateForce();

		//acceleration
		this.ax = f.x / this.mass;
		this.ay = f.y / this.mass;
		this.az = f.z / this.mass;

		//velocity
		this.vx += this.ax * dt;
		this.vy += this.ay * dt;
		this.vz += this.az * dt;

		//position
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.z += this.vz * dt;

		//border
		if(this.z < this.radius){
			this.z  = this.radius;
			this.vz = -this.vz;
		}
	},

	//calculateforce
	calculateForce: function(){
		var fx = 0;
		var fy = 0;
		var fz = -this.mass*g;
		return { x: fx, y: fy, z: fz };
	},

	//calculateEnergy
	calculateEnergy: function(){
		var v2 = this.vx*this.vx + this.vy*this.vy + this.vz*this.vz;
		var kinetic = 1/2 * this.mass * v2;
		var potential = this.mass*g*this.z;
		return { kinetic: kinetic, potential: potential };
	}
};

//plot data
var data_x = []; // x position
var data_y = []; // y position
var data_z = []; // z position
var data_vx = []; // x position
var data_vy = []; // y position
var data_vz = []; // z position
var data_kinetic = [];
var data_potential = [];
var data_energy = [];

/*------- create ball object ---------*/
// var g = 9.8;
// var mass = 5;
// var RADIUS = 10;
// var ball = new Ball({ radius: RADIUS,
// 		mass: mass,
// 		x: 0, y: 0, z: 100, // position vector
// 		vx: 0, vy:0, vz: 0, // velocity vector
// 		ax: 0, ay:0, az: g // acceleration vector
// });
var trajectory = []; // trajectory object

//plot setting
var skip_data = 10; // plot data skip
var plot2D_position; // position plot object
var plot2D_velocity; // velocity plot object
var plot2D_energy; // energy plot object

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
		plotStart();
		threeStart();
});

////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
function initEvent(){
	//tab interface
	$('#tabs').tabs({ heightStyle: 'content'});

	//click tab1
	document.getElementById("tabList").getElementsByTagName("a").item(0).addEventListener("click", function(){
			stopFlag = false;
	});
	//click tab2
	document.getElementById("tabList").getElementsByTagName("a").item(1).addEventListener("click", function(){
			plot2D_position.clearData();
			plot2D_position.pushData(data_x);
			plot2D_position.pushData(data_y);
			plot2D_position.pushData(data_z);
			plot2D_position.linerPlot();
			stopFlag = true;
	});
	//click tab3
	document.getElementById("tabList").getElementsByTagName("a").item(2).addEventListener("click", function(){
			plot2D_velocity.clearData();
			plot2D_velocity.pushData(data_vx);
			plot2D_velocity.pushData(data_vy);
			plot2D_velocity.pushData(data_vz);
			plot2D_velocity.linerPlot();
			stopFlag = true;
	});
	//click tab4
	document.getElementById("tabList").getElementsByTagName("a").item(3).addEventListener("click", function(){
			plot2D_energy.clearData();
			plot2D_energy.pushData(data_kinetic);
			plot2D_energy.pushData(data_potential);
			plot2D_energy.pushData(data_energy);
			plot2D_energy.linerPlot();
			stopFlag = true;
	});

	//slider interface
	$('#slider_skip').slider({
			min: 1,
			max: 1000,
			step: 1,
			value: skip,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_skip").value = value;
			}
	});
	$('#slider_mass').slider({
			min: 0.01,
			max: 10,
			step: 0.01,
			value: MASS,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_mass").value = value;
			}
	});
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
	$('#slider_freq').slider({
			min: 0,
			max: 2,
			step: 0.0001,
			value: freq,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_freq").value = value;
			}
	});
	$('#slider_A').slider({
			min: 0,
			max: 1,
			step: 0.1,
			value: A,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_A").value = value;
			}
	});
	$('#slider_k').slider({
			min: 0,
			max: 5000,
			step: 10,
			value: spring.k,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_k").value = value;
			}
	});
	$('#slider_nl').slider({
			min: 0.01,
			max: 1.1,
			step: 0.01,
			value: nl,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_nl").value = value;
			}
	});

	// 	$('#slider_g').slider({
	// 			min: 0,
	// 			max: 30,
	// 			step: 0.1,
	// 			value: g,
	// 			slide: function(event, ui){
	// 				var value = ui.value;
	// 				document.getElementById("input_g").value = value;
	// 			}
	// 	});
	// 	var strs = ['x', 'y', 'z', 'vx', 'vy', 'vz', 'mass'];
	// 	for(var i=0; i < strs.length; i++){
	// 		var param = strs[i];
	// 		var value = ball[param];
	// 		document.getElementById("input_" + param).value = value;
	// 		$('#slider_' + strs[i]).slider({
	// 				min: -100,
	// 				max: 100,
	// 				step: 1,
	// 				value: value,
	// 				slide: function(event, ui){
	// 					var value = ui.value;
	// 					var param = this.id.replace("slider_", "");
	// 					ball[param] = value;

	// 					var id = this.id.replace("slider_", "input_");
	// 					document.getElementById(id).value = value;
	// 				}
	// 		})

	// 		document.getElementById("input_" + param).addEventListener("change", function(){
	// 				var value = parseFloat(this.value) || 0;
	// 				var param = this.id.replace("input_", "");
	// 				ball[param] = value;

	// 				var id = this.id.replace("input_", "slider_");
	// 				$('#' + id).slider({ value: value });
	// 		});
	// }
	// 	$('#slider_z').slider({ min: 0, max: 500 });


	//input interface
	document.getElementById("input_skip").value = skip;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_mass").value = MASS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_freq").value = freq;
	document.getElementById("input_A").value = A;
	document.getElementById("input_k").value = spring.k;
	document.getElementById("input_nl").value = nl;

// 	document.getElementById("input_g").value = g;

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
	camera.position.set(24*1.1, L/2, 0);
	camera.up.set(0,0,1);
	camera.lookAt({x: 0, y:L/2, z: 0});

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
	trackball.target = new THREE.Vector3(0, L/2, 0);

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
var axis;
var sphere=[]; //sphere object

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
		var material = new THREE.MeshLambertMaterial({color: 0xFF0000, ambient: 0x880000 });
		//create object
		sphere[i] = new THREE.Mesh(geometry, material);
		//add object
		scene.add(sphere[i]);
		//position
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}
}

////////////////////////////////////////
// define plotStart()
////////////////////////////////////////
function plotStart(){
	//draw position graph
	plot2D_position = new Plot2D("canvas-frame_position");

	//set options
	plot2D_position.options.axesDefaults.tickOptions.formatString = '';
	plot2D_position.options.axes.xaxis.label = "time[s]";
	plot2D_position.options.axes.yaxis.label = "position[m]";
	plot2D_position.options.axes.yaxis.labelOptions = {angle: -90};
	plot2D_position.options.axes.xaxis.min = 0;
	plot2D_position.options.legend.show = true;
	plot2D_position.options.legend.location = 'ne';

	var series = [];
	series.push({
			showLine: true,
			label: "x position",
			markerOptions: {show: true}
	});
	series.push({
			showLine: false,
			label: "y position",
			markerOptions: {show: true}
	});
	series.push({
			showLine: true,
			label: "z position",
			markerOptions: {show: false}
	});
	plot2D_position.options.series = series;

	//draw velocity graph
	plot2D_velocity = new Plot2D("canvas-frame_velocity");

	//set options
	plot2D_velocity.options.axesDefaults.tickOptions.formatString = '';
	plot2D_velocity.options.axes.xaxis.label = "time[s]";
	plot2D_velocity.options.axes.yaxis.label = "velocity[m]";
	plot2D_velocity.options.axes.yaxis.labelOptions = {angle: -90};
	plot2D_velocity.options.axes.xaxis.min = 0;
	plot2D_velocity.options.legend.show = true;
	plot2D_velocity.options.legend.location = 'ne';

	var series = [];
	series.push({
			showLine: true,
			label: "x velocity",
			markerOptions: {show: true}
	});
	series.push({
			showLine: false,
			label: "y velocity",
			markerOptions: {show: true}
	});
	series.push({
			showLine: true,
			label: "z velocity",
			markerOptions: {show: false}
	});
	plot2D_velocity.options.series = series;

	//draw energy graph
	plot2D_energy = new Plot2D("canvas-frame_energy");

	//set options
	plot2D_energy.options.axesDefaults.tickOptions.formatString = '';
	plot2D_energy.options.axes.xaxis.label = "time[s]";
	plot2D_energy.options.axes.yaxis.label = "energy[J]";
	plot2D_energy.options.axes.yaxis.labelOptions = {angle: -90};
	plot2D_energy.options.axes.xaxis.min = 0;
	plot2D_energy.options.legend.show = true;
	plot2D_energy.options.legend.location = 'ne';

	var series = [];
	series.push({
			showLine: true,
			label: "kinetic energy",
			markerOptions: {show: true}
	});
	series.push({
			showLine: false,
			label: "potential energy",
			markerOptions: {show: true}
	});
	series.push({
			showLine: true,
			label: "total energy",
			markerOptions: {show: false}
	});
	plot2D_energy.options.series = series;
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
		skip = parseInt(document.getElementById("input_skip").value);
		dt = parseFloat(document.getElementById("input_dt").value);
		MASS = parseFloat(document.getElementById("input_mass").value);
		N = parseFloat(document.getElementById("input_N").value);
		freq = parseFloat(document.getElementById("input_freq").value);
		A = parseFloat(document.getElementById("input_A").value);
		spring.k = parseFloat(document.getElementById("input_k").value);
		nl = parseFloat(document.getElementById("input_nl").value);

		//update boundary condition
		var radioList = document.getElementsByName("boundary");
		for(var i=0; i<radioList.length; i++){
			if(radioList[i].checked){
				boundary = radioList[i].value;
			}
		}
		
		//update discreat space
		dl = L / (N-1);
		//update natural length
		spring.l = nl*dl;

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
		// 		for(var k=0; k<skip; k++){
		// 			step++;
		// 			time = step * dt;
		// 			ball.timeEvolution(dt);
		// 			if(step % (skip*skip_data) == 0){
		// 				data_x.push([time, ball.x]);
		// 				data_y.push([time, ball.y]);
		// 				data_z.push([time, ball.z]);
		// 				data_vx.push([time, ball.vx]);
		// 				data_vy.push([time, ball.vy]);
		// 			data_vz.push([time, ball.vz]);
		// 				var energy = ball.calculateEnergy();
		// 				data_kinetic.push([time, energy.kinetic]);
		// 				data_potential.push([time, energy.potential]);
		// 				data_energy.push([time, energy.kinetic + energy.potential]);
		// 			}
		// 		}
		for(var n=0; n<skip; n++){
			//increment of step
			step++;
			time = dt * step;

			cal.timeDevelopment(p);

			p[0].x = 0;
			p[0].y = 0;
			p[0].z = A * Math.sin(2*Math.PI*freq * time);
			p[0].vx = 0;
			p[0].vy = 0;
			p[0].vz = A * 2*Math.PI*freq*Math.cos(2*Math.PI*freq * time);

			if(boundary == "d"){
				p[N-1].x = 0;
				p[N-1].y = L;
				p[N-1].z = 0;
				p[N-1].vx = 0;
				p[N-1].vy = 0;
				p[N-1].vz = 0;
			}else if(boundary == "n"){
				p[N-1].x = 0;
				p[N-1].y = L;
				p[N-1].vx = 0;
				p[N-1].vy = 0;
			}

		}
	}
	//set draw object
	for(var i=0; i<N; i++){
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}

	document.getElementById("time").innerHTML = time.toFixed(2);

	//init clear color
	renderer.clear();

	//draw trajectory
	// 	trajectory.push(new THREE.Vector3(ball.x, ball.y, ball.z));
	// 	var trajectoryGeometry = new THREE.Geometry();
	// 	trajectoryGeometry.vertices = trajectory;
	// 	var material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
	// 	var line = new THREE.Line(trajectoryGeometry, material);
	// 	scene.add(line);

	//rendering
	renderer.render(scene, camera);

	//remove line
	// 	scene.remove(line);

	//call loop function
	requestAnimationFrame(loop);
}

