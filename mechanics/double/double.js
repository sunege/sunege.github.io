//////////////////////////
//                      //
// double pendulum      //
//                      //
//////////////////////////
//constant value
var pi = Math.PI;
var g = 9.80665; 

////////////////////////////////////
//time Parameter
var time = 0;		// time
var Dt = 0.0001; // Delta t
var step = 0; //step count
var _skip = 1; //slow mortion
var skip = 1/(60*Dt)*_skip;

////////////////////////////////////
// system parameter
// constraint length
var l = 1.0;
var L = 1.0;
// air resistance param

////////////////////////////////////
//Particle parameter
//mass
var mass1 = 1.0;
var mass2 = 1.0;
//draw radius
var radius1 = 0.1*Math.pow(mass1, 1.0/3.0);
var radius2 = 0.1*Math.pow(mass2, 1.0/3.0);

////////////////////////////////////
//initial state
var theta0 = pi/3.0;
var phi0 = pi/3.0;
var theta_v0 = 0;
var phi_v0 = 0;

////////////////////////////////////
//flag parameter
var resetFlag = false; // restert flag
var stopFlag = true; // stop flag

////////////////////////////////////
//particle class
var p1;
var p2;
class Particle {
    constructor(radius, mass, angle, angle_v) {
        this.radius = radius;
        this.mass = mass;
        this.angle = angle;
        this.angle_v = angle_v;
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

Particle.prototype = {
	constructor: Particle
};

////////////////////////////////////
//time development function
//calculate force of theta
function ft(t, p, t_v, p_v, m, M) {
    var si = Math.sin(t - p);
    var co = Math.cos(t - p);
    //var ta = tan(t - p);
    return (-1.0*M*si*((L/l)*p_v*p_v + co*t_v*t_v)-g*(((m+M)*Math.sin(t)/l)-M*Math.sin(p)*co/l))/(m+M*si*si);

}
//calculate force of phi
function fp(t, p, t_v, p_v, m, M) {
    var si = Math.sin(t - p);
    var co = Math.cos(t - p);
    //var ta = tan(t - p);
    return (si*((m+M)*(l/L)*t_v*t_v+M*co*p_v*p_v) + (m+M)*(g/L)*(Math.sin(t)*co-Math.sin(p)))/(m+M*si*si);
}
var debug_flag = 1;
//runge kutta method
function timeDevelopment() {
    //current parameter set
    var t = p1.angle;
    var p = p2.angle;
    var tv = p1.angle_v;
    var pv = p2.angle_v;
    var m = p1.mass;
    var M = p2.mass;

    //runge kutta var
    var atv = 0;
    var apv = 0;
    var at = 0;
    var ap = 0;
    var btv = 0;
    var bpv = 0;
    var bt = 0;
    var bp = 0;
    var ctv = 0;
    var cpv = 0;
    var ct = 0;
    var cp = 0;
    var dtv = 0;
    var dpv = 0;
    var dt = 0;
    var dp = 0;

    atv = ft(t, p, tv, pv, m, M);
    apv = fp(t, p, tv, pv, m, M);
    at = tv;
    ap = pv;

    btv = ft(t + at * Dt / 2.0, p + ap * Dt / 2.0, tv + atv * Dt / 2.0, pv + apv * Dt / 2.0, m, M);
    bpv = fp(t + at * Dt / 2.0, p + ap * Dt / 2.0, tv + atv * Dt / 2.0, pv + apv * Dt / 2.0, m, M);
    bt = tv + at * Dt / 2.0;
    bp = pv + ap * Dt / 2.0;

    ctv = ft(t + bt * Dt / 2.0, p + bp * Dt / 2.0, tv + btv * Dt / 2.0, pv + bpv * Dt / 2.0, m, M);
    cpv = fp(t + bt * Dt / 2.0, p + bp * Dt / 2.0, tv + btv * Dt / 2.0, pv + bpv * Dt / 2.0, m, M);
    ct = tv + bt * Dt / 2.0;
    cp = pv + bp * Dt / 2.0;

    dtv = ft(t + ct * Dt, p + cp * Dt, tv + ctv * Dt, pv + cpv * Dt, m, M);
    dpv = fp(t + ct * Dt, p + cp * Dt, tv + ctv * Dt, pv + cpv * Dt, m, M);
    dt = tv + ct * Dt;
    dp = pv + cp * Dt;

    t = t + Dt * (at + 2.0 * bt + 2.0 * ct + dt) / 6.0;
    p = p + Dt * (ap + 2.0 * bp + 2.0 * cp + dp) / 6.0;
    tv = tv + Dt * (atv + 2.0 * btv + 2.0 * ctv + dtv) / 6.0;
    pv = pv + Dt * (apv + 2.0 * bpv + 2.0 * cpv + dpv) / 6.0;

    p1.angle = t;
    p2.angle = p;
    p1.angle_v = tv;
    p2.angle_v = pv;
}

////////////////////////////////////////
// theta, phi --> x, y
function calculatePosition() {
    var t = p1.angle;
    var p = p2.angle;

    var x1 = l*Math.sin(t);
    var y1 = l*Math.cos(t);
    var _y1 = -y1;

    var x2 = x1 + L*Math.sin(p);
    var y2 = y1 + L*Math.cos(p);
    var _y2 = -y2;

    p1.x = x1;
    p1.y = _y1;
    p2.x = x2;
    p2.y = _y2;
}



////////////////////////////////////////
// define window event 
window.addEventListener("load", function(){
        initSystem();
		initEvent();
		threeStart();
});
////////////////////////////////////////
// create particles
function initSystem(){
    p1 = new Particle(radius1, mass1, theta0, theta_v0);
    p2 = new Particle(radius2, mass2, phi0, phi_v0);
}

////////////////////////////////////////
// define slider button interface
function initEvent(){

	//slider interface
	$('#slider_skip').slider({
			min: 0.01,
			max: 5.00,
			step: 0.01,
			value: _skip,
			slide: function(_event, ui){
				var value = ui.value;
				_skip = value;
				skip = 1/(60*Dt)*_skip;
				document.getElementById("input_skip").value = value;
			}
	});

    /*
	$('#slider_radius').slider({
			min: 0.01,
			max: 5,
			step: 0.01,
			value: RADIUS,
			slide: function(_event, ui){
				var value = ui.value;
				document.getElementById("input_radius").value = value;
            }
    */
	$('#slider_mass1').slider({
            min: 0.1,
			max: 10,
			step: 0.1,
			value: mass1,
			slide: function(_event, ui){
				var value = ui.value;
                document.getElementById("input_mass1").value = value;
			}
    });
	$('#slider_mass2').slider({
            min: 0.1,
			max: 10,
			step: 0.1,
			value: mass1,
			slide: function(_event, ui){
				var value = ui.value;
                document.getElementById("input_mass2").value = value;
			}
    });
        /*
	$('#slider_N').slider({
			min: 1,
			max: 40,
			step: 1,
			value: N,
			slide: function(_event, ui){
				var value = ui.value;
				document.getElementById("input_N").value = value;
			}
	});
	$('#slider_theta').slider({
			min: 0,
			max: 90,
			step: 1,
			value: theta * 180 / Math.PI,
			slide: function(_event, ui){
				var value = Math.PI * ui.value / 180.0;
				document.getElementById("input_theta").value = ui.value;
			}
	});


    */
	//input interface
    document.getElementById("input_skip").value = _skip;
	document.getElementById("input_mass1").value = mass1;
	document.getElementById("input_mass2").value = mass2;
	document.getElementById("input_Dt").value = Dt;
    /*
	document.getElementById("input_radius").value = RADIUS;
	document.getElementById("input_N").value = N;
	document.getElementById("input_theta").value = theta * 180.0 / Math.PI;


	//checkbox interface
	$('#checkbox_velocity_vector').click(function(){
			if($(this).prop('checked') == true){
				vector_flag = true;
			}
			else{
				vector_flag = false;
			}
	});
	$('#checkbox_orbital').click(function(){
			if($(this).prop('checked') == true){
				orbital_flag = true;
			}
			else{
				orbital_flag = false;
			}
	});


    */

	//button interface
	//start button
	document.getElementById("startButton").addEventListener("click", function(){
			resetFlag = true;
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
function threeStart(){
	initThree();
	initCamera();
	initLight();
    initObject();
    //main loop
	loop();
}

// 

////////////////////////////////////////
// create renderer, scene, canvasFrame 
var renderer, // renderer object
	 scene, // scene object
	 canvasFrame; //DOM element
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
// create camera, trackball
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
    camera.position.set(0.0, 0.0, 10.0);
	camera.up.set(0, 1, 0);
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
	trackball.target = new THREE.Vector3(0.0, 0.0, 0.0);

	trackball.staticMoving = true;

	trackball.dynamicDampingFactor = 0.3;
}

////////////////////////////////////////
// create light
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
// create objects 
// global variables

//debug
var axis;

//particle1
var sphere1;
//particle2
var sphere2;

var line1;
var line2;

function initObject(){
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
    axis.position.set(0, 0, 0);

    //create sphere object
    createShperes();

    calculatePosition(p1, p2);
    sphere1.position.set(p1.x, p1.y, p1.z);
    sphere2.position.set(p2.x, p2.y, p2.z);

    //create line
    createLines();

}

function createShperes() {
    var geometry1 = new THREE.SphereGeometry(p1.radius, 20, 20);
    var material1 = new THREE.MeshLambertMaterial({color: 0x00ff00, ambient: 0x00ff00 });
    sphere1 = new THREE.Mesh(geometry1, material1);
    scene.add(sphere1);
    sphere1.castShadow = true;

    var geometry2 = new THREE.SphereGeometry(p2.radius, 20, 20);
    var material2 = new THREE.MeshLambertMaterial({color: 0xff0000, ambient: 0xff0000 });
    sphere2 = new THREE.Mesh(geometry2, material2);
    scene.add(sphere2);
    sphere2.castShadow = true;
}

function createLines() {
    var geometry_line1 = new THREE.Geometry();
    geometry_line1.vertices.push(new THREE.Vector3(0,0,0));
    geometry_line1.vertices.push(new THREE.Vector3(p1.x, p1.y,0));

    var geometry_line2 = new THREE.Geometry();
    geometry_line2.vertices.push(new THREE.Vector3(p1.x, p1.y,0));
    geometry_line2.vertices.push(new THREE.Vector3(p2.x, p2.y,0));

    var material_line = new THREE.LineBasicMaterial({color: 0x00ffff, linewidth: 2});

    line1 = new THREE.Line(geometry_line1, material_line)
    line2 = new THREE.Line(geometry_line2, material_line)

    scene.add(line1);
    scene.add(line2);
}


////////////////////////////////////////
// object timedevelopment 
////////////////////////////////////////
function update_object(){
    //sphere 
    calculatePosition(p1, p2);
    sphere1.position.set(p1.x, p1.y, p1.z);
    sphere2.position.set(p2.x, p2.y, p2.z);
    //lines
    scene.remove(line1);
    scene.remove(line2);
    createLines();
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
function loop(){
    //update trackball object
    trackball.update();

    if(resetFlag == true){
        resetParameter();
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
            time = Dt * step;

            timeDevelopment();
        }
        update_object();
    }
    else{
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

function resetParameter() {
        //remove sphere and orbital
        scene.remove(sphere1);
        scene.remove(sphere2);
        scene.remove(line1);
        scene.remove(line2);

        //init time param
        time = 0;
        step = 0;
        mass1 = parseFloat(document.getElementById("input_mass1").value);
        mass2 = parseFloat(document.getElementById("input_mass2").value);
        radius1 = 0.1*Math.pow(mass1, 1.0/3.0);
        radius2 = 0.1*Math.pow(mass2, 1.0/3.0);
        Dt = parseFloat(document.getElementById("input_Dt").value);

        /*
        step = 0;
        _skip = parseInt(document.getElementById("input_skip").value);
        RADIUS = parseFloat(document.getElementById("input_radius").value);
        N = parseFloat(document.getElementById("input_N").value);
        theta = Math.PI * parseFloat(document.getElementById("input_theta").value) / 180.0;
        strobe_time = parseFloat(document.getElementById("input_strobe").value);
        */

        //init particle and calculation class
        initSystem();
        initObject();
        resetFlag = false;
        stopFlag = true;

}