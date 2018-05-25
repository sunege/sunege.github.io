////////////////////
//                //
// bcc crystal    //
//                //
////////////////////

//System Parameter
var N = 2;
var RADIUS = 5;
var L = RADIUS * 3.95 / Math.sqrt(3);


var restartFlag = false;
//particle class
var Particle = function(parameter){
    //index
    this.index = parameter.index;
    //radius
    this.radius = parameter.radius;

    //position
    this.x = 0;
    this.y = 0;
    this.z = 0;
};

Particle.prototype = {
    constructor: Particle
};

//particle object
var p = [];

////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
        for(var i=0; i<N*N*N*2; i++){
            p[i] = new Particle({index: i, radius: RADIUS});
        }
        for(var i=0; i<N*2; i++){
            for(var j=0; j<N; j++){
                for(var k=0; k<N; k++){
                    if(i%2 == 0){
                        p[i*N*N + j*N + k].x = L * k;
                        p[i*N*N + j*N + k].y = L * j;
                    }
                    else if(i%2 == 1){
                        p[i*N*N + j*N + k].x = L * k + L / 2;
                        p[i*N*N + j*N + k].y = L * j + L / 2;
                    }
                    p[i*N*N + j*N + k].z = L * i / 2;
                }
            }
        }
        initEvent();
        threeStart();
});

////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
function initEvent(){

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
    //input interface
    document.getElementById("input_radius").value = RADIUS;
    document.getElementById("input_N").value = N;

    //button interface
    document.getElementById("startButton").addEventListener("click", function(){
            restartFlag = true;
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
    camera.position.set(L*N*4,L*N*2,L*N*1.5);
    camera.up.set(0,0,1);
    camera.lookAt({x: L*N/2, y:L*N/2, z: L*N/2});

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
    trackball.target = new THREE.Vector3(L*N/2, L*N/2, L*N/2);

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
    //create axis object
    axis = new THREE.AxisHelper(100);
    //add axis object to scene
    scene.add(axis);
    //set axis position
    axis.position.set(0, 0, 0);

    sphere = [];
    for(var i=0; i<N*N*N*2; i++){
        //create geometry
        var geometry = new THREE.SphereGeometry(p[i].radius, 8, 8);
        var material = new THREE.MeshLambertMaterial({color: 0xffffff, ambient: 0xffffff });



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
        RADIUS = parseFloat(document.getElementById("input_radius").value);
        N = parseFloat(document.getElementById("input_N").value);
        //init particle and calculation class
        for(var i=0; i<N; i++){
            p[i] = new Particle({index: i, radius: RADIUS});
        }
        initObject();
        restartFlag = false;

        document.getElementById("startButton").value = "Restart";
    }


    //init clear color
    renderer.clear();


    //rendering
    renderer.render(scene, camera);

    //remove line
    // 	scene.remove(line);

    //call loop function
    requestAnimationFrame(loop);
}

