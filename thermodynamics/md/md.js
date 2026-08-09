////////////////////
//                //
// 1D H.O. System //
//                //
////////////////////

//System Parameter
// 暗黙のグローバルだった変数（strictモードのクラス内から代入されるため明示宣言）
import * as THREE from 'three';
import { TrackballControls } from '../../js/vendor/three/controls/TrackballControls.js';
import { initThree, initLight, applyLegacyAmbient } from '../../js/common/three-setup.js';
import { quadGeometry } from '../../js/common/geometry.js';

let wall2, wall3, wall4, wall5, wall6;

let time = 0;		// time
let dt = 0.0001; // Delta t
let N = 50;	   // number of particle
const L = 20;	   // System length
const dl = L / (N-1); //discreat space
let step = 0; //step count
let skip = 5;
let _skip = 0.1;

//oscillation
const A = 0;

//Field parameter
let T = 300; // temp
const k_B = 1.38e-23;
const gamma = 0.5; // air resistance param
const gravity = 0; // gravitational accelaration


//Particle parameter
let MASS = 4.67e-26;
let RADIUS = 0.3;
let vel = 0; // avg vel

//boundary condition
const boundary="d";

//Spring param
//natural length
const nl = 0.7;

const spring = { k: 1000, l: nl*dl };

const freq = 1;
const m=8; // mode
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
		//freq = m*Math.sqrt(spring.k*Math.abs((nl - 1))/(MASS * (N) * (N-1)))/2;
	}
}

//calculation class
class Calculation {
	constructor(p){
		this.initParticle(p);
	}

	//init Particles
	initParticle(p){
		let i;
		for(i=0; i<N; i++){
			//カットオフv_maxの設定
			let v=0.0;		//計算用の変数
			const dv=30;		//計算用のステップ
			let f=0.0;		//分布関数の保存用
			let f_max=0.0;	//分布関数の最大値
			let v_max;	//速度のカットオフ
			let loop_flag = true;	//ループを抜けるフラグ

			//値が最大値の1/1000倍になったらその時のvをv_maxに記録してループを抜ける
			while(loop_flag === true){
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
			for(i=0; i<N; i++){
				loop_flag=true;
				while(loop_flag === true){
					const v_rand = this.rand(v_max, 1.0);
					const f_rand = this.rand(f_max, 0.0);
					const f_flag = this.maxwell_distribution(v_rand);
					if(f_rand <= f_flag){
// 						var theta = this.rand(2*Math.PI,0.0);
// 						var phi = this.rand(2*Math.PI, 0.0);
// 						var vx = v_rand*Math.sin(theta)*Math.cos(phi);
// 						var vy = v_rand*Math.sin(theta)*Math.sin(phi);
// 						var vz = v_rand*Math.cos(theta);
						const theta = this.rand(2*Math.PI,0.0);
						const phi = this.rand(2*Math.PI,0.0);
						const psi = this.rand(2*Math.PI,0.0);
						const vx = (this.c(theta)*this.c(phi)*this.c(psi)-this.s(phi)*this.s(psi))*v_rand;
						const vy = (-this.c(theta)*this.c(phi)*this.s(psi)-this.s(phi)*this.c(psi))*v_rand;
						const vz = this.s(theta)*this.c(phi)*v_rand;
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
						p[i].v = Math.sqrt(vx*vx+vy*vy+vz*vz);
						loop_flag=false;
					}
				}
			}
			//this.calculateForce(p);
		}
		vel = 0;
		for(i=0; i<N; i++){
			vel += Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		}
		vel = vel/N;

	}

rand(min, max){
		return Math.random()*(max-min)+min;
	}

maxwell_distribution(v){
		const f = 4*Math.PI*v*v*Math.pow(MASS/(2*Math.PI*k_B*T),1.5)*Math.exp(-MASS*v*v/(2*k_B*T));
		return f;
	}

s(theta){
		return Math.sin(theta);
	}

c(theta){
		return Math.cos(theta);
	}

		//calculation Force
	calculateForce(p){
		let force01,force10;
		let d_r;
		force01={ x: 0, y: 0, z: 0 };
		force10={ x: 0, y: 0, z: 0 };
		d_r={ x: 0, y: 0, z: 0, norm: 0 };
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

		for(let i=0; i<N; i++){
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
		for(let i=0; i<N; i++){
			p[i].vx = p[i].vx + ( old_fx[i] + p[i].fx )*dt/(2*p[i].mass); 
			p[i].vy = p[i].vy + ( old_fy[i] + p[i].fy )*dt/(2*p[i].mass); 
			p[i].vz = p[i].vz + ( old_fz[i] + p[i].fz )*dt/(2*p[i].mass); 
		}
		//p[0] = { vx: 0, vy: 0, vz: 0};
		this.border(p);
	}

border(p){
		for(let i=0; i<N; i++){
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
	}

calculateKinetic(p){
		for(let i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	}

histgram(p){
		const delta_v = 100;
		const v_max = 3000;
		const hist = [];
		const n_max = parseInt(v_max/delta_v, 10)
		for(let n=0; n < n_max; n++){
			hist[n] = { v: n*delta_v, particle_id: new Array() };
			for(let i=0; i<N; i++){
				if(p[i].v > n*delta_v && p[i].v < (n+1)*delta_v){
					hist[n].particle_id.push(i);
				}
			}
		}
		const _delta_v = 1.5*L/n_max;
		for(let n=0; n < n_max; n++){
			for(let m=0; m < hist[n].particle_id.length; m++){
				p[hist[n].particle_id[m]].tempx = L+2;
				p[hist[n].particle_id[m]].tempy = _delta_v*(n+1);
				p[hist[n].particle_id[m]].tempz = m*2.1*RADIUS;
			}
		}
	}
}

//particle object
const p = [];


//calculation object
let cal;




//stop flag
let restartFlag = false; // restert flag
let stopFlag = false; // stop flag


////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
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
		min: 0.01,
		max: 1.01,
		step: 0.01,
		value: _skip,
		slide: function(event, ui){
			const value = ui.value;
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
			const value = ui.value;
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
			const value = ui.value;
			document.getElementById("input_N").value = value;
		}
	});
	$('#slider_temp').slider({
		min: 1,
		max: 1000,
		step: 1,
		value: T,
		slide: function(event, ui){
			const value = ui.value;
			document.getElementById("input_temp").value = value;
		}
	});
	document.getElementById("temp").innerHTML = T.toFixed(0);

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
	({ renderer, scene, canvasFrame } = initThree());
	initCamera();
	initLight(scene);
	initObject();
	loop();
}

/*  init Three functions  */

//global variables
let renderer, // renderer object
	 scene, // scene object
	 canvasFrame;////////////////////////////////////////
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
	camera = new THREE.PerspectiveCamera(45, aspect, near, far);

