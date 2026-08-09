////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
        initEvent();
        threeStart();
        });


////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
let stopFlag = true;
let resetFlag = false;
const N_wave = 10;
const wave_flag = new Array(N_wave + 1);
for(let i=0; i<N_wave + 1; i++){
    wave_flag[i] = true;
}
let pngData;
let pngName;
function initEvent(){
    document.getElementById("startButton").addEventListener("click", function(){
            if(stopFlag){
                stopFlag = false;
            }
            else{
                stopFlag = true;
            }
    });

    document.getElementById("png").addEventListener("click", function(){
            document.getElementById("png").href = pngData;
            document.getElementById("png").download = pngName;
    });

    document.getElementById("resetButton").addEventListener("click", function(){
            resetFlag = true;
    });
    document.getElementById("resetButton").value = "reset";
    /*
    //checkbox
    $('#checkbox_wave1').click(function(){
    if($(this).prop('checked') == true){
    wave1Flag = true;
    }
    else{
    wave1Flag = false;
    }
    });
    $('#checkbox_wave2').click(function(){
    if($(this).prop('checked') == true){
    wave2Flag = true;
    }
    else{
    wave2Flag = false;
    }
    });
    $('#checkbox_wave3').click(function(){
    if($(this).prop('checked') == true){
    wave3Flag = true;
    }
    else{
    wave3Flag = false;
    }
     */
}
/*
//slider interface
$('#slider_direction1').slider({
min: -1,
max: 1,
step: 2,
value: direction1,
slide: function(event, ui){
var value = ui.value;
direction1 = value;
}
});
$('#slider_direction2').slider({
min: -1,
max: 1,
step: 2,
value: direction2,
slide: function(event, ui){
var value = ui.value;
direction2 = value;
}
});
$('#slider_amp1').slider({
min: 0,
max: 5,
step: 0.1,
value: amp1,
slide: function(event, ui){
var value = ui.value;
amp1 = value;
document.getElementById("input_amp1").value = value;
}
});
document.getElementById("input_amp1").value = amp1;

$('#slider_lambda1').slider({
min: 0.01,
max: 5,
step: 0.01,
value: lambda1,
slide: function(event, ui){
var value = ui.value;
lambda1 = value;
document.getElementById("input_lambda1").value = value;
freq1 = vel/lambda1;
document.getElementById("input_freq1").value = freq1;
$("#slider_freq1").slider("value", freq1);
}
});
document.getElementById("input_lambda1").value = lambda1;

$('#slider_freq1').slider({
min: 1,
max: 30,
step: 0.1,
value: freq1,
slide: function(event, ui){
var value = ui.value;
freq1 = value;
document.getElementById("input_freq1").value = value;
lambda1 = vel/freq1;
document.getElementById("input_lambda1").value = lambda1;
$('#slider_lambda1').slider("value", lambda1);
}
});
document.getElementById("input_freq1").value = freq1;

$('#slider_vel').slider({
min: 0,
max: 10,
step: 0.1,
    value: vel,
    slide: function(event, ui){
        var value = ui.value;
        vel = value;
        document.getElementById("input_vel").value = value;
    }
});
document.getElementById("input_vel").value = vel;

$('#slider_amp2').slider({
min: 0,
max: 5,
step: 0.1,
value: amp2,
slide: function(event, ui){
var value = ui.value;
amp2 = value;
document.getElementById("input_amp2").value = value;
}
});
document.getElementById("input_amp2").value = amp2;

// 	$('#slider_lambda2').slider({
// 			min: 0.01,
// 			max: 20,
// 			step: 0.01,
// 			value: lambda2,
// 			slide: function(event, ui){
// 				var value = ui.value;
// 				lambda2 = value;
// 				document.getElementById("input_lambda2").value = value;
// 			}
// 	});
// 	document.getElementById("input_lambda2").value = lambda2;
$('#slider_lambda2').slider({
min: 0.01,
max: 5,
step: 0.01,
value: lambda2,
slide: function(event, ui){
var value = ui.value;
lambda2 = value;
document.getElementById("input_lambda2").value = value;
freq2 = vel/lambda2;
document.getElementById("input_freq2").value = freq2;
$("#slider_freq2").slider("value", freq2);
}
});
document.getElementById("input_lambda2").value = lambda2;

$('#slider_freq2').slider({
min: 1,
max: 30,
step: 0.1,
value: freq2,
slide: function(event, ui){
var value = ui.value;
freq2 = value;
document.getElementById("input_freq2").value = value;
lambda2 = vel/freq2;
document.getElementById("input_lambda2").value = lambda2;
$('#slider_lambda2').slider("value", lambda2);
}
});
document.getElementById("input_freq2").value = freq2;

};
*/
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
    camera.position.set(l/2, 0, 10);
    camera.up.set(0,1,0);
    camera.lookAt({x: l/2, y:0, z: 0});

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
    trackball.target = new THREE.Vector3(l/2, 0, 0);

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
    directionalLight.position.set(30, 30, 100);

    directionalLight.castShadow = true;

    //add scene
    scene.add(directionalLight);

    //create ambientLight object
    ambientLight = new THREE.AmbientLight(0x222222);

    //add scene
    scene.add(ambientLight);
}

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
const line = new Array(N_wave + 1); //wave line object

