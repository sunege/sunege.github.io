////////////////////
//                //
// 分子動力学的な //
//                //
////////////////////

//System Parameter
var time = 0;		// time
var dt = 1e-12; // Delta t
var N = 25;	   // number of particle
var L = 10.0e-9;	   // System length
var draw_scale = 1e+9;
var dl = L / (N-1); //discreat space
var step = 0; //step count
var skip = 100;
var _skip = 0.1;

//oscillation
var A = 0;

//Field parameter
var T = 30.0; // temp
var k_B = 1.38e-23;
// var gamma = 0.5; // air resistance param
var gravity = 0; // gravitational accelaration
// var gravity = 0; // gravitational accelaration
var sigma = 0.398e-9;
var epsilon = 232.0*k_B;
// var cut_off = 5*Math.pow(2,1/6)*sigma;
var cut_off = 7*sigma;


//Particle parameter
var MASS = 131/(6.02e+23);//4.67e-26;
var RADIUS = sigma;
var vel = 0; // avg vel

//boundary condition
var boundary="d";
var restitution = 0.7;

//velocity limit flag
velocity_limit_flag = false;


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
    
    //border
    this.outside_x_flag = false;
    this.outside_y_flag = false;
    this.reflect_x_flag = false;
    this.reflect_y_flag = false;
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
			if(T==0){
				p[i].mass = MASS;
				p[i].x = this.rand(RADIUS, L-RADIUS);
				p[i].y = this.rand(RADIUS, L-RADIUS);
// 				p[i].z = this.rand(RADIUS, L-RADIUS);
				p[i].z = L/2;
				p[i].fx = 0;
				p[i].fy = 0;
				p[i].fz = 0;
				p[i].vx = 0;
				p[i].vy = 0;
				p[i].vz = 0;
				p[i].v = 0;
				continue;
			}
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

            var N_line;
            for(var i=0; i<N; i++){
//                 if(Math.pow(i, 3.0) >= N){
                if(Math.pow(i, 2.0) >= N){
                    N_line = i;
                    break;
                }
            }
            var lattice_const = (L - 2.3*RADIUS)/N_line;

            var x_i = 0;
            var y_i = 0;
            var z_i = 0;
			//分布関数内に入っていたらその数値を採用する
			for(var i=0; i<N; i++){
				loop_flag=true;
				while(loop_flag == true){
					var v_rand = this.rand(v_max, 1.0);
					var f_rand = this.rand(f_max, 0.0);
					var f_flag = this.maxwell_distribution(v_rand);
					if(f_rand <= f_flag){
// 						var theta = this.rand(2*Math.PI,0.0);
// 						var phi = this.rand(2*Math.PI, 0.0);
// 						var vx = v_rand*Math.sin(theta)*Math.cos(phi);
// 						var vy = v_rand*Math.sin(theta)*Math.sin(phi);
// 						var vz = v_rand*Math.cos(theta);
						var theta = this.rand(2*Math.PI,0.0);
						var phi = this.rand(2*Math.PI,0.0);
						var psi = this.rand(2*Math.PI,0.0);
// 						var vx = (this.c(theta)*this.c(phi)*this.c(psi)-this.s(phi)*this.s(psi))*v_rand;
// 						var vy = (-this.c(theta)*this.c(phi)*this.s(psi)-this.s(phi)*this.c(psi))*v_rand;
// 						var vz = this.s(theta)*this.c(phi)*v_rand;
                        var vx = v_rand * this.c(theta);
                        var vy = v_rand * this.s(theta);
						p[i].mass = MASS;
//                         p[i].x = 1.1*RADIUS + (i % N_line) * lattice_const;

                        x_i = i % N_line;
                        y_i = Math.floor(i / N_line) % N_line;
                        z_i = Math.floor(i / (N_line * N_line));

                        var first_position = (L/2) - ((N_line-1) * lattice_const / 2);
                        p[i].x = first_position + x_i * lattice_const;
                        p[i].y = first_position + y_i * lattice_const;
//                         p[i].z = first_position + z_i * lattice_const;
                        p[i].z = L/2;
// 						p[i].x = this.rand(RADIUS, L-RADIUS);
// 						p[i].y = this.rand(RADIUS, L-RADIUS);
// 						p[i].z = this.rand(RADIUS, L-RADIUS);
						p[i].fx = 0;
						p[i].fy = 0;
						p[i].fz = 0;
						p[i].vx = vx;
						p[i].vy = vy;
// 						p[i].vz = vz;
						p[i].vz = 0;
// 						p[i].v = Math.sqrt(vx*vx+vy*vy+vz*vz);
						p[i].v = Math.sqrt(vx*vx+vy*vy);
						loop_flag=false;
					}
				}
			}
		}
	
		this.calculateForce(p);
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
	s: function(theta){
		return Math.sin(theta);
	},
	c: function(theta){
		return Math.cos(theta);
	},

		//calculation Force
	calculateForce: function(p){
		var force01,force10;
		var d_r;
		var intforce = 0;
		force01={ x: 0, y: 0, z: 0 };
		force10={ x: 0, y: 0, z: 0 };
		d_r={ x: 0, y: 0, z: 0, norm: 0 };
		for(var i=0; i<N; i++){
			p[i].fx=0;
			p[i].fy=-p[i].mass * gravity;
			p[i].fz=0;
		}
		for(var i=0; i<N; i++){
			for(var j=i; j<N; j++){
				if(j==i)continue;
				else{
					d_r.x = p[j].x - p[i].x;
					d_r.y = p[j].y - p[i].y;
// 					d_r.z = p[j].z - p[i].z;
// 					d_r.norm = Math.sqrt(d_r.x*d_r.x + d_r.y*d_r.y + d_r.z*d_r.z);
					d_r.norm = Math.sqrt(d_r.x*d_r.x + d_r.y*d_r.y);
                    if(d_r.norm > cut_off){
                        continue;
                    }
//                     if(d_r.norm < sigma){
//                         continue;
//                     }
					intforce = -24*epsilon*(2*Math.pow(sigma,12.0)/Math.pow(d_r.norm,13.0) - Math.pow(sigma,6.0)/Math.pow(d_r.norm,7.0));
					force01.x = intforce*d_r.x/d_r.norm;
					force01.y = intforce*d_r.y/d_r.norm;
// 					force01.z = intforce*d_r.z/d_r.norm;
					force10.x = -force01.x;
					force10.y = -force01.y;
// 					force10.z = -force01.z;
					p[i].fx += force01.x;
					p[i].fy += force01.y;
// 					p[i].fz += force01.z;
					p[j].fx += force10.x;
					p[j].fy += force10.y;
// 					p[j].fz += force10.z;
				}
			}
		}
	},
		//Velocity Verlet method
	timeDevelopment: function(p){
		// conserve f(t)
		var old_fx = [];
		var old_fy = [];
// 		var old_fz = [];

		for(var i=0; i<N; i++){
			//x(t+dt) = x(t) + v(t)*dt + f(t)*dt*dt/2m
			p[i].x = p[i].x + p[i].vx*dt + p[i].fx*dt*dt/(2*p[i].mass);
			p[i].y = p[i].y + p[i].vy*dt + p[i].fy*dt*dt/(2*p[i].mass);
// 			p[i].z = p[i].z + p[i].vz*dt + p[i].fz*dt*dt/(2*p[i].mass);

			old_fx[i] = p[i].fx;
			old_fy[i] = p[i].fy;
// 			old_fz[i] = p[i].fz;
		}

		// f(t+dt)
		this.calculateForce(p);

		//v(t+dt) = v(t) + (f(t) + f(t+dt))*dt/2m
		for(var i=0; i<N; i++){
			p[i].vx = p[i].vx + ( old_fx[i] + p[i].fx )*dt/(2*p[i].mass); 
			p[i].vy = p[i].vy + ( old_fy[i] + p[i].fy )*dt/(2*p[i].mass); 
// 			p[i].vz = p[i].vz + ( old_fz[i] + p[i].fz )*dt/(2*p[i].mass); 
		}
		//p[0] = { vx: 0, vy: 0, vz: 0};
		this.border(p);
	},
	border: function(p){
		for(var i=0; i<N; i++){
			if(p[i].x < RADIUS){
				p[i].x = RADIUS;
				p[i].vx = -p[i].vx*restitution;
                reflect_x_flag = true;
			}
			else if(p[i].x > L-RADIUS){
				p[i].x = L-RADIUS;
				p[i].vx = -p[i].vx*restitution;
                reflect_x_flag = true;
			}
			if(p[i].y < RADIUS){
				p[i].y = RADIUS;
				p[i].vy = -p[i].vy*restitution;
                reflect_y_flag = true;
			}
			else if(p[i].y > L-RADIUS){
				p[i].y = L-RADIUS;
				p[i].vy = -p[i].vy*restitution;
                reflect_y_flag = true;
			}
// 			if(p[i].z < RADIUS){
// 				p[i].z = RADIUS;
// 				p[i].vz = -p[i].vz*restitution;
// 			}
// 			else if(p[i].z > L-RADIUS){
// 				p[i].z = L-RADIUS;
// 				p[i].vz = -p[i].vz*restitution;
// 			}
            //速度制限
            if(Math.abs(p[i].vx) >= (L/2 )/dt){
                p[i].vx = (p[i].vx / Math.abs(p[i].vx))*(L/2)/dt;
                velocity_limit_flag = true;
            }
            if(Math.abs(p[i].vy) >= (L/2)/dt){
                velocity_limit_flag = true;
                p[i].vy = (p[i].vy / Math.abs(p[i].vy))*(L/2)/dt;
            }
            if(Math.abs(p[i].vx) < (L/2 )/dt && Math.abs(p[i].vy) < (L/2)/dt){
                velocity_limit_flag = false;
            }
		}
	},
	calculateKinetic: function(p){
		for(var i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	},
    totalKineticEnergy: function(p){
        this.calculateKinetic(p);
        var energy = 0;
        for(var i=0; i<N; i++){
            energy += p[i].kinetic;
        }
        return energy;
    },
	histgram: function(p){
		var delta_v = 100;
		var v_max = 3000;
		var hist = [];
		var n_max = parseInt(v_max/delta_v, 10)
		for(var n=0; n < n_max; n++){
			hist[n] = { v: n*delta_v, particle_id: new Array() };
			for(var i=0; i<N; i++){
				if(p[i].v > n*delta_v && p[i].v < (n+1)*delta_v){
					hist[n].particle_id.push(i);
				}
			}
		}
		var _delta_v = 1.5*L/n_max;
		for(var n=0; n < n_max; n++){
			for(var m=0; m < hist[n].particle_id.length; m++){
				p[hist[n].particle_id[m]].tempx = L+2;
				p[hist[n].particle_id[m]].tempy = _delta_v*(n+1);
				p[hist[n].particle_id[m]].tempz = m*2.1*RADIUS*draw_scale;
			}
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
		min: 1,
		max: 5000,
		step: 1,
		value: skip,
		slide: function(event, ui){
			var value = ui.value;
			skip = value;
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
    /*
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
    */
	document.getElementById("temp").innerHTML = T.toFixed(0);
	$('#slider_restitution').slider({
		min: 0.01,
		max: 1.5,
		step: 0.01,
		value: restitution,
		slide: function(event, ui){
			var value = ui.value;
			document.getElementById("input_restitution").value = value;
		}
	});
	$('#slider_gravity').slider({
		min: 0.0,
		max: 1e+7,
		step: 1,
		value: gravity,
		slide: function(event, ui){
			var value = ui.value;
			document.getElementById("input_gravity").value = value;
		}
	});

	//input interface
	document.getElementById("input_skip").value = skip;
	document.getElementById("input_radius").value = RADIUS;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_mass").value = MASS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_restitution").value = restitution;
	document.getElementById("input_gravity").value = gravity;


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
    onResize();
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
	camera.position.set(L*draw_scale/2,L*draw_scale/2,L*draw_scale*2.5);
	camera.up.set(0,1,0);
	camera.lookAt({x: L*draw_scale/2, y:L*draw_scale/2, z: L*draw_scale/2});

	//create trackball object
	trackball = new THREE.TrackballControls(camera, canvasFrame);

	//set trackball options
	trackball.screen.width = canvasFrame.clientWidth;
	trackball.screen.height = canvasFrame.clientHeight;
	trackball.screen.offsetLeft = canvasFrame.getBoundingClientRect().left;
	trackball.screen.offsetTop = canvasFrame.getBoundingClientRect().top;

	trackball.noRotate = true;
	trackball.rotateSpeed = 2.0;

	trackball.noZoom = false;
	trackball.zoomSpeed = 0.5;

	trackball.noPan = false;
	trackball.panSpeed = 0.6;
	trackball.target = new THREE.Vector3(L*draw_scale/2, L*draw_scale/2, L*draw_scale/2);

	trackball.staticMoving = true;

	trackball.dynamicDampingFactor = 0.3;
}

window.addEventListener('resize', onResize);

function onResize(){
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width/height;
    camera.updateProjectionMatrix();
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
// var axis;
var sphere=[]; //sphere object
var wall1;

function initObject(){
	sphere = [];
	for(var i=0; i<N; i++){
		//create geometry
		var geometry = new THREE.SphereGeometry(p[i].radius*draw_scale, 20, 10);
		//create material
		//
	  //速度によって色変化
		
		var velocity = Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		var v_center = 10000;
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
		sphere[i].position.set(p[i].x*draw_scale, p[i].y*draw_scale, p[i].z*draw_scale);
		//sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		sphere[i].castShadow = true;
	}

	var v1 = { x: 0, y: 0, z:0 };
	var v2 = { x: 0, y: L*draw_scale, z:0 };
	var v3 = { x: 0, y: L*draw_scale, z:L*draw_scale };
	var v4 = { x: 0, y: 0, z:L*draw_scale };
	var v5 = { x: L*draw_scale, y: 0, z:0 };
	var v6 = { x: L*draw_scale, y: L*draw_scale, z:0 };
	var v7 = { x: L*draw_scale, y: L*draw_scale, z:L*draw_scale };
	var v8 = { x: L*draw_scale, y: 0, z:L*draw_scale };
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
// 	wall5 = wall(v4, v3, v7, v8);
// 	scene.add(wall5);
	//bottom
	wall6 = wall(v5, v6, v2, v1);
	scene.add(wall6);
	//create shadow
	wall1.castShadow = true;
	wall2.castShadow = true;
	wall3.castShadow = true;
	wall4.castShadow = true;
// 	wall5.castShadow = true;
	wall6.castShadow = true;
    wall1.material.needsUpdate = true;
    wall2.material.needsUpdate = true;
    wall3.material.needsUpdate = true;
    wall4.material.needsUpdate = true;
//     wall6.material.needsUpdate = true;

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
	var material = new THREE.MeshLambertMaterial({color: 0xaaaabb, ambient: 0x555555 });
	//create sphere object
	return new THREE.Mesh(geometry, material);
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
//壁面更新用
var compare_restitution = 0;
function loop(){
	//update trackball object
	trackball.update();

	//set sphere position
	// 	sphere.position.set(ball.x, ball.y, ball.z);

    if(compare_restitution != restitution){
        compare_restitution = restitution;
        if(restitution > 1){
            color_code = 0xff8888;
        }
        else if(restitution < 1){
            color_code = 0x8888ff;
        }
        else{
            color_code = 0xaaaabb;
        }
    /*
		var red = parseInt(255 * (restitution/1.5), 10);
		var red_hex = red.toString(16);

		var green_hex = "aa";

		var blue = parseInt(255 * (1-restitution/1.5), 10);
		var blue_hex = blue.toString(16);

		var color_code = "0x" + red_hex + green_hex + blue_hex;

        color_code = Number(color_code);
    */
        wall1.material.color.set(color_code);
        wall2.material.color.set(color_code);
        wall3.material.color.set(color_code);
        wall4.material.color.set(color_code);
        wall1.material.ambient.set(color_code);
        wall2.material.ambient.set(color_code);
        wall3.material.ambient.set(color_code);
        wall4.material.ambient.set(color_code);
        
    }


	if(restartFlag == true){
		//remove sphere
		for(var i=0; i<N; i++)
			scene.remove(sphere[i]);

		//init time param
		step = 0;
		skip = parseInt(document.getElementById("input_skip").value);
		RADIUS = parseFloat(document.getElementById("input_radius").value);
		dt = parseFloat(document.getElementById("input_dt").value);
		MASS = parseFloat(document.getElementById("input_mass").value);
		N = parseFloat(document.getElementById("input_N").value);
		document.getElementById("temp").innerHTML = T.toFixed(0);

		//init particle and calculation class
		for(var i=0; i<N; i++){
			p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
		}
		cal = new Calculation(p);
		initObject();
        wall1.material.color.set(color_code);
        wall2.material.color.set(color_code);
        wall3.material.color.set(color_code);
        wall4.material.color.set(color_code);
        wall1.material.ambient.set(color_code);
        wall2.material.ambient.set(color_code);
        wall3.material.ambient.set(color_code);
        wall4.material.ambient.set(color_code);
		restartFlag = false;
		stopFlag = false;

		document.getElementById("startButton").value = "Restart";
	}

	if(stopFlag){
		cal.histgram(p);
		//set draw object
		for(var i=0; i<N; i++){
			sphere[i].position.set(p[i].tempx, p[i].tempy, p[i].tempz);
		}
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
			sphere[i].position.set(p[i].x*draw_scale, p[i].y*draw_scale, p[i].z*draw_scale);
			//sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		}
	}
    var T_indicator = 0;
    T_indicator = cal.totalKineticEnergy(p)/((3/2)*N*k_B);

	document.getElementById("time").innerHTML = (time*1e+9).toFixed(1);
	document.getElementById("L").innerHTML = (L*1e+9).toFixed(1);
    vel = 0;
    for(var i=0; i<N; i++){
        vel += Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
    }
    vel = vel/N;
	document.getElementById("vel").innerHTML = vel.toFixed(2);
    if(velocity_limit_flag){
        document.getElementById("temp").innerHTML = "NaN";
    }
    else{
        document.getElementById("temp").innerHTML = (T_indicator).toFixed(1);
    }
    restitution = Number(document.getElementById("input_restitution").value);
    gravity = Number(document.getElementById("input_gravity").value);

	//init clear color
	renderer.clear();


	//rendering
	renderer.render(scene, camera);

	//remove line
	// 	scene.remove(line);

	//call loop function
	requestAnimationFrame(loop);
    
}

