//////////////////////////
//                      //
// double pendulum      //
//                      //
//////////////////////////
//constant value
const pi = Math.PI;
const g = 9.80665; 

////////////////////////////////////
//time Parameter
let time = 0;		// time
let Dt = 0.0001; // Delta t
let step = 0; //step count
let _skip = 1; //slow mortion
let skip = 1/(60*Dt)*_skip;

////////////////////////////////////
// system parameter
// constraint length
let l = 1.0;
let L = 1.5;
// air resistance param

////////////////////////////////////
//Particle parameter
//mass
let mass1 = 1.0;
let mass2 = 1.0;
//draw radius
let radius1 = 0.1*Math.pow(mass1, 1.0/3.0);
let radius2 = 0.1*Math.pow(mass2, 1.0/3.0);

////////////////////////////////////
//initial state
let theta0 = pi/3.0;
let phi0 = pi/6.0;
const theta_v0 = 0;
const phi_v0 = 0;

////////////////////////////////////
//flag parameter
let resetFlag = false; // restert flag
let stopFlag = true; // stop flag
let contourFlag = true;

////////////////////////////////////
//objects array
let objects = [];

////////////////////////////////////
//particle class
let p1;
let p2;
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
    const si = Math.sin(t - p);
    const co = Math.cos(t - p);
    //var ta = tan(t - p);
    return (-1.0*M*si*((L/l)*p_v*p_v + co*t_v*t_v)-g*(((m+M)*Math.sin(t)/l)-M*Math.sin(p)*co/l))/(m+M*si*si);

}
//calculate force of phi
function fp(t, p, t_v, p_v, m, M) {
    const si = Math.sin(t - p);
    const co = Math.cos(t - p);
    //var ta = tan(t - p);
    return (si*((m+M)*(l/L)*t_v*t_v+M*co*p_v*p_v) + (m+M)*(g/L)*(Math.sin(t)*co-Math.sin(p)))/(m+M*si*si);
}
const debug_flag = 1;
//runge kutta method
function timeDevelopment() {
    //current parameter set
    let t = p1.angle;
    let p = p2.angle;
    let tv = p1.angle_v;
    let pv = p2.angle_v;
    const m = p1.mass;
    const M = p2.mass;

    //runge kutta var
    let atv = 0;
    let apv = 0;
    let at = 0;
    let ap = 0;
    let btv = 0;
    let bpv = 0;
    let bt = 0;
    let bp = 0;
    let ctv = 0;
    let cpv = 0;
    let ct = 0;
    let cp = 0;
    let dtv = 0;
    let dpv = 0;
    let dt = 0;
    let dp = 0;

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
    const t = p1.angle;
    const p = p2.angle;

    const x1 = l*Math.sin(t);
    const y1 = l*Math.cos(t);
    const _y1 = -y1;

    const x2 = x1 + L*Math.sin(p);
    const y2 = y1 + L*Math.cos(p);
    const _y2 = -y2;

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
				const value = ui.value;
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
				const value = ui.value;
                document.getElementById("input_mass1").value = value;
			}
    });
	$('#slider_mass2').slider({
            min: 0.1,
			max: 10,
			step: 0.1,
			value: mass1,
			slide: function(_event, ui){
				const value = ui.value;
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


    */
	//checkbox interface
	$('#checkbox_contour').click(function(){
			if($(this).prop('checked') === true){
				contourFlag = true;
			}
			else{
				contourFlag = false;
			}
    });
    /*
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
    mouseEvent();
	initCamera();
	initLight();
    initObject();
    //main loop
	loop();
}

// 

////////////////////////////////////////
// create renderer, scene, canvasFrame 
let renderer, // renderer object
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
let directionalLight, //directionalLight object
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
let axis;

//particle1
let sphere1;
//particle2
let sphere2;

let line1;
let line2;

let contour1;
let contour2;

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

    //create contour
    createContour();

}

function createShperes() {
    const geometry1 = new THREE.SphereGeometry(p1.radius, 20, 20);
    const material1 = new THREE.MeshLambertMaterial({color: 0x00ff00, ambient: 0x00ff00 });
    sphere1 = new THREE.Mesh(geometry1, material1);
    scene.add(sphere1);
    sphere1.castShadow = true;
    objects.push(sphere1);

    const geometry2 = new THREE.SphereGeometry(p2.radius, 20, 20);
    const material2 = new THREE.MeshLambertMaterial({color: 0xff0000, ambient: 0xff0000 });
    sphere2 = new THREE.Mesh(geometry2, material2);
    scene.add(sphere2);
    sphere2.castShadow = true;
    objects.push(sphere2);
}

function createLines() {
    const geometry_line1 = new THREE.Geometry();
    geometry_line1.vertices.push(new THREE.Vector3(0,0,0));
    geometry_line1.vertices.push(new THREE.Vector3(p1.x, p1.y,0));

    const geometry_line2 = new THREE.Geometry();
    geometry_line2.vertices.push(new THREE.Vector3(p1.x, p1.y,0));
    geometry_line2.vertices.push(new THREE.Vector3(p2.x, p2.y,0));

    const material_line = new THREE.LineBasicMaterial({color: 0x00ffff, linewidth: 2});

    line1 = new THREE.Line(geometry_line1, material_line);
    line2 = new THREE.Line(geometry_line2, material_line);

    scene.add(line1);
    scene.add(line2);
}

let contour1_vertices = [];
let contour2_vertices = [];
function createContour() {
    const geometry_contour1 = new THREE.Geometry();
    geometry_contour1.vertices = contour1_vertices;

    const geometry_contour2 = new THREE.Geometry();
    geometry_contour2.vertices = contour2_vertices;

    const material_contour1 = new THREE.LineBasicMaterial({color: 0x99ff00, linewidth: 1});
    const material_contour2 = new THREE.LineBasicMaterial({color: 0xff9900, linewidth: 1});

    contour1 = new THREE.Line(geometry_contour1, material_contour1);
    contour2 = new THREE.Line(geometry_contour2, material_contour2);

    if( contour1_vertices.length >= 2 && contourFlag ) {
        scene.add(contour1);
        scene.add(contour2);
    }
}


////////////////////////////////////////
// object timedevelopment 
////////////////////////////////////////
function updateObjects(){
    //sphere 
    calculatePosition(p1, p2);
    sphere1.position.set(p1.x, p1.y, p1.z);
    sphere2.position.set(p2.x, p2.y, p2.z);

    //lines
    scene.remove(line1);
    scene.remove(line2);
    createLines();

    //contours
    scene.remove(contour1);
    scene.remove(contour2);
    contour1_vertices.push(new THREE.Vector3(p1.x, p1.y, 0));
    contour2_vertices.push(new THREE.Vector3(p2.x, p2.y, 0));
    createContour();

}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
function loop(){
    //update trackball object
    trackball.update();

    if(resetFlag === true){
        resetParameter();
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
            time = Dt * step;

            timeDevelopment();
        }
        updateObjects();
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
        objects = [];
        scene.remove(line1);
        scene.remove(line2);
        scene.remove(contour1);
        contour1_vertices = [];
        scene.remove(contour2);
        contour2_vertices = [];


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

//////////////////////////////////////////////////////////////
// mouse event
const plane = new THREE.Plane();

let raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const offset = new THREE.Vector3();
const intersection = new THREE.Vector3();

let mouseoveredObj;
let draggedObj;
function mouseEvent() {
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
}

function onDocumentMouseDown(event) {
    const rect = event.target.getBoundingClientRect();
    let mx = event.clientX - rect.left;
    let my = event.clientY - rect.top;

    mx = (mx / renderer.domElement.width) * 2 - 1;
    my = -(my /renderer.domElement.height) * 2 + 1;

    let pos = new THREE.Vector3(mx, my, 1);

    pos.unproject(camera);
    
    pos = pos.sub(camera.position).normalize();
    raycaster = new THREE.Raycaster( camera.position, pos );
    const intersects = raycaster.intersectObjects(objects);


    if (intersects.length > 0) {

        draggedObj = intersects[0].object;

        // rayとplaneの交点を求めてintersectionに設定
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            // ドラッグ中のオブジェクトとplaneの距離
            offset.copy(intersection).sub(draggedObj.position);
        }
    }
}
function onDocumentMouseMove(event) {
    event.preventDefault();

    const rect = event.target.getBoundingClientRect();
    let mx = event.clientX - rect.left;
    let my = event.clientY - rect.top;

    mx = (mx / renderer.domElement.width) * 2 - 1;
    my = -(my /renderer.domElement.height) * 2 + 1;

    let pos = new THREE.Vector3(mx, my, 1);

    pos.unproject(camera);
    
    pos = pos.sub(camera.position).normalize();
    raycaster = new THREE.Raycaster( camera.position, pos );

   // raycaster.setFromCamera(camera.position, pos);

    if (draggedObj) {
        // オブジェクトをドラッグして移動させているとき

        // rayとplaneの交点をintersectionに設定
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            // オブジェクトをplaneに対して平行に移動させる
            draggedObj.position.copy(intersection.sub(offset));
            // オブジェクトの位置を粒子の位置に直す 
            const x1 = sphere1.position.x;
            const y1 = -sphere1.position.y;
            const x2 = sphere2.position.x;
            const y2 = -sphere2.position.y;
            l = Math.sqrt(x1*x1 + y1*y1);
            L = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
            let sign_theta0 = 1;
            if(x1 < 0){
                sign_theta0 = -1;
            }
            theta0 = sign_theta0 * Math.acos(y1/l);
            let sign_phi0 = 1;
            if(x2-x1 < 0){
                sign_phi0 = -1;
            }
            phi0 = sign_phi0 * Math.acos((y2-y1)/L);
            p1.angle = theta0;
            p1.angle_v = 0;
            p2.angle = phi0;
            p2.angle_v = 0;
            calculatePosition();
            scene.remove(line1);
            scene.remove(line2);
            createLines();
        }
    }
    else {
        // オブジェクトをドラッグしないでマウスを動かしている場合
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            if (mouseoveredObj !== intersects[0].object) {
                // マウスオーバー中のオブジェクトを入れ替え
                mouseoveredObj = intersects[0].object;

                // plane.normalにカメラの方向ベクトルを設定
                // 平面の角度をカメラの向きに対して垂直に維持する
                camera.getWorldDirection(plane.normal);
            }
        }
        else {
            mouseoveredObj = null;
        }
    }
}

function onDocumentMouseUp(event) {
    event.preventDefault();

    trackball.enabled = true;

    if (mouseoveredObj) {
        draggedObj = null;
    }
}