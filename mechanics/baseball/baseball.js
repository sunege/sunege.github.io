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
var L = 1.5;
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
var phi0 = pi/6.0;
var theta_v0 = 0;
var phi_v0 = 0;

////////////////////////////////////
//flag parameter
var resetFlag = false; // restert flag
var stopFlag = true; // stop flag
var contourFlag = true;

////////////////////////////////////
//objects array
var objects = [];

////////////////////////////////////
//particle class
var p;
class Particle {
    constructor(radius, mass, x, y, z, v_x, v_y, v_z) {
        this.radius = radius;
        this.mass = mass;
        this.x = x;
        this.y = y;
        this.z = z;
        this.v_x = v_x;
        this.v_y = v_y;
        this.v_z = v_z;
    }
}

Particle.prototype = {
	constructor: Particle
};

////////////////////////////////////
//time development function
//velocity velret method
function timeDevelopment() {
    p1.x = Math.sin(time);
    cylinder.position.set(Math.sin(time), Math.cos(time), 0);
    collision();
}

//judge collision
function collision() {
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
    p1 = new Particle(radius1, mass1,
        0, 0, 0,
        0, 0, 0);
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


    */
	//checkbox interface
	$('#checkbox_contour').click(function(){
			if($(this).prop('checked') == true){
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

	trackball.noRotate = false;
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

//bat
var cylinder;

var line1;

var contour1;
var contour2;

function initObject(){
	//create axis object
	axis = new THREE.AxisHelper(100);
	//add axis object to scene
	scene.add(axis);
	//set axis position
    axis.position.set(0, 0, 0);

    //create sphere object
    createShperes();

    sphere1.position.set(p1.x, p1.y, p1.z);

    //create bat object
    createCylinder();
    cylinder.rotation.set(pi/3.0, pi/6.0, pi/4.0);

    //create line
    createLines();

    //create contour
    createContour();

}

function createShperes() {
    var geometry1 = new THREE.SphereGeometry(p1.radius, 20, 20);
    var material1 = new THREE.MeshLambertMaterial({color: 0x00ff00, ambient: 0x00ff00 });
    sphere1 = new THREE.Mesh(geometry1, material1);
    scene.add(sphere1);
    sphere1.castShadow = true;
    objects.push(sphere1);

}

function createCylinder() {
    var geometry_bat = new THREE.CylinderGeometry(1.0, 1.0, 2.0, 20, 5);
    var material_bat = new THREE.MeshLambertMaterial({color: 0x00ff7f, mabient: 0xff0000});
    cylinder = new THREE.Mesh(geometry_bat, material_bat);
    scene.add(cylinder);
}

function createLines() {
    var geometry_line1 = new THREE.Geometry();
    geometry_line1.vertices.push(new THREE.Vector3(0,0,0));
    geometry_line1.vertices.push(new THREE.Vector3(p1.x, p1.y,0));

    var material_line = new THREE.LineBasicMaterial();


    line1 = new THREE.Line(geometry_line1, material_line);

    scene.add(line1);
}

var contour1_vertices = [];
var contour2_vertices = [];
function createContour() {
    var geometry_contour1 = new THREE.Geometry();
    geometry_contour1.vertices = contour1_vertices;

    var geometry_contour2 = new THREE.Geometry();
    geometry_contour2.vertices = contour2_vertices;

    var material_contour1 = new THREE.LineBasicMaterial({color: 0x99ff00, linewidth: 1});
    var material_contour2 = new THREE.LineBasicMaterial({color: 0xff9900, linewidth: 1});

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
    sphere1.position.set(p1.x, p1.y, p1.z);

    //lines
    scene.remove(line1);
    createLines();

    //contours
    scene.remove(contour1);
    scene.remove(contour2);
    contour1_vertices.push(new THREE.Vector3(p1.x, p1.y, 0));
    createContour();

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
        objects = [];
        scene.remove(line1);
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
var plane = new THREE.Plane();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();

var mouseoveredObj;
var draggedObj;
function mouseEvent() {
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
}

function onDocumentMouseDown(event) {
    var rect = event.target.getBoundingClientRect();
    var mx = event.clientX - rect.left;
    var my = event.clientY - rect.top;

    mx = (mx / renderer.domElement.width) * 2 - 1;
    my = -(my /renderer.domElement.height) * 2 + 1;

    var pos = new THREE.Vector3(mx, my, 1);

    pos.unproject(camera);
    
    pos = pos.sub(camera.position).normalize();
    raycaster = new THREE.Raycaster( camera.position, pos );
    var intersects = raycaster.intersectObjects(objects);


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

    var rect = event.target.getBoundingClientRect();
    var mx = event.clientX - rect.left;
    var my = event.clientY - rect.top;

    mx = (mx / renderer.domElement.width) * 2 - 1;
    my = -(my /renderer.domElement.height) * 2 + 1;

    var pos = new THREE.Vector3(mx, my, 1);

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
            var x1 = sphere1.position.x;
            var y1 = -sphere1.position.y;
            l = Math.sqrt(x1*x1 + y1*y1);
            L = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
            var sign_theta0 = 1;
            if(x1 < 0){
                sign_theta0 = -1;
            }
            theta0 = sign_theta0 * Math.acos(y1/l);
            var sign_phi0 = 1;
            if(x2-x1 < 0){
                sign_phi0 = -1;
            }
            phi0 = sign_phi0 * Math.acos((y2-y1)/L);
            p1.angle = theta0;
            p1.angle_v = 0;
            scene.remove(line1);
            createLines();
        }
    }
    else {
        // オブジェクトをドラッグしないでマウスを動かしている場合
        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            if (mouseoveredObj != intersects[0].object) {
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