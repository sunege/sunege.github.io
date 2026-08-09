//////////////////////////
//                      //
// ho                   //
//                      //
//////////////////////////

//System Parameter
import { initThree, initLight } from '../../js/common/three-setup.js';
import { lineGeometry } from '../../js/common/geometry.js';

let time = 0;		// time
let dt = 0.0001; // Delta t
let N = 1;	   // number of particle
// var L = 20;	   // System length
// var dl = L / (N-1); //discreat space
let step = 0; //step count
let _skip = 1; //slow mortion
let skip = 1/(60*dt)*_skip;

//oscillation
// var A = 0;

//Field parameter
// var T = 300; // temp
// var k_B = 1.38e-23;
let gamma = 0.0; // air resistance param
const gravity = 9.8; // gravitational accelaration



//Particle parameter
let MASS = 1; //kg
let RADIUS = 0.3;

//particle max velocity
const vel_init = 15;

let theta = Math.PI / 3;

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
	}
}

//calculation class
class Calculation {
	constructor(p){
		this.initParticle(p);
	}

	//init Particles
	initParticle(p){
		for(let i=0; i<N; i++){
			const v = vel_init;
			const vx = v * Math.cos((i+1)*theta/(N));
            const vy = v * Math.sin((i+1)*theta/(N));
			const vz = 0.0;
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
			p[i].v = v;
			this.calculateForce(p);
		}
	}

	//calculation Force
	calculateForce(p){
		for(let i=0; i<N; i++){
			p[i].fx = -gamma*p[i].vx;
			p[i].fy = -gravity*p[i].mass-gamma*p[i].vy;
			p[i].fz = -gamma*p[i].vz;
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
	}

calculateKinetic(p){
		for(let i=0; i<p.length; i++){
			p[i].kinetic = p[i].mass*(p[i].vx*p[i].vx + p[i].vy*p[i].vy + p[i].vz*p[i].vz)/2;
		}
	}
}

//TextBoardObject class
const TextBoardCanvas = function(parameter){
	parameter = parameter || {};

	this.backgroundColor = parameter.backgroundColor || {r:1, g:1, b:1, a:1};
	this.textColor = parameter.textColor || {r:0, g:0, b:0, a:1};

	this.boardWidth = parameter.boardWidth || 100;
	this.boardHeight = parameter.boardHeight || 100;

	this.fontSize = parameter.fontSize || 10;
	this.lineHeight = parameter.lineHeight || 1.1;

	this.fontName = parameter.fontName || "serif";

	this.resolution = parameter.resolution || 4;

	this._lineHeight = 0;
	this.textLines = [];

	this.init();
}

//particle object
const p = [];

//calculation object
let cal;

//stop flag
let restartFlag = false; // restert flag
let stopFlag = true; // stop flag


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
	$('#slider_mass').slider({
            min: 0.1,
			max: 10,
			step: 0.1,
			value: MASS,
			slide: function(event, ui){
				const value = ui.value;
				document.getElementById("input_mass").value = value;
			}
		});
	$('#slider_N').slider({
			min: 1,
			max: 40,
			step: 1,
			value: N,
			slide: function(event, ui){
				const value = ui.value;
				document.getElementById("input_N").value = value;
			}
	});
	$('#slider_theta').slider({
			min: 0,
			max: 90,
			step: 1,
			value: theta * 180 / Math.PI,
			slide: function(event, ui){
				const value = Math.PI * ui.value / 180.0;
				document.getElementById("input_theta").value = ui.value;
			}
	});
	$('#slider_gamma').slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: gamma,
			slide: function(event, ui){
				const value = ui.value;
				document.getElementById("input_gamma").value = value;
			}
	});
	$('#slider_strobe').slider({
			min: 0.01,
			max: 1,
			step: 0.01,
			value: strobe_time,
			slide: function(event, ui){
				const value = ui.value;
				document.getElementById("input_strobe").value = value;
			}
	});


	//input interface
	document.getElementById("input_skip").value = _skip;
	document.getElementById("input_radius").value = RADIUS;
	document.getElementById("input_dt").value = dt;
	document.getElementById("input_mass").value = MASS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_theta").value = theta * 180.0 / Math.PI;
	document.getElementById("input_gamma").value = gamma;
	document.getElementById("input_strobe").value = strobe_time;


	//checkbox interface
	$('#checkbox_velocity_vector').click(function(){
			if($(this).prop('checked') === true){
				vector_flag = true;
			}
			else{
				vector_flag = false;
			}
	});
	$('#checkbox_orbital').click(function(){
			if($(this).prop('checked') === true){
				orbital_flag = true;
			}
			else{
				orbital_flag = false;
			}
	});

	$('#checkbox_strobe').click(function(){
			if($(this).prop('checked') === true){
				strobe_flag = true;
			}
			else{
				strobe_flag = false;
			}
	});


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
    camera.position.set(vel_init * vel_init * Math.sin(2*theta)/(2*gravity),5.0,30.0);
	camera.up.set(0,1,0);
	camera.lookAt({x: 0.0, y: 0.0, z: 0.0});

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
	trackball.target = new THREE.Vector3(vel_init * vel_init * Math.sin(2*theta)/(2*gravity), 5.0, 0.0);

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

