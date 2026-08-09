////////////////////
//                //
// fcc crystal    //
//                //
////////////////////

//System Parameter
// 暗黙のグローバルだった変数（strictモードのクラス内から代入されるため明示宣言）
import { initThree, initLight } from '../../js/common/three-setup.js';
import { quadGeometry } from '../../js/common/geometry.js';

let wall2, wall3, wall4, wall5, wall6;

let N = 14;
let RADIUS = 5;
const L = 2 * Math.sqrt(2) * RADIUS;


let restartFlag = false;
//particle class
class Particle {
	constructor(parameter){
	    //index
	    this.index = parameter.index;
	    //radius
	    this.radius = parameter.radius;
	
	    //position
	    this.x = 0;
	    this.y = 0;
	    this.z = 0;
	}
}

//particle object
const p = [];

////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
        for(let i=0; i<N; i++){
            p[i] = new Particle({index: i, radius: RADIUS});
            p[i].x = 0;
            p[i].y = 0;
            p[i].z = 0;
        }

        p[1].x = L;

        p[2].y = L;

        p[3].x = L;
        p[3].y = L;

        p[4].x = L/2;
        p[4].y = L/2;

        p[5].x = L/2;
        p[5].z = L/2;

        p[6].y = L/2;
        p[6].z = L/2;

        p[7].x = L/2;
        p[7].y = L;
        p[7].z = L/2;

        p[8].x = L;
        p[8].y = L/2;
        p[8].z = L/2;

        p[9].z = L;

        p[10].x = L;
        p[10].z = L;

        p[11].y = L;
        p[11].z = L;

        p[12].x = L;
        p[12].y = L;
        p[12].z = L;

        p[13].x = L/2;
        p[13].y = L/2;
        p[13].z = L;


        /*
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
        */
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
                const value = ui.value;
                document.getElementById("input_radius").value = value;
            }
    });
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
    camera.position.set(L*4,L*2,L*1.5);
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
    let geometry, material;
    //create axis object
    axis = new THREE.AxisHelper(100);
    //add axis object to scene
    scene.add(axis);
    //set axis position
    axis.position.set(0, 0, 0);

    sphere = [];
    for(let i=0; i<N; i++){
        //create geometry
        geometry = new THREE.SphereGeometry(p[i].radius, 40, 40);
        material = new THREE.MeshLambertMaterial({color: 0xffffff, ambient: 0xffffff });



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
    material = new THREE.MeshPhongMaterial({color: 0xFF0000, wireframe: true});
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);
    box.position.set(L/2, L/2, L/2);

}

function wall(v1, v2, v3, v4){
    const geometry = quadGeometry([v1, v2, v3, v4]);

    //create material
    const material = new THREE.MeshLambertMaterial({color: 0xaaaabb, ambient: 0x555577 });
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
        RADIUS = parseFloat(document.getElementById("input_radius").value);
        N = parseFloat(document.getElementById("input_N").value);
        //init particle and calculation class
        for(let i=0; i<N; i++){
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