//number of object
const N_point = 800;

/* Wave format */
//wave
const u = new Array(N_wave + 1);

const lambda = new Array(N_wave);
const freq = new Array(N_wave);
const amp = new Array(N_wave);
const phase = new Array(N_wave);
const direction = new Array(N_wave);


//length param
const l = 10;
const dx = l/N_point;

//time param
const Step = 300;
const Time = 1;
const dt = Time / Step;
let time = 0;

//wave param
const vel = 10;

//grid
let grid;
const grid_diff = 0.5; //グリッドの間隔
const num_grid_x = 21; //x方向の本数 奇数を入力
const num_grid_y = parseInt(l/grid_diff + 1); //y方向の本数


function initObject(){
    let gridGeometry, gridMaterial, v1, v2;
    for(let i = 0; i < N_wave + 1; i++){
        u[i] = new Array(N_point + 1);
        for(let j = 0; j < N_point + 1; j++){
            u[i][j] = 0;
        }
    }
    for(let i=0; i<N_wave; i++){
        lambda[i] = 2*l/(2*i);
        freq[i] = vel / lambda[i];
//         amp[i] = 1 * Math.exp(-i);
        amp[i] = 1.0;
//         direction[i] = Math.pow(-1,i);
        direction[i] = 1;
        phase[i] = 2 * Math.PI / 2.0;
    }
    //calculate wave and create wave
    calculate();
    console.log(wave_flag);
    for(let i = 0; i < N_wave + 1; i++) {
        scene.add(line[i]);
    }

    //create grid
    grid = new Array(num_grid_x + num_grid_y);
    //pallarel x axial
    for(let i=0; i<num_grid_x; i++){
        gridGeometry = new THREE.Geometry();
        const y = (i-(num_grid_x - 1) / 2) * grid_diff;
        v1 = new THREE.Vector3(0, y, -0.05);  
        v2 = new THREE.Vector3(l, y, -0.05);  
        gridGeometry.vertices.push(v1);
        gridGeometry.vertices.push(v2);
        if(i===(num_grid_x - 1) / 2){
            gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 2});
        }
        else{
            gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 1});
        }
        grid[i] = new THREE.Line(gridGeometry, gridMaterial);
        scene.add(grid[i]);
    }
    //pallarel y axial
    for(let i=0; i<num_grid_y; i++){
        gridGeometry = new THREE.Geometry();
        const x = i * grid_diff
            v1 = new THREE.Vector3(x, (-1)*((num_grid_x - 1) / 2) * grid_diff, -0.05);  
        v2 = new THREE.Vector3(x, ((num_grid_x - 1) / 2) * grid_diff, -0.05);  
        gridGeometry.vertices.push(v1);
        gridGeometry.vertices.push(v2);
        gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF ,linewidth: 1});
        grid[i + num_grid_x] = new THREE.Line(gridGeometry, gridMaterial);
        scene.add(grid[i + num_grid_x]);
    }

}
function calculate(){
    let k, lineMaterial;
    for(let i = 0; i < N_wave + 1; i++){
        let n=0;
        const geometry = new THREE.Geometry();
        for(let j=0; j<=N_point; j++){
            const x = j*dx;
            if(i !== N_wave){
                const omega = 2*Math.PI*vel/lambda[i];
                k = 2*Math.PI/lambda[i];
                u[i][j] = amp[i] * (Math.sin(omega*time - direction[i]*k*x + phase[i]) + Math.sin(omega*time + direction[i]*k*x));
            }
            else{
                let sum = 0;
                for(k = 0; k < N_wave; k++){
                    sum += u[k][j];
                }
                u[i][j] = sum;
            }
            const vertex = new THREE.Vector3(x, u[i][j], 0);

            //add vertex
            geometry.vertices[n] = vertex;
            n++;
        }
        if(i !== N_wave){
            lineMaterial = new THREE.LineBasicMaterial({ color: 0xDD9944 ,linewidth: 4});
        }
        else{
            lineMaterial = new THREE.LineBasicMaterial({ color: 0x99ff00 ,linewidth: 4});
        }
        line[i] = new THREE.Line(geometry, lineMaterial);
    }
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
let step = 0;
let png_count = 0;
function loop(){
    //update trackball object
    trackball.update();

    //reset
    if(resetFlag === true){
        time = 0;
        png_count = 0;
        /*
        //wave1
        lambda1 = 2; //wave length
        amp1 = 1; //ampritude
        direction1 = 1; //wave direction right:-1
        document.getElementById("input_amp1").value = amp1;
        $('#slider_amp1').slider("value", amp1);
        document.getElementById("input_lambda1").value = lambda1;
        $('#slider_lambda1').slider("value", lambda1);
        document.getElementById("input_freq1").value = vel/lambda1;
        $('#slider_freq1').slider("value", vel/lambda1);
        document.getElementById("slider_direction1").value = direction1;
        $('#slider_direction1').slider("value", direction1);

        //wave2
        lambda2 = 2; //wave length
        amp2 = 1; //ampritude
        direction2 = -1; //wave direction left:1
        // 		document.getElementById("input_amp2").value = amp2;
        // 		document.getElementById("slider_amp2").value = amp2;
        // 		document.getElementById("input_lambda2").value = lambda2;
        // 		document.getElementById("slider_lambda2").value = lambda2;
        // 		document.getElementById("slider_direction2").value = direction2;

        document.getElementById("input_amp2").value = amp2;
        $('#slider_amp2').slider("value", amp2);
        document.getElementById("input_lambda2").value = lambda2;
        $('#slider_lambda2').slider("value", lambda2);
        document.getElementById("input_freq2").value = vel/lambda2;
        $('#slider_freq2').slider("value", vel/lambda2);
        document.getElementById("slider_direction2").value = direction2;
        $('#slider_direction2').slider("value", direction2);
         */

        resetFlag = false;
    }

    for(let i = 0; i < N_wave + 1; i++){
        scene.remove(line[i]);
    }

    if(stopFlag === false){
        step++;
        time += dt;
    }
    calculate();

    for(let i = 0; i < N_wave + 1; i++){
        if(wave_flag[i]){
            scene.add(line[i]);
        }
    }

    //init clear color
    renderer.clear();

    //rendering
    renderer.render(scene, camera);

    if(stopFlag){
        png_count++;
        if(png_count > 30){
            document.getElementById("startButton").value = "start";
            pngData = renderer.domElement.toDataURL("image/png");
            pngName = "png_"+step%Step+".png";
            png_count = 0;
        }
    }
    else{
        document.getElementById("startButton").value = "stop";
    }

    //call loop function
    requestAnimationFrame(loop);
}
