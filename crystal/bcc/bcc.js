////////////////////
//                //
// bcc crystal    //
//                //
////////////////////

//System Parameter
// 暗黙のグローバルだった変数（strictモードのクラス内から代入されるため明示宣言）
let wall2, wall3, wall4, wall5, wall6;

let N = 9;
let RADIUS = 5;
const L = RADIUS * 3.95 / Math.sqrt(3);


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
        p[4].z = L/2;
        
        p[5].z = L;
        
        p[6].x = L;
        p[6].z = L;

        p[7].y = L;
        p[7].z = L;

        p[8].x = L;
        p[8].y = L;
        p[8].z = L;

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
    initThree();
    initCamera();
    initLight();
    initObject();
    loop();
}

/*  init Three functions  */

//global variables
let renderer, // renderer object
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
    const material = new THREE.MeshLambertMaterial({color: 0xaaaabb, ambient: 0x555577 });
    //create sphere object
    return new THREE.Mesh(geometry, material);
}

// 1/8 sphere test
function test(R, N1, N2){
    const d = new Array(N1 + 1);  
    const r = new Array(N1 + 1);
    const theta = new Array(N2 + 1);
    for(let i=0; i<N1; i++){
        d[i] = i*(R/N1);
        r[i] = Math.sqrt(R*R - d[i]*d[i]);
    }
    d[N1] = R;
    r[N1] = 0;
    for(let i=0; i<N2; i++){
        theta[i] = i*Math.PI/(2*N2);
    }
    theta[N2] = Math.PI/2;
    const x = new Array(N1+1);
    const y = new Array(N1+1);
    const z = new Array(N1+1);
    const vertex = new Array(N1+1);
    for(let n=0; n<N1+1; n++){
        x[n] = new Array(N2+1);
        y[n] = new Array(N2+1);
        z[n] = new Array(N2+1);
        vertex[n] = new Array(N2+1);
    }
    for(let n=0; n<N1+1; n++){
        for(let i=0; i<N2+1; i++){
            x[n][i] = r[n]*Math.cos(theta[i]);
            y[n][i] = r[n]*Math.sin(theta[i]);
            z[n][i] = d[n];
            vartex[n][i] = new THREE.Vector3(x[n][i], y[n][i], z[n][i]);
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

