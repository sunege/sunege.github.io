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
var skip = 5;
var _skip = 0.1;

//oscillation
var A = 0;

//Field parameter
var T = 300; // temp
var k_B = 1.38e-23;
var gamma = 0.5; // air resistance param
var gravity = 0; // gravitational accelaration


//Particle parameter
var MASS = 4.67e-26;
var RADIUS = 0.3;
var vel = 0; // avg vel

//boundary condition
var boundary="d";

//Spring param
//natural length
var nl = 0.7;

var spring = { k: 1000, l: nl*dl };

var freq = 1;
var m=8; // mode
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
	//freq = m*Math.sqrt(spring.k*Math.abs((nl - 1))/(MASS * (N) * (N-1)))/2;
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
			//カットオフv_maxの設定
			var v=0.0;		//計算用の変数
			var dv=30;		//計算用のステップ
			var f=0.0;		//分布関数の保存用
			var f_max=0.0;	//分布関数の最大値
			var v_max;	//速度のカットオフ
			var loop_flag = true;	//ループを抜けるフラグ

			//値が最大値の1/1000倍になったらその時のvをv_maxに記録してループを抜ける
			while(loop_flag == true){
				f = this.maxwell_distribution(v);
				if(f >= f_max){
					f_max = f;
				}
				else if(f < f_max){
					v_max = v;
					if(f <= f_max/1000.0){
						loop_flag=false;
					}
				}
				v+=dv;
			}

			//モンテカルロ法（分布関数内に入っていたらその数値を採用する）
			for(var i=0; i<N; i++){
				loop_flag=true;
				while(loop_flag == true){
					var v_rand = this.rand(v_max, 1.0);
					var f_rand = this.rand(f_max, 0.0);
					var f_flag = this.maxwell_distribution(v_rand);
					if(f_rand <= f_flag){
						var theta = this.rand(Math.PI,0.0);
						var phi = this.rand(2*Math.PI, 0.0);
						var vx = v_rand*Math.sin(theta)*Math.cos(phi);
						var vy = v_rand*Math.sin(theta)*Math.sin(phi);
						var vz = v_rand*Math.cos(theta);
						p[i].mass = MASS;
						p[i].x = this.rand(RADIUS, L-RADIUS);
						p[i].y = this.rand(RADIUS, L-RADIUS);
						p[i].z = this.rand(RADIUS, L-RADIUS);
						p[i].fx = 0;
						p[i].fy = 0;
						p[i].fz = 0;
						p[i].vx = vx;
						p[i].vy = vy;
						p[i].vz = vz;
						loop_flag=false;
					}
				}
			}
			//this.calculateForce(p);
		}
		vel = 0;
		for(var i=0; i<N; i++){
			vel += Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		}
		vel = vel/N;
	},
	rand: function(min, max){
		return Math.random()*(max-min)+min;
	},
	maxwell_distribution: function(v){
		var f = 4*Math.PI*v*v*Math.pow(MASS/(2*Math.PI*k_B*T),1.5)*Math.exp(-MASS*v*v/(2*k_B*T));
		return f;
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
			////////		if( i == 0 ){
			////////			p[i].fx = force01.x;
			////////			p[i].fy = force01.y;
			////////			p[i].fz = force01.z;
			////////		}
			////////		else if( i == N-1 ){
			////////			p[i].fx = force10.x;
			////////			p[i].fy = force10.y;
			////////			p[i].fz = force10.z;
			////////		}
			////////		else{
			////////			p[i].fx = force01.x+force10.x;
			////////			p[i].fy = force01.y+force10.y;
			////////			p[i].fz = force01.z+force10.z;
			////////		}
			//gravity and resistance
			if( i == 0 ){
				p[i].fx = force01.x-gamma*p[i].vx;
				p[i].fy = force01.y-gamma*p[i].vy;
				p[i].fz = force01.z-gravity*p[i].mass-gamma*p[i].vz;
			}
			else if( i == N-1 ){
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
		this.border(p);
	},
	border: function(p){
		for(var i=0; i<N; i++){
			if(p[i].x < RADIUS){
				p[i].x = RADIUS;
				p[i].vx = -p[i].vx;
			}
			else if(p[i].x > L-RADIUS){
				p[i].x = L-RADIUS;
				p[i].vx = -p[i].vx;
			}
			if(p[i].y < RADIUS){
				p[i].y = RADIUS;
				p[i].vy = -p[i].vy;
			}
			else if(p[i].y > L-RADIUS){
				p[i].y = L-RADIUS;
				p[i].vy = -p[i].vy;
			}
			if(p[i].z < RADIUS){
				p[i].z = RADIUS;
				p[i].vz = -p[i].vz;
			}
			else if(p[i].z > L-RADIUS){
				p[i].z = L-RADIUS;
				p[i].vz = -p[i].vz;
			}
		}
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
var stopFlag = true; // stop flag


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
	$('#slider_temp').slider({
		min: 1,
		max: 1000,
		step: 1,
		value: T,
		slide: function(event, ui){
			var value = ui.value;
			document.getElementById("input_temp").value = value;
		}
	});

	//input interface
	document.getElementById("input_skip").value = _skip;
	document.getElementById("input_radius").value = RADIUS;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_mass").value = MASS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_temp").value = T;


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
	camera.position.set(L*2.5,L*0.8,L*0.7);
	camera.up.set(0,0,1);
	camera.lookAt({x: L/2, y:L/2, z: L/2});

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
	trackball.target = new THREE.Vector3(L/2, L/2, L/2);

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
		var v_center = 1500;
		var v_ratio = parseFloat(velocity / v_center, 10);
		if(v_ratio > 1){
			v_ratio = 1;
		}
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

	var v1 = { x: 0, y: 0, z:0 };
	var v2 = { x: 0, y: L, z:0 };
	var v3 = { x: 0, y: L, z:L };
	var v4 = { x: 0, y: 0, z:L };
	var v5 = { x: L, y: 0, z:0 };
	var v6 = { x: L, y: L, z:0 };
	var v7 = { x: L, y: L, z:L };
	var v8 = { x: L, y: 0, z:L };
	//far
	wall1 = wall(v1, v2, v3, v4);
	scene.add(wall1);
	//near
	wall2 = wall(v6, v5, v8, v7);
	scene.add(wall2);
	//left
	wall3 = wall(v5, v1, v4, v8);
	scene.add(wall3);
	//right
	wall4 = wall(v2, v6, v7, v3);
	scene.add(wall4);
	//top
	wall5 = wall(v4, v3, v7, v8);
	scene.add(wall5);
	//bottom
	wall6 = wall(v5, v6, v2, v1);
	scene.add(wall6);
	//create shadow
	wall1.castShadow = true;
	wall2.castShadow = true;
	wall3.castShadow = true;
	wall4.castShadow = true;
	wall5.castShadow = true;
	wall6.castShadow = true;

	geometry = new THREE.BoxGeometry(L,L,L);
	material = new THREE.MeshPhongMaterial({color: 0xFF0000, wireframe: true});
	var box = new THREE.Mesh(geometry, material);
	scene.add(box);
	box.position.set(L/2, L/2, L/2);

}

