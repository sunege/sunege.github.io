////////////////////
//                //
// 分子動力学的な //
//                //
////////////////////

//System Parameter
// 暗黙のグローバルだった変数（strictモードのクラス内から代入されるため明示宣言）
import { initThree, initLight } from '../../js/common/three-setup.js';

let color_code, reflect_x_flag, reflect_y_flag, reflect_z_flag, velocity_limit_flag, wall2, wall3, wall4, wall5, wall6;

let time = 0;		// time
let dt = 0.5e-12; // Delta t
let N = 218;	   // number of particle
const L = 5.0e-9;	   // System length
const draw_scale = 1e+9;
const dl = L / (N-1); //discreat space
let step = 0; //step count
let skip = 10;
const _skip = 0.1;

//oscillation
const A = 0;

//Field parameter
const T = 20.0; // temp
const k_B = 1.38e-23;
// var gamma = 0.5; // air resistance param
let gravity = 0; // gravitational accelaration
let gamma = -1e-14;
let pre_gamma = gamma * 1e+14; //スライダー用
// var gravity = 0; // gravitational accelaration
const sigma = 0.398e-9;
const epsilon = 232.0*k_B;
// var cut_off = 5*Math.pow(2,1/6)*sigma;
const cut_off = 7*sigma;


//Particle parameter
let MASS = 131/(6.02e+23);//4.67e-26;
let RADIUS = 0.5 * sigma;
let vel = 0; // avg vel

//boundary condition
const boundary="d";
let restitution = 1.0;

