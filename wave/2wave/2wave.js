////////////////////////////////////////
// define window event 
////////////////////////////////////////
import * as THREE from 'three';
import { TrackballControls } from '../../js/vendor/three/controls/TrackballControls.js';
import { initThree, initLight, applyLegacyAmbient } from '../../js/common/three-setup.js';
import { gridGeometry, fillGrid, lineGeometry } from '../../js/common/geometry.js';
import { slider, checkbox } from '../../js/common/ui.js';

window.addEventListener("load", function(){
		initEvent();
		threeStart();
});


////////////////////////////////////////
// define initEvent()
////////////////////////////////////////
let stopFlag = true;
let restartFlag = false;
let line1Flag = false;
let line2Flag = false;
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

	document.getElementById("restartButton").addEventListener("click", function(){
			restartFlag = true;
	});
	document.getElementById("restartButton").value = "restart";

	//checkbox
	checkbox('checkbox_line1', (checked) => {
			if(checked){
				line1Flag = true;
			}
			else{
				line1Flag = false;
			}
	});
	checkbox('checkbox_line2', (checked) => {
			if(checked){
				line2Flag = true;
			}
			else{
				line2Flag = false;
			}
	});

	//slider interface
	slider('slider_Amp', {
			min: 0,
			max: 5,
			step: 0.1,
			value: Amp,
			onInput: (value) => {
				document.getElementById("input_Amp").value = value;
			}
	});
	document.getElementById("input_Amp").value = Amp;

	slider('slider_lambda', {
			min: 1,
			max: 20,
			step: 1,
			value: lambda,
			onInput: (value) => {
				document.getElementById("input_lambda").value = value;
			}
	});
	document.getElementById("input_lambda").value = lambda;

	slider('slider_space', {
			min: 2,
			max: 80,
			step: 2,
			value: space,
			onInput: (value) => {
				document.getElementById("input_space").value = value;
			}
	});
	document.getElementById("input_space").value = space;
};

