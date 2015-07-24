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
var stopFlag = true;
var restartFlag = false;

var line1Flag = false;
var line2Flag = false;

var DirichletFlag = false;
var NeumannFlag = false;
var nonreflectiveFlag = true;

var boxFlag = false;

var pngData;
var pngName;
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
	$('#checkbox_line1').click(function(){
			if($(this).prop('checked') == true){
				line1Flag = true;
			}
			else{
				line1Flag = false;
			}
	});
	$('#checkbox_line2').click(function(){
			if($(this).prop('checked') == true){
				line2Flag = true;
			}
			else{
				line2Flag = false;
			}
	});

	//slider interface
	$('#slider_alpha').slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: alpha,
			slide: function(event, ui){
				var value = ui.value;
				alpha = value;
				document.getElementById("input_alpha").value = value;
			}
	});
	document.getElementById("input_alpha").value = alpha;
	$('#slider_Amp').slider({
			min: 0,
			max: 20,
			step: 1,
			value: Amp,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_Amp").value = value;
			}
	});
	document.getElementById("input_Amp").value = Amp;

	$('#slider_lambda').slider({
			min: 1,
			max: 20,
			step: 1,
			value: _lambda,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_lambda").value = value;
			}
	});
	document.getElementById("input_lambda").value = _lambda;

	$('#slider_space').slider({
			min: 0,
			max: N,
			step: 2,
			value: space,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_space").value = value;
			}
	});
	document.getElementById("input_space").value = space;

	$('#slider_vel').slider({
			min: 1,
			max: 20,
			step: 1,
			value: vel,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_vel").value = value;
			}
	});
	document.getElementById("input_vel").value = vel;
};

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
	camera.position.set(60, -90, 30);
	camera.up.set(0,0,1);
	camera.lookAt({x: 0, y:0, z: -25});

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
	trackball.target = new THREE.Vector3(0, 0, 0);

	trackball.staticMoving = true;

	trackball.dynamicDampingFactor = 0.3;
}

////////////////////////////////////////
// define initLight()
////////////////////////////////////////
//global variables
var directionalLight, //directionalLight object
// 	 splotLight,
// 	 lighthelper,
	 ambientLight; // ambientlighLight object

function initLight(){
	//create directionalLight object
	directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);

	//set directionalLight options
	directionalLight.position.set(-30, -30, 100);

	directionalLight.castShadow = true;

// 	directionalLight.dhadowCameraVisible = true;
	directionalLight.shadowCameraNear = 50;
	directionalLight.shadowCmeraFar = 300;
	//add scene
	scene.add(directionalLight);

	//create spotlLight object
// 	spotLight = new THREE.SpotLight(0xFFFFFF, 1.0, 0, Math.PI/6, 40);
// 	spotLight.position.set(30, 30, 100);
// 	scene.add(spotLight);

// 	lighthelper = new THREE.SpotLightHelper(spotLight,10);
// 	scene.add(lighthelper);

	//create ambientLight object
	ambientLight = new THREE.AmbientLight(0x222222);

	//add scene
	scene.add(ambientLight);
}

////////////////////////////////////////
// define initObject()
////////////////////////////////////////
//global variables
var axis; //axis object

var lattice; //lattice object
//number of object
var N = 80;

var sphere1;
var sphere2;

var box1;
var box2;

var line0;
var line1;
var line2;

/* Wave format */
//edge length
var l = 1;
var Step = 200;

//discreat param
var dx = 0.1;
var dt = 0.001;

//time param
var Time; //period 
var time = 0;
var skip = 3;

//wave param
var lambda = 1.0; //wave length
var _lambda = lambda*(l/dx);
var Amp = 2; //ampritude
var phi = 0; //phase of source2
var vel = 7;
var space = 10;
var box_width = 10;
var x1 = space/2; //position of source1
var x2 = -space/2; //position of source2
// var d = 15;
// var rho = 0.0007;

//rendering speed
var Slow = 0;

//wave
var u;

//wave opacity
var alpha = 1;