function wall(v1, v2, v3, v4){
	var vertex1 = new THREE.Vector3(v1.x, v1.y, v1.z);
	var vertex2 = new THREE.Vector3(v2.x, v2.y, v2.z);
	var vertex3 = new THREE.Vector3(v3.x, v3.y, v3.z);
	var vertex4 = new THREE.Vector3(v4.x, v4.y, v4.z);
	var geometry = new THREE.Geometry();
	geometry.vertices.push(vertex1);
	geometry.vertices.push(vertex2);
	geometry.vertices.push(vertex3);
	geometry.vertices.push(vertex4);
	var face = new THREE.Face3(0, 1, 2);
	geometry.faces.push(face);
	face = new THREE.Face3(0, 2, 3);
	geometry.faces.push(face);
	//calculate surface normal
	geometry.computeFaceNormals();
	//calculate vertex normal vector
	geometry.computeVertexNormals();

	//create material
	var material = new THREE.MeshLambertMaterial({color: 0xaaaabb, ambient: 0x555577 });
	//create sphere object
	return new THREE.Mesh(geometry, material);
}

////////////////////////////////////////
// define plotStart()
////////////////////////////////////////
function plotStart(){
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
		T = parseFloat(document.getElementById("input_temp").value);

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

		}
	}
	//set draw object
	for(var i=0; i<N; i++){
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
	}

	document.getElementById("time").innerHTML = time.toFixed(2);
	document.getElementById("L").innerHTML = L.toFixed(0);
	document.getElementById("vel").innerHTML = vel.toFixed(2);

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