const v_arrow = [];
const vx_arrow = [];
const vy_arrow = [];
const adjust_of_arrow_length = 0.3;
let vector_flag = false;
const head_length = 0.4;
const head_width = 0.4;

let strobe=[]; //strobe object
let strobe_count; //strobe count
let strobe_time=0.5; //strobe interval time
let strobe_flag; //strobe flag

let strobe_v=[]; //velocity strobe object
let strobe_vx=[]; //velocity strobe object
let strobe_vy=[]; //velocity strobe object

let orbital=[]; //orbital object
let orbital_vertices = []; //orbital data
let orbital_geometry = [];
const orbital_material = new THREE.LineBasicMaterial({ color: 0xFFFFFF});
let orbital_flag;

let wall1;

let text_zero; //text object

function initObject(){
	let blue_hex, green_hex, red_hex;
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
    axis.position.set(0, 0, 0);

    //create velocity vector object
    strobe_v = new Array(N);
    strobe_vx = new Array(N);
    strobe_vy = new Array(N);
    for(let i=0; i<N; i++){
        const dir_v = new THREE.Vector3(p[i].vx, p[i].vy, 0);
        const dir_vx = new THREE.Vector3(p[i].vx, 0, 0);
        const dir_vy = new THREE.Vector3(0, p[i].vy, 0);
        dir_v.normalize();
        dir_vx.normalize();
        dir_vy.normalize();

        const origin = new THREE.Vector3(p[i].x, p[i].y, p[i].z);

        const length_v = adjust_of_arrow_length * Math.sqrt(p[i].vx * p[i].vx + p[i].vy * p[i].vy);
        const length_vx = adjust_of_arrow_length * Math.abs(p[i].vx);
        const length_vy = adjust_of_arrow_length * Math.abs(p[i].vy);

        const color_v = 0xffff00;
        const color_vx = 0x00ffff;
        const color_vy = 0xff00ff;

        v_arrow[i] = new THREE.ArrowHelper( dir_v, origin, length_v, color_v, head_length, head_width);
        vx_arrow[i] = new THREE.ArrowHelper( dir_vx, origin, length_vx, color_vx, head_length, head_width);
        vy_arrow[i] = new THREE.ArrowHelper( dir_vy, origin, length_vy, color_vy, head_length, head_width);

        strobe_v[i] = new Array();
        strobe_vx[i] = new Array();
        strobe_vy[i] = new Array();

        if(vector_flag === true){
            scene.add( v_arrow[i] );
            scene.add( vx_arrow[i] );
            scene.add( vy_arrow[i] );

            if(strobe_flag === true){
                strobe_v[i].push(new THREE.ArrowHelper( dir_v, origin, length_v, color_v, head_length, head_width));
                strobe_vx[i].push(new THREE.ArrowHelper( dir_vx, origin, length_vx, color_vx, head_length, head_width));
                strobe_vy[i].push(new THREE.ArrowHelper( dir_vy, origin, length_vy, color_vy, head_length, head_width));
                scene.add(strobe_v[i][ strobe_v[i].length - 1 ]);
                scene.add(strobe_vx[i][ strobe_vx[i].length - 1 ]);
                scene.add(strobe_vy[i][ strobe_vy[i].length - 1 ]);
            }
        }
    }

    //create sphere object
    sphere = [];
    for(let i=0; i<N; i++){
        //create geometry
        const geometry = new THREE.SphereGeometry(p[i].radius, 20, 20);
        //速度によって色変化

        const theta_i = i*theta/(N+1);
        const theta_center = theta/2;
        const theta_ratio = parseFloat(theta_i / theta_center, 10);
        if(theta_ratio > 1){
            red_hex = "ff";
            blue_hex = "00";

            if(theta_ratio > 2){
                green_hex = "00";
            }
            else{
                const green = parseInt(254 - 254*(theta_ratio - 1), 10);
                if(green < 16){
                    green_hex = "0" + green.toString(16);
                }
                else{
                    green_hex = green.toString(16);
                }
            }
        }
        else{
            const red = parseInt(254 * theta_ratio, 10);
            if(red < 16){
                red_hex = "0" + red.toString(16);
            }
            else{
                red_hex = red.toString(16);
            }

            green_hex = "ff";

            const blue = parseInt(254 * (1-theta_ratio), 10);
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
        sphere[i].position.set(p[i].x, p[i].y, p[i].z);
        sphere[i].castShadow = true;
    }

    //strobe object
    strobe = new Array(N);
    for(let i=0; i<N; i++){
        strobe[i] = new Array();
        if(strobe_flag === true){
            strobe[i].push(new THREE.Mesh(sphere[i].geometry, sphere[i].material));
            strobe[i][ strobe[i].length - 1 ].position.set(p[i].x, p[i].y, p[i].z);
            scene.add(strobe[i][ strobe[i].length - 1 ]);
        }
    }
    //init count
    strobe_count = 0;



    orbital = null;
    orbital_vertices = null;

    orbital = [];
    orbital_vertices = [];
    orbital_geometry = [];
    for(let i=0; i<N; i++){
        orbital_geometry[i] = [];
        orbital_vertices[i] = new Array();
        orbital_vertices[i].push(new THREE.Vector3(p[i].x, p[i].y, p[i].z));
        orbital_geometry[i].push(orbital_vertices[i][0]);
        orbital[i] = new THREE.Line(lineGeometry(orbital_geometry[i]), orbital_material);
        scene.add(orbital[i]);
    }

    //text object
    //
    // 	var fontLoader = new THREE.FontLoader();
    // 	fontLoader.load("../../js/Three/fonts/helvetiker_regular.typeface.json",function(helvetiker_regular){
    // 			var textGeometry = new THREE.TextGeometry( '0',{
    // 					size : 30,
    // 					height : 4,
    // 					curveSegments: 3
    // 					font: "helvetiker_regular",
    // 					weight : "regular",
    // 			});
    // 			var textMaterial = new THREE.MeshLambertMaterial({color:0x00ff00});
    // 			text_zero = new THREE.Mesh( textGeometry, textMaterial);
    // 			scene.add(text_zero);
    // 	});
}


////////////////////////////////////////
// object timedevelopment 
////////////////////////////////////////
function update_object(){
    let color_v, color_vx, color_vy, dir_v, dir_vx, dir_vy, length_v, length_vx, length_vy, origin;
    //set draw object
    for(let i=0; i<N; i++){
        //velocity vector
        scene.remove(v_arrow[i]);
        scene.remove(vx_arrow[i]);
        scene.remove(vy_arrow[i]);
        dir_v = new THREE.Vector3(p[i].vx, p[i].vy, 0);
        dir_vx = new THREE.Vector3(p[i].vx, 0, 0);
        dir_vy = new THREE.Vector3(0, p[i].vy, 0);

        dir_v.normalize();
        dir_vx.normalize();
        dir_vy.normalize();

        origin = new THREE.Vector3(p[i].x, p[i].y, p[i].z);

        length_v = adjust_of_arrow_length * Math.sqrt(p[i].vx * p[i].vx + p[i].vy * p[i].vy);
        length_vx = adjust_of_arrow_length * Math.abs(p[i].vx);
        length_vy = adjust_of_arrow_length * Math.abs(p[i].vy);

        color_v = 0xffff00;
        color_vx = 0x00ffff;
        color_vy = 0xff00ff;

        v_arrow[i] = new THREE.ArrowHelper( dir_v, origin, length_v, color_v, head_length, head_width);
        vx_arrow[i] = new THREE.ArrowHelper( dir_vx, origin, length_vx, color_vx, head_length, head_width);
        vy_arrow[i] = new THREE.ArrowHelper( dir_vy, origin, length_vy, color_vy, head_length, head_width);
        if(vector_flag === true){
            scene.add( v_arrow[i] );
            scene.add( vx_arrow[i] );
            scene.add( vy_arrow[i] );
        }

        //sphere 
        sphere[i].position.set(p[i].x, p[i].y, p[i].z);


        //orbital
        scene.remove(orbital[i]);
        //add vertex
        orbital_vertices[i].push(new THREE.Vector3(p[i].x, p[i].y, p[i].z));
        orbital_geometry[i] = orbital_vertices[i];
        orbital[i] = new THREE.Line(lineGeometry(orbital_geometry[i]), orbital_material);
        if(orbital_flag === true){
            scene.add(orbital[i]);
        }
    }

    if(strobe_flag === true){
        strobe_count += dt*skip;
        if(strobe_count > strobe_time){
            //strobe
            for(let i=0; i<N; i++){
                strobe[i].push(new THREE.Mesh(sphere[i].geometry, sphere[i].material));
                strobe[i][ strobe[i].length - 1 ].position.set(p[i].x, p[i].y, p[i].z);
                scene.add(strobe[i][ strobe[i].length - 1 ]);
                if(vector_flag === true){
                    dir_v = new THREE.Vector3(p[i].vx, p[i].vy, 0);
                    dir_vx = new THREE.Vector3(p[i].vx, 0, 0);
                    dir_vy = new THREE.Vector3(0, p[i].vy, 0);

                    dir_v.normalize();
                    dir_vx.normalize();
                    dir_vy.normalize();

                    origin = new THREE.Vector3(p[i].x, p[i].y, p[i].z);

                    length_v = adjust_of_arrow_length * Math.sqrt(p[i].vx * p[i].vx + p[i].vy * p[i].vy);
                    length_vx = adjust_of_arrow_length * Math.abs(p[i].vx);
                    length_vy = adjust_of_arrow_length * Math.abs(p[i].vy);

                    color_v = 0xffff00;
                    color_vx = 0x00ffff;
                    color_vy = 0xff00ff;
                    strobe_v[i].push(new THREE.ArrowHelper( dir_v, origin, length_v, color_v, head_length, head_width));
                    strobe_vx[i].push(new THREE.ArrowHelper( dir_vx, origin, length_vx, color_vx, head_length, head_width));
                    strobe_vy[i].push(new THREE.ArrowHelper( dir_vy, origin, length_vy, color_vy, head_length, head_width));
                    scene.add(strobe_v[i][ strobe_v[i].length - 1 ]);
                    scene.add(strobe_vx[i][ strobe_vx[i].length - 1 ]);
                    scene.add(strobe_vy[i][ strobe_vy[i].length - 1 ]);
                }
            }
            strobe_count = 0;
        }
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


    if(restartFlag === true){
        //remove sphere and orbital
        for(let i=0; i<N; i++){
            scene.remove(v_arrow[i]);
            scene.remove(vx_arrow[i]);
            scene.remove(vy_arrow[i]);
            scene.remove(sphere[i]);
            scene.remove(orbital[i]);
            for(let j=0; j<strobe[i].length; j++){
                scene.remove(strobe[i][j]);
                scene.remove(strobe_v[i][j]);
                scene.remove(strobe_vx[i][j]);
                scene.remove(strobe_vy[i][j]);
            }
        }

        //init time param
        step = 0;
        _skip = parseInt(document.getElementById("input_skip").value);
        RADIUS = parseFloat(document.getElementById("input_radius").value);
        dt = parseFloat(document.getElementById("input_dt").value);
        MASS = parseFloat(document.getElementById("input_mass").value);
        N = parseFloat(document.getElementById("input_N").value);
        theta = Math.PI * parseFloat(document.getElementById("input_theta").value) / 180.0;
        gamma = parseFloat(document.getElementById("input_gamma").value);
        strobe_time = parseFloat(document.getElementById("input_strobe").value);

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
        update_object();
    }
    else{
        if(vector_flag===true){
            for(let i=0; i<N; i++){
                scene.add(v_arrow[i])
                scene.add(vx_arrow[i])
                scene.add(vy_arrow[i])
            }
        }
        else{
            for(let i=0; i<N; i++){
                scene.remove(v_arrow[i])
                scene.remove(vx_arrow[i])
                scene.remove(vy_arrow[i])
            }
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