//init param
function initWave(){
	Time = lambda / vel;
	var nt = 3;
	u = new Array(nt);
	for(var n = 0; n < nt; n++){
		u[n] = new Array(N + 1);
		for(var i=0; i <= N; i++){
			u[n][i] = new Array(N + 1);
			for(var j=0; j<=N; j++){
				u[n][i][j] = 0;
			}
		}
	}
	//past time wave distribution
// 	u[0][N/2 + space/2][N/2] = Amp * Math.sin(2 * Math.PI * (-dt)/Time);
// 	u[0][N/2 - space/2][N/2] = Amp * Math.sin(2 * Math.PI * (-dt)/Time + phi);
}

//numerical calculation of wave function
function calculate(){
	//source
	for(var i=0; i<=N; i++){
		u[0][0][i] = Amp * Math.sin(2 * Math.PI * (-dt)/Time);
		u[1][0][i] = Amp * Math.sin(2 * Math.PI * time/Time);
	}

	//calculate vartex
	var gamma2 = Math.pow(vel*dt/dx, 2);
	if(boxFlag==false){
		for(var i=1; i <= N-1; i++){
			for(var j=1; j <= N-1; j++){
				if(i>=(N-box_width)/2 && i<=(N+box_width)/2){
					if(j<=(N-space)/2 || j>=(N+space)/2){
						continue;
					}
				}	
				u[2][i][j] = 2*(1-2*gamma2)*u[1][i][j] - u[0][i][j] + gamma2*(u[1][i+1][j]+u[1][i-1][j]+u[1][i][j+1]+u[1][i][j-1]);
			}
		}
	}
	else if(boxFlag==true){
		for(var i=1; i <= N-1; i++){
			for(var j=1; j <= N-1; j++){
				if(i>=(N-box_width)/2 && i<=(N+box_width)/2){
					if(j>=(N-space)/2 && j<=(N+space)/2){
						continue;
					}
				}	
				u[2][i][j] = 2*(1-2*gamma2)*u[1][i][j] - u[0][i][j] + gamma2*(u[1][i+1][j]+u[1][i-1][j]+u[1][i][j+1]+u[1][i][j-1]);
			}
		}
	}
	//Dirichlet condition
	if(DirichletFlag == true){
		for (var i = 0; i <= N; i++) {
			u[2][i][0] = u[2][i][N] = u[2][0][i] = u[2][N][i] = 0.0;
		}
	}
	//Neumann
	else if(NeumannFlag == true){
		for (var i = 1; i <= N - 1; i++) {
			u[2][i][0] = u[2][i][1];
			u[2][i][N] = u[2][i][N - 1];
			u[2][0][i] = u[2][1][i];
			u[2][N][i] = u[2][N - 1][i];
		}
	}
	//nonreflective
	else if(nonreflectiveFlag == true){
		//edge condition
		//around box object
		if(boxFlag == false){
			//Neumann
			for(var i=1; i<(N-box_width)/2; i++){
				u[2][i][0] = u[2][i][1];
				u[2][i][N] = u[2][i][N - 1];
			}
			//nonreflective
			for(var i=(N+box_width)/2; i<N; i++){
				u[2][i][0] = u[2][i][0]+vel*(dt/dx)*(u[1][i][1] - u[1][i][0]);
				u[2][i][N] = u[2][i][N]+vel*(dt/dx)*(u[1][i][N-1] - u[1][i][N]);
			}
			for (var i = 1; i <= N - 1; i++) {
				u[2][N][i] = u[2][N][i]+vel*(dt/dx)*(u[1][N-1][i] - u[1][N][i]);
			}
			for(var i=1; i<(N-space)/2; i++){
				u[2][(N-box_width)/2][i] = u[2][(N-box_width)/2-1][i];
				u[2][(N+box_width)/2][i] = u[2][(N+box_width)/2+1][i];
			}
			for(var i=(N+space)/2+1; i<N; i++){
				u[2][(N-box_width)/2][i] = u[2][(N-box_width)/2-1][i];
				u[2][(N+box_width)/2][i] = u[2][(N+box_width)/2+1][i];
			}
			for(var i=(N-box_width)/2+1; i<(N+box_width)/2; i++){
				u[2][i][(N-space)/2] = u[2][i][(N-space)/2+1];
				u[2][i][(N+space)/2] = u[2][i][(N+space)/2-1];
			}
		}
		else if(boxFlag == true){
			//Neumann
			for(var i=1; i<N; i++){
				u[2][i][0] = u[2][i][1];
				u[2][i][N] = u[2][i][N - 1];
			}
			//nonreflective
			for (var i = 1; i <= N - 1; i++) {
				u[2][N][i] = u[2][N][i]+vel*(dt/dx)*(u[1][N-1][i] - u[1][N][i]);
			}
			for(var i=(N-space)/2+1; i<(N+space)/2; i++){
				u[2][(N-box_width)/2][i] = u[2][(N-box_width)/2-1][i];
				u[2][(N+box_width)/2][i] = u[2][(N+box_width)/2+1][i];
			}
			for(var i=(N-box_width)/2; i<(N+box_width)/2; i++){
				u[2][i][(N-space)/2] = u[2][i][(N-space)/2-1];
				u[2][i][(N+space)/2] = u[2][i][(N+space)/2+1];
			}
		}
	}

	//edge
	u[2][0][0] = (u[2][0][1] + u[2][1][0]) / 2;
	u[2][0][N] = (u[2][0][N - 1] + u[2][1][N]) / 2;
	u[2][N][0] = (u[2][N - 1][0] + u[2][N][1]) / 2;
	u[2][N][N] = (u[2][N - 1][N] + u[2][N][N - 1]) / 2;
	if(boxFlag==false){
		u[2][(N-box_width)/2][0] = (u[2][(N-box_width)/2-1][0] + u[2][(N-box_width)/2][1]) / 2;
		u[2][(N+box_width)/2][0] = (u[2][(N+box_width)/2+1][0] + u[2][(N+box_width)/2][1]) / 2;
		u[2][(N-box_width)/2][N] = (u[2][(N-box_width)/2-1][N] + u[2][(N-box_width)/2][N-1]) / 2;
		u[2][(N+box_width)/2][N] = (u[2][(N+box_width)/2+1][N] + u[2][(N+box_width)/2][N-1]) / 2;
		u[2][(N-box_width)/2][(N-space)/2] = (u[2][(N-box_width)/2+1][(N-space)/2] + u[2][(N-box_width)/2][(N-space)/2-1]) / 2;
		u[2][(N+box_width)/2][(N-space)/2] = (u[2][(N+box_width)/2-1][(N-space)/2] + u[2][(N+box_width)/2][(N-space)/2-1]) / 2;
		u[2][(N-box_width)/2][(N+space)/2] = (u[2][(N-box_width)/2+1][(N+space)/2] + u[2][(N-box_width)/2][(N+space)/2+1]) / 2;
		u[2][(N+box_width)/2][(N+space)/2] = (u[2][(N+box_width)/2-1][(N+space)/2] + u[2][(N+box_width)/2][(N+space)/2+1]) / 2;
	}
	else if(boxFlag==true){
		u[2][(N-box_width)/2][(N-space)/2] = (u[2][(N-box_width)/2+1][(N-space)/2] + u[2][(N-box_width)/2][(N-space)/2+1]) / 2;
		u[2][(N+box_width)/2][(N-space)/2] = (u[2][(N+box_width)/2-1][(N-space)/2] + u[2][(N+box_width)/2][(N-space)/2+1]) / 2;
		u[2][(N-box_width)/2][(N+space)/2] = (u[2][(N-box_width)/2+1][(N+space)/2] + u[2][(N-box_width)/2][(N+space)/2-1]) / 2;
		u[2][(N+box_width)/2][(N+space)/2] = (u[2][(N+box_width)/2-1][(N+space)/2] + u[2][(N+box_width)/2][(N+space)/2-1]) / 2;
	}

	for (var i = 0; i <= N; i++) {
		for (var j = 0; j <= N; j++) {
			u[0][i][j] = u[1][i][j];
			u[1][i][j] = u[2][i][j];
		}
	}
	time += dt;
}

