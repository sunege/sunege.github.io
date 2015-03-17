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

	//x_{n-1}
	this.x_1;
	this.y_1;
	this.z_1;
	//v_{n-1}
	this.vx_1;
	this.vy_1;
	this.vz_1;
	this.calculateInitialCondition(dt);
};
//add Method
Ball.prototype = {
	constructor: Ball,
	//Verlet method
	timeEvolution: function(dt){
		//force
		f = this.calculateForce();

		//acceleration
		this.ax = f.x / this.mass;
		this.ay = f.y / this.mass;
		this.az = f.z / this.mass;

		//current position
		var x_ = this.x;
		var y_ = this.y;
		var z_ = this.z;

		//next position
		this.x = 2 * this.x - this.x_1 + this.ax * dt * dt;
		this.y = 2 * this.y - this.y_1 + this.ay * dt * dt;
		this.z = 2 * this.z - this.z_1 + this.az * dt * dt;
		
		//previous position
		this.x_1 = x_;
		this.y_1 = y_;
		this.z_1 = z_;

		//current velocity
		var vx_ = this.vx;
		var vy_ = this.vy;
		var vz_ = this.vz;

		//next velocity
		this.vx = this.vx_1 + 2*this.ax * dt;
		this.vy = this.vy_1 + 2*this.ay * dt;
		this.vz = this.vz_1 + 2*this.az * dt;

		//previous velocity 
		this.vx_1 = vx_;
		this.vy_1 = vy_;
		this.vz_1 = vz_;

		//border
		if(this.z < this.radius){
			var tmp_z = this.z_1;
			this.z_1  = this.z;
			this.z = tmp_z;
			this.vz_1 = -(this.vz_1 + 2*this.az * dt);
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

	//calculateinitialcondition
	calculateInitialCondition: function(dt){
		f = this.calculateForce();
		//a_{0}
		this.ax = f.x / this.mass;
		this.ay = f.y / this.mass;
		this.az = f.z / this.mass;

		//x_{-1}
		this.x_1 = this.x - this.vx * dt + 1/2 * this.ax * dt * dt;
		this.y_1 = this.y - this.vy * dt + 1/2 * this.ay * dt * dt;
		this.z_1 = this.z - this.vz * dt + 1/2 * this.az * dt * dt;

		//v_{-1}
		this.vx_1 = this.vx - this.ax * dt;
		this.vy_1 = this.vy - this.ay * dt;
		this.vz_1 = this.vz - this.az * dt;
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
var g = 9.8;
var mass = 5;
var RADIUS = 10;
var ball = new Ball({ radius: RADIUS,
		mass: mass,
		x: 0, y: 0, z: 100, // position vector
		vx: 0, vy:0, vz: 0, // velocity vector
		ax: 0, ay:0, az: g // acceleration vector
});
var trajectory = []; // trajectory object

//time setting
var dt = 1/600;
var step = 0; // count step
var skip = 10;

//plot setting
var skip_data = 10; // plot data skip
var plot2D_position; // position plot object
var plot2D_velocity; // velocity plot object
var plot2D_energy; // energy plot object

//stop flag
var restartFlag = false; // restert flag
var stopFlag = true; // stop flag


////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
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
	$('#slider_g').slider({
			min: 0,
			max: 30,
			step: 0.1,
			value: g,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_g").value = value;
			}
	});
	var strs = ['x', 'y', 'z', 'vx', 'vy', 'vz', 'mass'];
	for(var i=0; i < strs.length; i++){
		var param = strs[i];
		var value = ball[param];
		document.getElementById("input_" + param).value = value;
		$('#slider_' + strs[i]).slider({
				min: -100,
				max: 100,
				step: 1,
				value: value,
				slide: function(event, ui){
					var value = ui.value;
					var param = this.id.replace("slider_", "");
					ball[param] = value;

					var id = this.id.replace("slider_", "input_");
					document.getElementById(id).value = value;
				}
		})

		document.getElementById("input_" + param).addEventListener("change", function(){
				var value = parseFloat(this.value) || 0;
				var param = this.id.replace("input_", "");
				ball[param] = value;

				var id = this.id.replace("input_", "slider_");
				$('#' + id).slider({ value: value });
		});
	}
	$('#slider_z').slider({ min: 0, max: 500 });
	$('#slider_mass').slider({ min: 0, max: 10 });



	//input interface
	document.getElementById("input_skip").value = skip;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_g").value = g;

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

};

////////////////////////////////////////
// define threeStart()
////////////////////////////////////////
function threeStart(){
	ball.calculateInitialCondition(dt);
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
	camera.position.set(500, 0, 30);
	camera.up.set(0,0,1);
	camera.lookAt({x: 0, y:0, z: 10});

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
	sphere.position.set(ball.x, ball.y, ball.z);

	//time development
	var time = step * dt;
	if(stopFlag == false){
		for(var k=0; k<skip; k++){
			step++;
			time = step * dt;
			ball.timeEvolution(dt);
			if(step % (skip*skip_data) == 0){
				data_x.push([time, ball.x]);
				data_y.push([time, ball.y]);
				data_z.push([time, ball.z]);
				data_vx.push([time, ball.vx]);
				data_vy.push([time, ball.vy]);
				data_vz.push([time, ball.vz]);
				var energy = ball.calculateEnergy();
				data_kinetic.push([time, energy.kinetic]);
				data_potential.push([time, energy.potential]);
				data_energy.push([time, energy.kinetic + energy.potential]);
			}
		}
	}
	document.getElementById("time").innerHTML = time.toFixed(2);

	if(restartFlag == true){
		//init time param
		step = 0;
		skip = parseInt(document.getElementById("input_skip").value);
		dt = parseFloat(document.getElementById("input_dt").value);
		g = parseFloat(document.getElementById("input_g").value);
		mass = parseFloat(document.getElementById("input_mass").value);

		//init ball
		var parameter = {radius: RADIUS, mass: mass};
		parameter.x = parseFloat(document.getElementById("input_x").value);
		parameter.y = parseFloat(document.getElementById("input_y").value);
		parameter.z = parseFloat(document.getElementById("input_z").value);
		parameter.vx = parseFloat(document.getElementById("input_vx").value);
		parameter.vy = parseFloat(document.getElementById("input_vy").value);
		parameter.vz = parseFloat(document.getElementById("input_vz").value);
		ball = new Ball(parameter);
		ball.calculateInitialCondition(dt);
		restartFlag = false;
		stopFlag = false;

		document.getElementById("startButton").value = "Restart";
	}

	if(stopFlag){
		document.getElementById("stopButton").value = "start";
	}else{
		document.getElementById("stopButton").value = "stop";
	}

	//init clear color
	renderer.clear();

	//draw trajectory
	trajectory.push(new THREE.Vector3(ball.x, ball.y, ball.z));
	var trajectoryGeometry = new THREE.Geometry();
	trajectoryGeometry.vertices = trajectory;
	var material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
	var line = new THREE.Line(trajectoryGeometry, material);
	scene.add(line);

	//rendering
	renderer.render(scene, camera);

	//remove line
	scene.remove(line);

	//call loop function
	requestAnimationFrame(loop);
}

