////////////////////////////////////////
// define window event 
////////////////////////////////////////
window.addEventListener("load", function(){
		initThree();
		initEvent();
		initCamera();
		initLight();
		initObject();
		loop();
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

var pngData;
var pngName;
function initEvent(){

	mouseEvent();

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

	$('#slider_amp').slider({
			min: 1,
			max: 100,
			step: 1,
			value: amp,
			slide: function(event, ui){
				var value = ui.value;
				amp = value;
				document.getElementById("input_amp").value = value;
			}
	});
	document.getElementById("input_amp").value = amp;

	$('#slider_sigma').slider({
			min: 1,
			max: 40,
			step: 1,
			value: sigma,
			slide: function(event, ui){
				var value = ui.value;
				sigma = value;
				document.getElementById("input_sigma").value = value;
			}
	});
	document.getElementById("input_sigma").value = sigma;

	//$('#slider_lambda').slider({
			//min: 1,
			//max: 20,
			//step: 1,
			//value: _lambda,
			//slide: function(event, ui){
				//var value = ui.value;
				//document.getElementById("input_lambda").value = value;
			//}
	//});
	//document.getElementById("input_lambda").value = _lambda;

	//$('#slider_space').slider({
			//min: 0,
			//max: N,
			//step: 2,
			//value: space,
			//slide: function(event, ui){
				//var value = ui.value;
				//document.getElementById("input_space").value = value;
			//}
	//});
	//document.getElementById("input_space").value = space;

	$('#slider_vel').slider({
			min: 1,
			max: 50,
			step: 1,
			value: vel,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_vel").value = value;
			}
	});
	document.getElementById("input_vel").value = vel;
};

function mouseEvent(){
	canvasFrame.addEventListener('mousedown', onDocumentMouseDown, false );
	function onDocumentMouseDown( event ){
		var rect = event.target.getBoundingClientRect();
		var mx = event.clientX - rect.left;
		var my = event.clientY - rect.top;

		mx = (mx / renderer.domElement.width) * 2 - 1;
		my = -(my /renderer.domElement.height) * 2 + 1;

// 		var mx = (event.clientX / canvasFrame.clientWidth) * 2 - 1;
// 		var my = -(event.clientY / canvasFrame.clientHeight) * 2 + 1;
		var pos = new THREE.Vector3(mx, my, 1);

		pos.unproject(camera);
		
		pos = pos.sub(camera.position).normalize();
		var ray = new THREE.Raycaster( camera.position, pos );
		var objs = ray.intersectObjects(targetLists);

		if(objs.length > 0){
			for(var n = 0; n < 3; n++){
				for(var i=0; i <= N; i++){
					for(var j=0; j<=N; j++){
						var x = (-N/2 + i) * l;
						var y = (-N/2 + j) * l;
						u[n][i][j] += gaussian(x,y,objs[0].point.x,objs[0].point.y,amp,sigma);
					}
				}
			}
		}

	}
};

////////////////////////////////////////
// define threeStart()
////////////////////////////////////////
function threeStart(){
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
	camera.position.set(60, -90, 90);
	camera.up.set(0,0,1);
	camera.lookAt({x: 0, y:0, z: 0});

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
	directionalLight.position.set(10, -10, 100);

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

//var sphere1;
//var sphere2;

//var line0;
//var line1;
//var line2;

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
//var lambda = 1.0; //wave length
//var _lambda = lambda*(l/dx);
//var Amp = 11; //ampritude
//var phi = 0; //phase of source2
var vel = 15;
var amp = 4;
var sigma = 3;
//var space = 20;
//var x1 = space/2; //position of source1
//var x2 = -space/2; //position of source2
// var d = 15;
// var rho = 0.0007;

//rendering speed
var Slow = 0;

//wave
var u;

//wave opacity
var alpha = 1;

//click object lists
var targetLists = new Array();

//init param
function initWave(){
	var x0 = -20;
	var y0 = -20;
	//Time = lambda / vel;
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
// 	for(var n = 0; n < nt; n++){
// 		for(var i=0; i <= N; i++){
// 			for(var j=0; j<=N; j++){
// 				var x = (-N/2 + i) * l;
// 				var y = (-N/2 + j) * l;
// 				u[n][i][j] = gaussian(x,y,x0,y0,amp,sigma);
// 			}
// 		}
// 	}
	//past time wave distribution
	//u[0][N/2 + space/2][N/2] = Amp * Math.sin(2 * Math.PI * (-dt)/Time);
	//u[0][N/2 - space/2][N/2] = Amp * Math.sin(2 * Math.PI * (-dt)/Time + phi);
}

//gaussian distribution
function gaussian(x,y,x0,y0,amp,sigma){
	var f = amp * Math.exp(-(x-x0)*(x-x0)/(2*sigma*sigma)) * Math.exp(-(y-y0)*(y-y0)/(2*sigma*sigma))
	return f;
}

//numerical calculation of wave function
function calculate(){
	//source
	//u[1][N/2 + space/2][N/2] = Amp * Math.sin(2 * Math.PI * time/Time);
	//u[1][N/2 - space/2][N/2] = Amp * Math.sin(2 * Math.PI * time/Time + phi);
	

	//calculate vartex
	var gamma2 = Math.pow(vel*dt/dx, 2);
	for(var i=1; i <= N-1; i++){
		for(var j=1; j <= N-1; j++){
// 			if(i==2 || j==2){
				u[2][i][j] = 2*(1-2*gamma2)*u[1][i][j] - u[0][i][j] + gamma2*(u[1][i+1][j]+u[1][i-1][j]+u[1][i][j+1]+u[1][i][j-1]);
// 			}
// 			else{
// 				u[2][i][j] = (2-5*gamma2)*u[1][i][j] - u[0][i][j] + 4*gamma2*(u[1][i+1][j]+u[1][i-1][j]+u[1][i][j+1]+u[1][i][j-1])/3 - gamma2*(u[1][i+2][j]+u[1][i-2][j]+u[1][i][j+2]+u[1][i][j-2])/12;
// 		}
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
		for (var i = 1; i <= N - 1; i++) {
			u[2][i][0] = u[2][i][0]+vel*(dt/dx)*(u[1][i][1] - u[1][i][0]);
			u[2][i][N] = u[2][i][N]+vel*(dt/dx)*(u[1][i][N-1] - u[1][i][N]);
			u[2][0][i] = u[2][0][i]+vel*(dt/dx)*(u[1][1][i] - u[1][0][i]);
			u[2][N][i] = u[2][N][i]+vel*(dt/dx)*(u[1][N-1][i] - u[1][N][i]);
		}
	}
	
	//absorb
//	for(var n=0; n<3; n++){
//		for(var i=0; i<=d; i++) {
//			var absorb = Math.exp(-rho*i);
//			for(var j=0; j<=N; j++){
//				u[n][i][j] = absorb*u[n][i][j]; 
//			}
//		}
//		for(var i=N-d; i<=N; i++) {
//			var absorb = Math.exp(-rho*(i-(N-d)));
//			for(var j=0; j<=N; j++){
//				u[n][i][j] = absorb*u[n][i][j]; 
//			}
//		}
//	}
//	for(var n=0; n<3; n++){
//		for(var j=0; j<=d; j++) {
//			var absorb = Math.exp(-rho*j);
//			for(var i=0; i<=N; i++){
//				u[n][i][j] = absorb*u[n][i][j]; 
//			}
//		}
//		for(var j=N-d; j<=N; j++) {
//			var absorb = Math.exp(-rho*(j-(N-d)));
//			for(var i=0; i<=N; i++){
//				u[n][i][j] = absorb*u[n][i][j]; 
//			}
//		}
//	}
	//角の処理
	u[2][0][0] = (u[2][0][1] + u[2][1][0]) / 2;
	u[2][0][N] = (u[2][0][N - 1] + u[2][1][N]) / 2;
	u[2][N][0] = (u[2][N - 1][0] + u[2][N][1]) / 2;
	u[2][N][N] = (u[2][N - 1][N] + u[2][N][N - 1]) / 2;
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

	//create material
	var material = new THREE.MeshPhongMaterial({ color: 0xBFFFFF, ambient: 0x000050,
			side: THREE.DoubleSide, specular: 0xFFFFFF, shininess: 250,
			transparent:true, opacity: alpha});

	//create sphere object
	lattice = new THREE.Mesh(geometry, material);
	scene.add(lattice);
	//create shadow
	lattice.castShadow = true;

	targetLists[0] = lattice;

	//source object
// 	geometry = new THREE.SphereGeometry( 2, 20, 20 );
// 	material = new THREE.MeshLambertMaterial({ color: 0xFF0000, ambient: 0x880000 });

// 	sphere1 = new THREE.Mesh(geometry, material);
	//sphere2 = new THREE.Mesh(geometry, material);
// 	scene.add(sphere1);
// 	targetLists[1] = sphere1;
	//sphere1.castShadow = true;
	//sphere1.position.set(x1, 0, 0);
	//scene.add(sphere2);
	//sphere2.castShadow = true;
	//sphere2.position.set(x2, 0, 0);


	//line object
	//DrawLine();

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

///////////////////
// DrawLine
///////////////////
function DrawLine(){
	var z_line = 1; //line position z
	var m1 = 0;
	var flag1 = false;
	for(var i=0; m1*lambda/2 <= (dx/l)*space/2; i+=dx){
		m1++;
		if(m1*lambda/2 == (dx/l)*space/2)
			flag1 = true;

	}
	line1 = new Array(2*m1-1)
	var num = 0;

	var line1Material = new THREE.LineBasicMaterial({ color: 0xFF0000, linewidth: 4 });
	for(var n=0; n<m1; n++){
		var line1Geometry = new THREE.Geometry();
		var a2 = Math.pow(n*(l/dx)*lambda/2, 2);
		var c2 = Math.pow(space/2, 2);

		if(flag1 == true  && n == m1-1){
			var vertex = new THREE.Vector3(space/2, 0, z_line);
			line1Geometry.vertices.push(vertex);
			var vertex = new THREE.Vector3(N/2, 0, z_line);
			line1Geometry.vertices.push(vertex);
			line1[num] = new THREE.Line(line1Geometry, line1Material);
			scene.add(line1[num]);
			num++;
			var line1Geometry = new THREE.Geometry();
			var vertex = new THREE.Vector3(-space/2, 0, z_line);
			line1Geometry.vertices.push(vertex);
			var vertex = new THREE.Vector3(-N/2, 0, z_line);
			line1Geometry.vertices.push(vertex);
			line1[num] = new THREE.Line(line1Geometry, line1Material);
			scene.add(line1[num]);
			num++;
		}
		for(var j=0; j<=N; j++){
			var y = (-N/2 + j) * l;
			if(n==0){
				var x = 0;
			}
			else{
				var x = Math.sqrt(a2*(1+y*y/(c2-a2)));
			}
			var vertex = new THREE.Vector3(x, y, z_line);
			line1Geometry.vertices.push(vertex);
		}
		line1[num] = new THREE.Line(line1Geometry, line1Material);
		scene.add(line1[num]);
		num++;
		if(n != 0){
			var line1Geometry = new THREE.Geometry();
			for(var j=0; j<=N; j++){
				var y = (-N/2 + j) * l;
				if(n==0){
					var x = 0;
				}
				else{
					var x = -Math.sqrt(a2*(1+y*y/(c2-a2)));
				}
				var vertex = new THREE.Vector3(x, y, z_line);
				line1Geometry.vertices.push(vertex);
			}
			line1[num] = new THREE.Line(line1Geometry, line1Material);
			scene.add(line1[num]);
			num++;
		}
	}

	var m2 = 0;
	var flag2 = false;
	for(var i=0; (m2+1/2)*lambda/2 <= (dx/l)*space/2; i+=dx){
		m2++;
		if((m2+1/2)*lambda/2 == (dx/l)*space/2)
			flag2 = true;
	}
	line2 = new Array(2*m2);
	num = 0;

	var line2Material = new THREE.LineBasicMaterial({ color: 0x0000FF, linewidth:4 });
	for(var n=0; n<m2; n++){
		var line2Geometry = new THREE.Geometry();
		var a2 = Math.pow((n+1/2)*(l/dx)*lambda/2, 2);
		var c2 = Math.pow(space/2, 2);

		if(flag2 == true  && n == m2-1){
			var vertex = new THREE.Vector3(space/2, 0, z_line);
			line2Geometry.vertices.push(vertex);
			var vertex = new THREE.Vector3(N/2, 0, z_line);
			line2Geometry.vertices.push(vertex);
			line2[num] = new THREE.Line(line2Geometry, line2Material);
			scene.add(line2[num]);
			num++;
			var line2Geometry = new THREE.Geometry();
			var vertex = new THREE.Vector3(-space/2, 0, z_line);
			line2Geometry.vertices.push(vertex);
			var vertex = new THREE.Vector3(-N/2, 0, z_line);
			line2Geometry.vertices.push(vertex);
			line2[num] = new THREE.Line(line2Geometry, line2Material);
			scene.add(line2[num]);
			num++;
		}
		for(var j=0; j<=N; j++){
			var y = (-N/2 + j) * l;
			var x = Math.sqrt(a2*(1+y*y/(c2-a2)));
			var vertex = new THREE.Vector3(x, y, z_line);
			line2Geometry.vertices.push(vertex);
		}
		line2[num] = new THREE.Line(line2Geometry, line2Material);
		scene.add(line2[num]);
		num++;
		var line2Geometry = new THREE.Geometry();
		for(var j=0; j<=N; j++){
			var y = (-N/2 + j) * l;
			var x = -Math.sqrt(a2*(1+y*y/(c2-a2)));
			var vertex = new THREE.Vector3(x, y, z_line);
			line2Geometry.vertices.push(vertex);
		}
		line2[num] = new THREE.Line(line2Geometry, line2Material);
		scene.add(line2[num]);
		num++;
	}
}

////////////////////////////////////////
// define loop()
////////////////////////////////////////
var step = 0;
var slow = 0;
function loop(){
	//update trackball object
	trackball.update();
	if(restartFlag == true){
		time = 0;
		//Amp = parseFloat(document.getElementById("input_Amp").value);
		//_lambda = parseFloat(document.getElementById("input_lambda").value);
		//space = parseInt(document.getElementById("input_space").value);
		vel = parseInt(document.getElementById("input_vel").value);
		//var phaseList =document.getElementsByName("phase"); 
		//for(var i=0; i< phaseList.length; i++){
			//if(phaseList[i].checked && phaseList[i].value == "s")
				//phi = 0;
			//else if(phaseList[i].checked && phaseList[i].value == "r")
				//phi = Math.PI;
		//}
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
		//lambda = _lambda*(dx/l);
		//x1 = space / 2;
		//x2 = -space / 2;

		//recalculate
		initWave();
		calculate();

		//for(var i=0; i<line1.length; i++){
			//scene.remove(line1[i]);
		//}
		//for(var i=0; i<line2.length; i++){
			//scene.remove(line2[i]);
		//}
		//DrawLine();
		restartFlag = false;
		stopFlag = true;
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
			//sphere1.position.set(x1, 0, u[1][N/2 + space/2][N/2]);
			//sphere2.position.set(x2, 0, u[1][N/2 - space/2][N/2]);
			lattice.geometry.verticesNeedUpdate = true;
			lattice.geometry.normalsNeedUpdate = true;
			lattice.geometry.computeFaceNormals();
			lattice.geometry.computeVertexNormals();
			lattice.material.opacity = alpha;
			slow = 0;
		}
	}
	else{
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
		lattice.geometry.verticesNeedUpdate = true;
		lattice.geometry.normalsNeedUpdate = true;
		lattice.geometry.computeFaceNormals();
		lattice.geometry.computeVertexNormals();
		lattice.material.opacity = alpha;
		// 		lattice.geometry.verticesNeedUpdate = false;
		// 		lattice.geometry.normalsNeedUpdate = false;
	}

	//if(line1Flag == false){
	//for(var i=0; i<line1.length; i++){
	//scene.remove(line1[i]);
	//}
	//}
	//else{
	//for(var i=0; i<line1.length; i++){
	//scene.add(line1[i]);
	//}
	//}


	//if(line2Flag == false){
	//for(var i=0; i<line2.length; i++){
	//scene.remove(line2[i]);
	//}
	//}
	//else{
	//for(var i=0; i<line2.length; i++){
	//scene.add(line2[i]);
	//}
	//}
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