function initObject(){
	//initWave
	initWave();

	//time zero calculation
	calculate();

	//object create
	var geometry = new THREE.Geometry();
	var n=0;
	for(var j=0; j <= N; j++){
		for(var i=0; i <= N; i++){
			var x = (-N/2 + i) * l;
			var y = (-N/2 + j) * l;
			var vertex = new THREE.Vector3(x, y, u[1][i][j]);
			//add vertex
			geometry.vertices[n] = vertex;
			n++;
		}
	}
	for(var j=0; j < N; j++){
		for(var i=0; i < N; i++){
			var face = new THREE.Face3( (N+1)*j+i, (N+1)*j+i+1,  (N+1)*(j+1)+i+1 );
			geometry.faces.push(face);
			face = new THREE.Face3( (N+1)*j+i, (N+1)*(j+1)+i+1, (N+1)*(j+1)+i );
			geometry.faces.push(face);
		}
	}
	//calculate surface normal
	geometry.computeFaceNormals();
	//calculate vertex normal vector
	geometry.computeVertexNormals();

	// 	for(var n=0; n < geometry.faces.length/2; n++){
	// 		for(var i=0; i<N; i++){
	// 			for(var j=0; j<N; j++){
	// 				geometry.faceVertexUvs[0].push([
	// 					new THREE.Vector2(i/N,j+1/N),
	// 					new THREE.Vector2(i+1/N,j+1/N),
	// 					new THREE.Vector2(i+1/N,j/N)
	// 				]);
	// 				geometry.faceVertexUvs[0].push([
	// 					new THREE.Vector2(i/N,j+1/N),
	// 					new THREE.Vector2(i+1/N,j/N),
	// 					new THREE.Vector2(i/N,j/N)
	// 				]);
	// 			}
	// 		}
	// 	}

	//create material
	var material = new THREE.MeshPhongMaterial({
			color: 0xBFFFFF, ambient: 0x000050,
			side: THREE.DoubleSide,
			specular: 0xFFFFFF, shininess: 190, 
			// 		map: THREE.ImageUtils.loadTexture('0014.jpg'),
			transparent: true, opacity: alpha
	});

	//create sphere object
	lattice = new THREE.Mesh(geometry, material);
	scene.add(lattice);
	//create shadow
	lattice.castShadow = true;

	//source object
	geometry = new THREE.SphereGeometry( 2, 20, 20 );
	material = new THREE.MeshLambertMaterial({ color: 0xFF0000, ambient: 0x880000 });

	sphere1 = new THREE.Mesh(geometry, material);
	sphere2 = new THREE.Mesh(geometry, material);
	// 	scene.add(sphere1);
	// 	sphere1.castShadow = true;
	// 	sphere1.position.set(x1, 0, 0);
	// 	scene.add(sphere2);
	// 	sphere2.castShadow = true;
	// 	sphere2.position.set(x2, 0, 0);

	//box object
	if(boxFlag==false){
		var box_length = (l*N-space)/2;
		geometry = new THREE.BoxGeometry(box_width,box_length, 30);
		material = new THREE.MeshLambertMaterial({ color: 0x0088FF, ambient: 0x000088 });

		box1 = new THREE.Mesh(geometry, material);
		box2 = new THREE.Mesh(geometry, material);
		box1.position.set(0, (box_length+space)/2, -5);
		box2.position.set(0, -(box_length+space)/2, -5);
		scene.add(box1);
		scene.add(box2);
	}
	else{
		geometry = new THREE.BoxGeometry(box_width, space, 30);
		material = new THREE.MeshLambertMaterial({ color: 0x0088FF, ambient: 0x000088 });
		box1 = new THREE.Mesh(geometry, material);
		box1.position.set(l/2-dl, l/2-dl, -5)
		scene.add(box1);
	}


	//line object
	// 	DrawLine();

	/*  floar drow  */
	var yuka_n = 10,
		 yuka_w = N*l/10;
	for(var i=-yuka_n/2; i<=yuka_n/2; i++){
		for(var j=-yuka_n/2; j<=yuka_n/2; j++){
			//position
			var x = j*yuka_w;
			var y = i*yuka_w;
			geometry = new THREE.PlaneGeometry(yuka_w, yuka_w);
			if(Math.abs(i+j) % 2 == 0){
				material = new THREE.MeshLambertMaterial({ color: 0x999999, ambient: 0x050505});
			}else{
				material = new THREE.MeshLambertMaterial({ color: 0x4d4d4d, ambient: 0x050505});
			}
			var plane = new THREE.Mesh(geometry, material);
			plane.position.set(x, y, -20);
			plane.receiveShadow = true;
			scene.add(plane);
		}
	}
}