////////////////////////////////////////
// define threeStart()
////////////////////////////////////////
function threeStart(){
	({ renderer, scene, canvasFrame } = initThree());
	initCamera();
	initLight(scene, { positions: [[30, 30, 100]], ambient: 0x222222 });
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
	camera.position.set(0, 0, 120);
	camera.up.set(0,1,0);
	camera.lookAt(0, 0, 0);

	//create trackball object
	trackball = new TrackballControls(camera, canvasFrame);

	trackball.noRotate = false;
	trackball.rotateSpeed = 2.0;

	trackball.noZoom = false;
	trackball.zoomSpeed = 0.5;

	trackball.noPan = false;
	trackball.panSpeed = 0.6;
	trackball.target = new THREE.Vector3(0, 0, 0);

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
let axis; //axis object

let lattice; //lattice object
//number of object
const N = 80;

let sphere1;
let sphere2;

let line0;
let line1;
let line2;

/* Wave format */
//edge length
const l = 1;
const Step = 200;

//time param
const Time = 0.5;
const dt = Time / Step;
let time = 0;

//wave param
let lambda = 10; //wave length
let Amp = 1.5; //ampritude
let phi = 0; //phase of source2
let space = 20;
let x1 = space/2; //position of source1
let x2 = -space/2; //position of source2

//rendering speed
const Slow = 0;

//conservation z
const f = new Array(Step);

function initObject(){
	let geometry, x, y;
	//create axis object
// 	axis = new THREE.AxesHelper(100);
	//add axis object to scene
// 	scene.add(axis);
	//set axis position
// 	axis.position.set(0, 0, 0.3);

	x1 = space/2; //position of source1
	x2 = -space/2; //position of source2

	for(let step=0; step < Step; step++){
		f[step] = new Array(N + 1);

		for(let i=0; i <= N; i++){
			f[step][i] = new Array(N + 1);
			for(let j=0; j <= N; j++){
				//calculate vartex
				x = (-N/2 + i) * l;
				y = (-N/2 + j) * l;
				const z = Amp * (Math.sin(2 * Math.PI * ((time/Time) - (Math.sqrt(Math.pow((x-x1),2) + y*y)/lambda))) + Math.sin(2 * Math.PI * ((time/Time) - Math.sqrt(Math.pow((x-x2),2) + y*y)/lambda) + phi) );
				f[step][i][j] = z;
			}
		}
		time += dt;
	}
	//add vertices and calculate vertex normal vector
	geometry = gridGeometry(N);
	fillGrid(geometry, N, (i, j) => [(-N/2 + i) * l, (-N/2 + j) * l, f[0][i][j]]);

	//create material
	let material = applyLegacyAmbient(new THREE.MeshPhongMaterial({ color: 0x88DDFF,
			side: THREE.DoubleSide, specular: 0xFFFFFF, shininess: 250 }), 0x000000);

	//create sphere object
	lattice = new THREE.Mesh(geometry, material);
	scene.add(lattice);
	//create shadow
	lattice.castShadow = true;

	//source object
	geometry = new THREE.SphereGeometry( lambda / 3, 20, 20 );
	material = applyLegacyAmbient(new THREE.MeshLambertMaterial({ color: 0xFF0000}), 0x880000);

	sphere1 = new THREE.Mesh(geometry, material);
	sphere2 = new THREE.Mesh(geometry, material);
	scene.add(sphere1);
	sphere1.castShadow = true;
	sphere1.position.set(x1, 0, 0);
	scene.add(sphere2);
	sphere2.castShadow = true;
	sphere2.position.set(x2, 0, 0);


	//line object
	DrawLine();

}

///////////////////
// DrawLine
///////////////////
function DrawLine(){
	let a2, c2, line1Points, line2Points, vertex, x, y;
	const z_line = 0.10; //line position z
	let m1 = 0;
	let flag1 = false;
	for(let i=0; m1*lambda/2 <= space/2; i++){
		m1++;
		if(m1*lambda/2 === space/2)
			flag1 = true;

	}
	line1 = new Array(2*m1-1)
	let num = 0;

	const line1Material = new THREE.LineBasicMaterial({ color: 0xFF0000 ,linewidth: 4});
	for(let n=0; n<m1; n++){
		line1Points = [];
		a2 = Math.pow(n*lambda/2, 2);
		c2 = Math.pow(space/2, 2);

		if(flag1 === true  && n === m1-1){
			vertex = new THREE.Vector3(space/2, 0, z_line);
			line1Points.push(vertex);
			vertex = new THREE.Vector3(N/2, 0, z_line);
			line1Points.push(vertex);
			line1[num] = new THREE.Line(lineGeometry(line1Points), line1Material);
			scene.add(line1[num]);
			num++;
			line1Points = [];
			vertex = new THREE.Vector3(-space/2, 0, z_line);
			line1Points.push(vertex);
			vertex = new THREE.Vector3(-N/2, 0, z_line);
			line1Points.push(vertex);
			line1[num] = new THREE.Line(lineGeometry(line1Points), line1Material);
			scene.add(line1[num]);
			num++;

		}
		for(let j=0; j<=N; j++){
			y = (-N/2 + j) * l;
			if(n===0){
				x = 0;
			}
			else{
				x = Math.sqrt(a2*(1+y*y/(c2-a2)));
			}
			vertex = new THREE.Vector3(x, y, z_line);
			line1Points.push(vertex);
		}
		line1[num] = new THREE.Line(lineGeometry(line1Points), line1Material);
		scene.add(line1[num]);
		num++;
		if(n !== 0){
			line1Points = [];
			for(let j=0; j<=N; j++){
				y = (-N/2 + j) * l;
				if(n===0){
					x = 0;
				}
				else{
					x = -Math.sqrt(a2*(1+y*y/(c2-a2)));
				}
				vertex = new THREE.Vector3(x, y, z_line);
				line1Points.push(vertex);
			}
			line1[num] = new THREE.Line(lineGeometry(line1Points), line1Material);
			scene.add(line1[num]);
			num++;
		}
	}

	let m2 = 0;
	let flag2 = false;
	for(let i=0; (m2+1/2)*lambda/2 <= space/2; i++){
		m2++;
		if((m2+1/2)*lambda/2 === space/2)
			flag2 = true;
	}
	line2 = new Array(2*m2);
	num = 0;

	const line2Material = new THREE.LineBasicMaterial({ color: 0x0000FF, linewidth: 4 });
	for(let n=0; n<m2; n++){
		line2Points = [];
		a2 = Math.pow((n+1/2)*lambda/2, 2);
		c2 = Math.pow(space/2, 2);

		if(flag2 === true  && n === m2-1){
			vertex = new THREE.Vector3(space/2, 0, z_line);
			line2Points.push(vertex);
			vertex = new THREE.Vector3(N/2, 0, z_line);
			line2Points.push(vertex);
			line2[num] = new THREE.Line(lineGeometry(line2Points), line2Material);
			scene.add(line2[num]);
			num++;
			line2Points = [];
			vertex = new THREE.Vector3(-space/2, 0, z_line);
			line2Points.push(vertex);
			vertex = new THREE.Vector3(-N/2, 0, z_line);
			line2Points.push(vertex);
			line2[num] = new THREE.Line(lineGeometry(line2Points), line2Material);
			scene.add(line2[num]);
			num++;
		}
		for(let j=0; j<=N; j++){
			y = (-N/2 + j) * l;
			x = Math.sqrt(a2*(1+y*y/(c2-a2)));
			vertex = new THREE.Vector3(x, y, z_line);
			line2Points.push(vertex);
		}
		line2[num] = new THREE.Line(lineGeometry(line2Points), line2Material);
		scene.add(line2[num]);
		num++;
		line2Points = [];
		for(let j=0; j<=N; j++){
			y = (-N/2 + j) * l;
			x = -Math.sqrt(a2*(1+y*y/(c2-a2)));
			vertex = new THREE.Vector3(x, y, z_line);
			line2Points.push(vertex);
		}
		line2[num] = new THREE.Line(lineGeometry(line2Points), line2Material);
		scene.add(line2[num]);
		num++;
	}
}

////////////////////////////////////////
// define loop()
////////////////////////////////////////
let step = 0;
let slow = 0;
function loop(){
	let n, x, y;
	//update trackball object
	trackball.update();
	if(restartFlag === true){
		time = 0;
		Amp = parseFloat(document.getElementById("input_Amp").value);
		lambda = parseInt(document.getElementById("input_lambda").value);
		space = parseInt(document.getElementById("input_space").value);
		const phaseList =document.getElementsByName("phase"); 
		for(let i=0; i< phaseList.length; i++){
			if(phaseList[i].checked && phaseList[i].value === "s")
				phi = 0;
			else if(phaseList[i].checked && phaseList[i].value === "r")
				phi = Math.PI;
		}
		x1 = space / 2;
		x2 = -space / 2;
		for(n=0; n < Step; n++){
			for(let i=0; i <= N; i++){
				for(let j=0; j <= N; j++){
					//calculate vartex
					x = (-N/2 + i) * l;
					y = (-N/2 + j) * l;
					const z = Amp * (Math.sin(2 * Math.PI * ((time/Time) - (Math.sqrt(Math.pow((x-x1),2) + y*y)/lambda))) + Math.sin(2 * Math.PI * ((time/Time) - Math.sqrt(Math.pow((x-x2),2) + y*y)/lambda) + phi) );
					f[n][i][j] = z;
				}
			}
			time += dt;
		}
		for(let i=0; i<line1.length; i++){
			scene.remove(line1[i]);
		}
		for(let i=0; i<line2.length; i++){
			scene.remove(line2[i]);
		}
		DrawLine();
		restartFlag = false;
		stopFlag = false;
		step = 0;
	}

		if(stopFlag === false){

			if(slow < Slow){
				slow++;
			}
			else{

				step++;
				fillGrid(lattice.geometry, N, (i, j) => [(-N/2 + i) * l, (-N/2 + j) * l, f[step%Step][i][j]]);
				sphere1.position.set(x1, 0, Amp*Math.sin(2*Math.PI*time/Time));
				sphere2.position.set(x2, 0, Amp*Math.sin(2*Math.PI*time/Time + phi));
// 				sphere2.position.set(x2, 0, f[step%Step][N/2 - space/2][N/2]);
				time += dt;
				slow = 0;
			}
		}

		if(line1Flag === false){
			for(let i=0; i<line1.length; i++){
				scene.remove(line1[i]);
			}
		}
		else{
			for(let i=0; i<line1.length; i++){
				scene.add(line1[i]);
			}
		}


		if(line2Flag === false){
			for(let i=0; i<line2.length; i++){
				scene.remove(line2[i]);
			}
		}
		else{
			for(let i=0; i<line2.length; i++){
				scene.add(line2[i]);
			}
		}
		//init clear color
		renderer.clear();

		//rendering
		renderer.render(scene, camera);

		if(stopFlag){
			document.getElementById("startButton").value = "start";
			pngData = renderer.domElement.toDataURL("image/png");
			pngName = "png_"+step%Step+".png";
		}
		else{
			document.getElementById("startButton").value = "stop";
		}

		//call loop function
		requestAnimationFrame(loop);
	}