	//set camera options
	camera.position.set(L*2.5,L*0.8,L*0.7);
	camera.up.set(0,0,1);
	camera.lookAt(L/2, L/2, L/2);

	//create trackball object
	trackball = new TrackballControls(camera, canvasFrame);

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
let directionalLight, //directionalLight object
	 ambientLight; // ambientlighLight object

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
let axis;
let sphere=[]; //sphere object
let wall1;

function initObject(){
	let blue_hex, geometry, green_hex, material, red_hex;
	//create geometry
	// 	var geometry = new THREE.SphereGeometry( ball.radius, 20, 20 );
	//create material
	// 	var material = applyLegacyAmbient(new THREE.MeshLambertMaterial({ color: 0xFF0000}), 0x880000);

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
	// 				material = applyLegacyAmbient(new THREE.MeshLambertMaterial({ color: 0x999999}), 0x050505);
	// 			}else{
	// 				material = applyLegacyAmbient(new THREE.MeshLambertMaterial({ color: 0x4d4d4d}), 0x050505);
	// 			}
	// 			var plane = new THREE.Mesh(geometry, material);
	// 			plane.position.set(x, y, 0);
	// 			plane.receiveShadow = true;
	// 			scene.add(plane);
	// 		}
	// 	}
	//create axis object
	axis = new THREE.AxesHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
	axis.position.set(0, 0, 0);

	sphere = [];
	for(let i=0; i<N; i++){
		//create geometry
		geometry = new THREE.SphereGeometry(p[i].radius, 20, 20);
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
		var material = applyLegacyAmbient(new THREE.MeshPhongMaterial({ color: color_code, side: THREE.DoubleSide, specular: 0xFFFFFF, shininess: shine}), color_code);

		*/
	  //速度によって色変化
		
		const velocity = Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		const v_center = 1200;
		const v_ratio = parseFloat(velocity / v_center, 10);
		if(v_ratio > 1){
			red_hex = "ff";
			blue_hex = "00";

			if(v_ratio > 2){
				green_hex = "00";
			}
			else{
				const green = parseInt(254 - 254*(v_ratio - 1), 10);
				if(green < 16){
					green_hex = "0" + green.toString(16);
				}
				else{
					green_hex = green.toString(16);
				}
			}
		}
		else{
			const red = parseInt(254 * v_ratio, 10);
			if(red < 16){
				red_hex = "0" + red.toString(16);
			}
			else{
				red_hex = red.toString(16);
			}

			green_hex = "ff";

			const blue = parseInt(254 * (1-v_ratio), 10);
			if(blue < 16){
				blue_hex = "0" + blue.toString(16);
			}
			else{
				blue_hex = blue.toString(16);
			}
		}

		const color_code = red_hex + green_hex + blue_hex;
		material = applyLegacyAmbient(new THREE.MeshLambertMaterial({color: parseInt(color_code, 16)}), parseInt(color_code, 16));



		//create object
		sphere[i] = new THREE.Mesh(geometry, material);
		//add object
		scene.add(sphere[i]);
		//position
		sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		sphere[i].castShadow = true;
	}

	const v1 = { x: 0, y: 0, z:0 };
	const v2 = { x: 0, y: L, z:0 };
	const v3 = { x: 0, y: L, z:L };
	const v4 = { x: 0, y: 0, z:L };
	const v5 = { x: L, y: 0, z:0 };
	const v6 = { x: L, y: L, z:0 };
	const v7 = { x: L, y: L, z:L };
	const v8 = { x: L, y: 0, z:L };
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
	material = applyLegacyAmbient(new THREE.MeshPhongMaterial({color: 0xFF0000, wireframe: true}));
	const box = new THREE.Mesh(geometry, material);
	scene.add(box);
	box.position.set(L/2, L/2, L/2);

}

function wall(v1, v2, v3, v4){
	const geometry = quadGeometry([v1, v2, v3, v4]);

	//create material
	const material = applyLegacyAmbient(new THREE.MeshLambertMaterial({color: 0xaaaabb}), 0x555577);
	//create sphere object
	return new THREE.Mesh(geometry, material);
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
function loop(){
	//update trackball object
	trackball.update();

	//set sphere position
	// 	sphere.position.set(ball.x, ball.y, ball.z);


	if(restartFlag === true){
		//remove sphere
		for(let i=0; i<N; i++)
			scene.remove(sphere[i]);

		//init time param
		step = 0;
		_skip = parseInt(document.getElementById("input_skip").value);
		RADIUS = parseFloat(document.getElementById("input_radius").value);
		dt = parseFloat(document.getElementById("input_dt").value);
		MASS = parseFloat(document.getElementById("input_mass").value);
		N = parseFloat(document.getElementById("input_N").value);
		T = parseFloat(document.getElementById("input_temp").value);
		document.getElementById("temp").innerHTML = T.toFixed(0);

		//init particle and calculation class
		for(let i=0; i<N; i++){
			p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
		}
		cal = new Calculation(p);
		initObject();
		restartFlag = false;
		stopFlag = false;

		document.getElementById("startButton").value = "Restart";
	}

	if(stopFlag){
		cal.histgram(p);
		//set draw object
		for(let i=0; i<N; i++){
			sphere[i].position.set(p[i].tempx, p[i].tempy, p[i].tempz);
		}
		document.getElementById("stopButton").value = "start";
	}else{
		document.getElementById("stopButton").value = "stop";
	}

	//time development
	// 	var time = step * dt;
	if(stopFlag === false){
		for(let n=0; n<skip; n++){
			//increment of step
			step++;
			time = dt * step;

			cal.timeDevelopment(p);
		}
		//set draw object
		for(let i=0; i<N; i++){
			sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		}
	}

	document.getElementById("time").innerHTML = time.toFixed(2);
	document.getElementById("L").innerHTML = L.toFixed(0);
	document.getElementById("vel").innerHTML = vel.toFixed(2);

	//init clear color
	renderer.clear();


	//rendering
	renderer.render(scene, camera);

	//remove line
	// 	scene.remove(line);

	//call loop function
	requestAnimationFrame(loop);
}