////////////////////////////////////////
// define loop()
////////////////////////////////////////
var step = 0;
var slow = 0;
var png_count = 0;
function loop(){
	//update trackball object
	trackball.update();
	if(restartFlag == true){
		time = 0;
		Amp = parseFloat(document.getElementById("input_Amp").value);
		_lambda = parseFloat(document.getElementById("input_lambda").value);
		space = parseInt(document.getElementById("input_space").value);
		vel = parseInt(document.getElementById("input_vel").value);
		var phaseList =document.getElementsByName("phase"); 
		for(var i=0; i< phaseList.length; i++){
			if(phaseList[i].checked && phaseList[i].value == "s")
				phi = 0;
			else if(phaseList[i].checked && phaseList[i].value == "r")
				phi = Math.PI;
		}
		var boundList =document.getElementsByName("bound"); 
		for(var i=0; i< boundList.length; i++){
			if(boundList[i].checked && boundList[i].value == "Dir"){
				DirichletFlag = true;
				NeumannFlag = false;
				nonreflectiveFlag = false;
			}
			else if(boundList[i].checked && boundList[i].value == "Neu"){
				DirichletFlag = false;
				NeumannFlag = true;
				nonreflectiveFlag = false;
			}
			else if(boundList[i].checked && boundList[i].value == "Non"){
				DirichletFlag = false;
				NeumannFlag = false;
				nonreflectiveFlag = true;
			}
		}
		var ObjList = document.getElementsByName("Obj");
		for(var i=0; i< ObjList.length; i++){
			if(ObjList[i].checked && ObjList[i].value == "Space"){
				boxFlag = false;
			}
			else if(ObjList[i].checked && ObjList[i].value == "Box"){
				boxFlag = true;
			}
		}

		lambda = _lambda*(dx/l);
		x1 = space / 2;
		x2 = -space / 2;

		scene.remove(box1);
		scene.remove(box2);
		if(boxFlag==false){
			var box_length = (l*N-space)/2;
			geometry = new THREE.BoxGeometry(box_width,box_length, 30);
			material = new THREE.MeshLambertMaterial({ color: 0x0088FF, ambient: 0x000088 });

			box1 = new THREE.Mesh(geometry, material);
			box2 = new THREE.Mesh(geometry, material);
			box1.position.set(0, (box_length+space)/2, -5);
			box2.position.set(0, -(box_length+space)/2, -5);
			scene.add(box1);
			scene.add(box2);
		}
		else if(boxFlag==true){
			geometry = new THREE.BoxGeometry(box_width,space, 30);
			material = new THREE.MeshLambertMaterial({ color: 0x0088FF, ambient: 0x000088 });

			box1 = new THREE.Mesh(geometry, material);
			box1.position.set(l/2,l/2,-5);
			scene.add(box1);
		}

		//recalculate
		initWave();
		calculate();

		restartFlag = false;
		stopFlag = false;
		step = 0;
	}

	if(stopFlag == false){

		if(slow < Slow){
			slow++;
		}
		else{
			for(var i=0; i<skip; i++){
				calculate();
				step++;
			}

			var n = 0;
			for(var j=0; j<=N; j++){
				for(var i=0; i<=N; i++){
					var x = (-N/2 + i) * l;
					var y = (-N/2 + j) * l;
					var vertex = new THREE.Vector3(x, y, u[1][i][j]);
					lattice.geometry.vertices[n] = vertex;
					n++;
				}
			}
			sphere1.position.set(x1, 0, u[1][N/2 + space/2][N/2]);
			sphere2.position.set(x2, 0, u[1][N/2 - space/2][N/2]);
			lattice.geometry.verticesNeedUpdate = true;
			lattice.geometry.normalsNeedUpdate = true;
			lattice.geometry.computeFaceNormals();
			lattice.geometry.computeVertexNormals();
			lattice.material.opacity = alpha;
			slow = 0;
		}
	}
	else{
		lattice.geometry.verticesNeedUpdate = false;
		lattice.geometry.normalsNeedUpdate = false;
	}

	//init clear color
	renderer.clear();

	//rendering
	renderer.render(scene, camera);


	if(stopFlag){
		png_count++
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