//velocity limit flag
velocity_limit_flag = false;


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
	    
	    //border
	    this.outside_x_flag = false;
	    this.outside_y_flag = false;
	    this.reflect_x_flag = false;
	    this.reflect_y_flag = false;
	    this.reflect_z_flag = false;
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
			if(T===0){
				p[i].mass = MASS;
				p[i].x = this.rand(RADIUS, L-RADIUS);
				p[i].y = this.rand(RADIUS, L-RADIUS);
				p[i].z = this.rand(RADIUS, L-RADIUS);
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

            let N_line;
            for(i=0; i<N; i++){
//                 if(Math.pow(i, 3.0) >= N){
                if(Math.pow(i, 3.0) >= N){
                    N_line = i;
                    break;
                }
            }
            const lattice_const = (L - 2.3*RADIUS)/N_line;

            let x_i = 0;
            let y_i = 0;
            let z_i = 0;
			//分布関数内に入っていたらその数値を採用する
			for(i=0; i<N; i++){
				loop_flag=true;
				while(loop_flag === true){
					const v_rand = this.rand(v_max, 1.0);
					const f_rand = this.rand(f_max, 0.0);
					const f_flag = this.maxwell_distribution(v_rand);
					if(f_rand <= f_flag){
						const theta = this.rand(2*Math.PI,0.0);
						const phi = this.rand(1*Math.PI,0.0);
						const psi = this.rand(2*Math.PI,0.0);
						const vx = (this.c(theta)*this.c(phi)*this.c(psi)-this.s(phi)*this.s(psi))*v_rand;
						const vy = (-this.c(theta)*this.c(phi)*this.s(psi)-this.s(phi)*this.c(psi))*v_rand;
						const vz = this.s(theta)*this.c(phi)*v_rand;
						p[i].mass = MASS;
//                         p[i].x = 1.1*RADIUS + (i % N_line) * lattice_const;

                        x_i = i % N_line;
                        y_i = Math.floor(i / N_line) % N_line;
                        z_i = Math.floor(i / (N_line * N_line));

                        const first_position = (L/2) - ((N_line-1) * lattice_const / 2);
                        p[i].x = first_position + x_i * lattice_const;
                        p[i].y = first_position + y_i * lattice_const;
                        p[i].z = first_position + z_i * lattice_const;
// 						p[i].x = this.rand(RADIUS, L-RADIUS);
// 						p[i].y = this.rand(RADIUS, L-RADIUS);
// 						p[i].z = this.rand(RADIUS, L-RADIUS);
						p[i].fx = 0;
						p[i].fy = 0;
						p[i].fz = 0;
						p[i].vx = vx;
						p[i].vy = vy;
						p[i].vz = vz;
						p[i].v = Math.sqrt(vx*vx+vy*vy+vz*vz);
// 						p[i].v = Math.sqrt(vx*vx+vy*vy);
						loop_flag=false;
					}
				}
			}
		}
	
		this.calculateForce(p);
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
		let intforce = 0;
		force01={ x: 0, y: 0, z: 0 };
		force10={ x: 0, y: 0, z: 0 };
		d_r={ x: 0, y: 0, z: 0, norm: 0 };
		for(let i=0; i<N; i++){
			p[i].fx=p[i].vx * gamma;
			p[i].fy=p[i].vy * gamma - p[i].mass * gravity;
			p[i].fz=p[i].vz * gamma;
		}
		for(let i=0; i<N; i++){
			for(let j=i; j<N; j++){
				if(j===i)continue;
				else{
					d_r.x = p[j].x - p[i].x;
					d_r.y = p[j].y - p[i].y;
					d_r.z = p[j].z - p[i].z;
					d_r.norm = Math.sqrt(d_r.x*d_r.x + d_r.y*d_r.y + d_r.z*d_r.z);
// 					d_r.norm = Math.sqrt(d_r.x*d_r.x + d_r.y*d_r.y);
                    if(d_r.norm > cut_off){
                        continue;
                    }
//                     if(d_r.norm < sigma){
//                         continue;
//                     }
					intforce = -24*epsilon*(2*Math.pow(sigma,12.0)/Math.pow(d_r.norm,13.0) - Math.pow(sigma,6.0)/Math.pow(d_r.norm,7.0));
					force01.x = intforce*d_r.x/d_r.norm;
					force01.y = intforce*d_r.y/d_r.norm;
					force01.z = intforce*d_r.z/d_r.norm;
					force10.x = -force01.x;
					force10.y = -force01.y;
					force10.z = -force01.z;
					p[i].fx += force01.x;
					p[i].fy += force01.y;
					p[i].fz += force01.z;
					p[j].fx += force10.x;
					p[j].fy += force10.y;
					p[j].fz += force10.z;
				}
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
		this.calculateForce(p);

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
			if(p[i].z < RADIUS){
				p[i].z = RADIUS;
				p[i].vz = -p[i].vz*restitution;
                reflect_z_flag = true;
			}
			else if(p[i].z > L-RADIUS){
				p[i].z = L-RADIUS;
				p[i].vz = -p[i].vz*restitution;
                reflect_z_flag = true;
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
            if(Math.abs(p[i].vz) >= (L/2)/dt){
                velocity_limit_flag = true;
                p[i].vz = (p[i].vz / Math.abs(p[i].vz))*(L/2)/dt;
            }
            if(Math.abs(p[i].vx) < (L/2 )/dt && Math.abs(p[i].vy) < (L/2)/dt){
                velocity_limit_flag = false;
            }
		}
	}

calculateKinetic(p){
		for(let i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	}

totalKineticEnergy(p){
        this.calculateKinetic(p);
        let energy = 0;
        for(let i=0; i<N; i++){
            energy += p[i].kinetic;
        }
        return energy;
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
				p[hist[n].particle_id[m]].tempz = m*2.1*RADIUS*draw_scale;
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
		min: 1,
		max: 100,
		step: 1,
		value: skip,
		slide: function(event, ui){
			const value = ui.value;
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
		max: 900,
		step: 1,
		value: N,
		slide: function(event, ui){
			const value = ui.value;
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
			const value = ui.value;
			document.getElementById("input_restitution").value = value;
		}
	});
	$('#slider_gravity').slider({
		min: 0.0,
		max: 1e+7,
		step: 1,
		value: gravity,
		slide: function(event, ui){
			const value = ui.value;
			document.getElementById("input_gravity").value = value;
		}
	});
	$('#slider_gamma').slider({
		min: -5,
		max: 5,
		step: 0.5,
		value: pre_gamma,
		slide: function(event, ui){
			const value = ui.value;
			document.getElementById("input_gamma").value = value;
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
	document.getElementById("input_gamma").value = pre_gamma;


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
//     onResize();
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
	camera.position.set(L*draw_scale*2.5,L*draw_scale*0.8,L*draw_scale*0.7);
	camera.up.set(0,0,1);
	camera.lookAt({x: L*draw_scale/2, y:L*draw_scale/2, z: L*draw_scale/2});

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
	trackball.target = new THREE.Vector3(L*draw_scale/2, L*draw_scale/2, L*draw_scale/2);

	trackball.staticMoving = true;

	trackball.dynamicDampingFactor = 0.3;
}

// window.addEventListener('resize', onResize);

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
let directionalLight, //directionalLight object
	 ambientLight; // ambientlighLight object

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
// var axis;
let sphere=[]; //sphere object
let wall1;

function initObject(){
	let blue_hex, green_hex, red_hex;
	sphere = [];
	for(let i=0; i<N; i++){
		//create geometry
		const geometry = new THREE.SphereGeometry(p[i].radius*draw_scale, 20, 10);
		//create material
		//
	  //速度によって色変化
		
		const velocity = Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
		const v_center = 10000;
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
		const material = new THREE.MeshLambertMaterial({color: parseInt(color_code, 16), ambient: parseInt(color_code, 16) });



		//create object
		sphere[i] = new THREE.Mesh(geometry, material);
		//add object
		scene.add(sphere[i]);
		//position
		sphere[i].position.set(p[i].x*draw_scale, p[i].y*draw_scale, p[i].z*draw_scale);
		//sphere[i].position.set(p[i].x, p[i].y, p[i].z);
		sphere[i].castShadow = true;
	}

	const v1 = { x: 0, y: 0, z:0 };
	const v2 = { x: 0, y: L*draw_scale, z:0 };
	const v3 = { x: 0, y: L*draw_scale, z:L*draw_scale };
	const v4 = { x: 0, y: 0, z:L*draw_scale };
	const v5 = { x: L*draw_scale, y: 0, z:0 };
	const v6 = { x: L*draw_scale, y: L*draw_scale, z:0 };
	const v7 = { x: L*draw_scale, y: L*draw_scale, z:L*draw_scale };
	const v8 = { x: L*draw_scale, y: 0, z:L*draw_scale };
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
    wall1.material.needsUpdate = true;
    wall2.material.needsUpdate = true;
    wall3.material.needsUpdate = true;
    wall4.material.needsUpdate = true;
    wall5.material.needsUpdate = true;
    wall6.material.needsUpdate = true;

}

function wall(v1, v2, v3, v4){
	const vertex1 = new THREE.Vector3(v1.x, v1.y, v1.z);
	const vertex2 = new THREE.Vector3(v2.x, v2.y, v2.z);
	const vertex3 = new THREE.Vector3(v3.x, v3.y, v3.z);
	const vertex4 = new THREE.Vector3(v4.x, v4.y, v4.z);
	const geometry = new THREE.Geometry();
	geometry.vertices.push(vertex1);
	geometry.vertices.push(vertex2);
	geometry.vertices.push(vertex3);
	geometry.vertices.push(vertex4);
	let face = new THREE.Face3(0, 1, 2);
	geometry.faces.push(face);
	face = new THREE.Face3(0, 2, 3);
	geometry.faces.push(face);
	//calculate surface normal
	geometry.computeFaceNormals();
	//calculate vertex normal vector
	geometry.computeVertexNormals();

	//create material
	const material = new THREE.MeshLambertMaterial({color: 0xaaaabb, ambient: 0x555555 });
	//create sphere object
	return new THREE.Mesh(geometry, material);
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
//壁面更新用
let compare_restitution = 0;
let compare_gamma = 0;
let color_code6;
function loop(){
    //update trackball object
    trackball.update();

    //set sphere position
    // 	sphere.position.set(ball.x, ball.y, ball.z);

    if(compare_restitution !== restitution){
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
        wall1.material.color.set(color_code);
        wall2.material.color.set(color_code);
        wall3.material.color.set(color_code);
        wall4.material.color.set(color_code);
        wall1.material.ambient.set(color_code);
        wall2.material.ambient.set(color_code);
        wall3.material.ambient.set(color_code);
        wall4.material.ambient.set(color_code);
    }

    if(compare_gamma !== pre_gamma){
        compare_gamma = pre_gamma;
        if(pre_gamma > 0){
            color_code6 = 0xff8888;
        }
        else if(pre_gamma < 0){
            color_code6 = 0x8888ff;
        }
        else{
            color_code6 = 0xaaaabb;
        }
        wall6.material.color.set(color_code6);
        wall6.material.ambient.set(color_code6);
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



    if(restartFlag === true){
        //remove sphere
        for(let i=0; i<N; i++)
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
        for(let i=0; i<N; i++){
            p[i] = new Particle({index: i, radius: RADIUS, mass: MASS});
        }
        cal = new Calculation(p);
        initObject();
        wall1.material.color.set(color_code);
        wall2.material.color.set(color_code);
        wall3.material.color.set(color_code);
        wall4.material.color.set(color_code);
        wall6.material.color.set(color_code6);
        wall1.material.ambient.set(color_code);
        wall2.material.ambient.set(color_code);
        wall3.material.ambient.set(color_code);
        wall4.material.ambient.set(color_code);
        wall6.material.ambient.set(color_code6);
        restartFlag = false;
        stopFlag = false;

        document.getElementById("startButton").value = "Restart";
    }

    if(stopFlag){
        // 		cal.histgram(p);
        //set draw object
        // 		for(var i=0; i<N; i++){
        // 			sphere[i].position.set(p[i].tempx, p[i].tempy, p[i].tempz);
        // 		}
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
            sphere[i].position.set(p[i].x*draw_scale, p[i].y*draw_scale, p[i].z*draw_scale);
            //sphere[i].position.set(p[i].x, p[i].y, p[i].z);
        }
    }
    let T_indicator = 0;
    T_indicator = cal.totalKineticEnergy(p)/((3/2)*N*k_B);

    document.getElementById("time").innerHTML = (time*1e+9).toFixed(1);
    document.getElementById("L").innerHTML = (L*1e+9).toFixed(1);
    vel = 0;
    for(let i=0; i<N; i++){
        vel += Math.sqrt(p[i].vx*p[i].vx+p[i].vy*p[i].vy+p[i].vz*p[i].vz);
    }
    vel = vel/N;
    document.getElementById("vel").innerHTML = vel.toFixed(2);
    if(velocity_limit_flag){
        document.getElementById("temp").innerHTML = "NaN";
    }
    else{
        document.getElementById("temp").innerHTML = (T_indicator).toFixed(5);
    }
    restitution = Number(document.getElementById("input_restitution").value);
    gravity = Number(document.getElementById("input_gravity").value);
    pre_gamma = Number(document.getElementById("input_gamma").value);
    gamma = pre_gamma * 1e-14;

    //init clear color
    renderer.clear();


    //rendering
    renderer.render(scene, camera);

    //remove line
    // 	scene.remove(line);

    //call loop function
    requestAnimationFrame(loop);

}

