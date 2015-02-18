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
	$('#slider_Amp').slider({
			min: 0,
			max: 5,
			step: 0.1,
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
			value: lambda,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_lambda").value = value;
			}
	});
	document.getElementById("input_lambda").value = lambda;

	$('#slider_space').slider({
			min: 2,
			max: 80,
			step: 2,
			value: space,
			slide: function(event, ui){
				var value = ui.value;
				document.getElementById("input_space").value = value;
			}
	});
	document.getElementById("input_space").value = space;
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
	camera.position.set(0, 0, 120);
	camera.up.set(0,1,0);
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
var axis; //axis object

var lattice; //lattice object
//number of object
var N = 80;

var sphere1;
var sphere2;

var line0;
var line1;
var line2;

/* Wave format */
//edge length
var l = 1;
var Step = 200;

//time param
var Time = 0.5;
var dt = Time / Step;
var time = 0;

//wave param
var lambda = 6; //wave length
var Amp = 0.5; //ampritude
var phi = 0; //phase of source2
var space = 21;
var x1 = space/2; //position of source1
var x2 = -space/2; //position of source2

//rendering speed
var Slow = 0;

//conservation z
var f = new Array(Step);

function initObject(){
	//create axis object
// 	axis = new THREE.AxisHelper(100);
	//add axis object to scene
// 	scene.add(axis);
	//set axis position
// 	axis.position.set(0, 0, 0.3);

	x1 = space/2; //position of source1
	x2 = -space/2; //position of source2

	for(var step=0; step < Step; step++){
		f[step] = new Array(N + 1);
		var geometry = new THREE.Geometry();

		for(var i=0; i <= N; i++){
			f[step][i] = new Array(N + 1);
			for(var j=0; j <= N; j++){
				//calculate vartex
				var x = (-N/2 + i) * l;
				var y = (-N/2 + j) * l;
				var z = Amp * (Math.sin(2 * Math.PI * ((time/Time) - (Math.sqrt(Math.pow((x-x1),2) + y*y)/lambda))) + Math.sin(2 * Math.PI * ((time/Time) - Math.sqrt(Math.pow((x-x2),2) + y*y)/lambda) + phi) );
				f[step][i][j] = z;
			}
		}
		time += dt;
	}
	var n=0;
	for(var j=0; j <= N; j++){
		for(var i=0; i <= N; i++){
			var x = (-N/2 + i) * l;
			var y = (-N/2 + j) * l;
			var vertex = new THREE.Vector3(x, y, f[0][i][j]);
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
	var material = new THREE.MeshPhongMaterial({ color: 0x0033E0, ambient: 0x000000,
			side: THREE.DoubleSide, specular: 0xFFFFFF, shininess: 250 });

	//create sphere object
	lattice = new THREE.Mesh(geometry, material);
	scene.add(lattice);
	//create shadow
	lattice.castShadow = true;

	//source object
	geometry = new THREE.SphereGeometry( lambda / 3, 20, 20 );
	material = new THREE.MeshLambertMaterial({ color: 0xFF0000, ambient: 0x880000 });

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
	var z_line = 0.10; //line position z
	var m1 = 0;
	var flag1 = false;
	for(var i=0; m1*lambda/2 <= space/2; i++){
		m1++;
		if(m1*lambda/2 == space/2)
			flag1 = true;

	}
	line1 = new Array(2*m1-1)
	var num = 0;

	var line1Material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
	for(var n=0; n<m1; n++){
		var line1Geometry = new THREE.Geometry();
		var a2 = Math.pow(n*lambda/2, 2);
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
	for(var i=0; (m2+1/2)*lambda/2 <= space/2; i++){
		m2++;
		if((m2+1/2)*lambda/2 == space/2)
			flag2 = true;
	}
	line2 = new Array(2*m2);
	num = 0;

	var line2Material = new THREE.LineBasicMaterial({ color: 0x00FF00 });
	for(var n=0; n<m2; n++){
		var line2Geometry = new THREE.Geometry();
		var a2 = Math.pow((n+1/2)*lambda/2, 2);
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
		Amp = parseFloat(document.getElementById("input_Amp").value);
		lambda = parseInt(document.getElementById("input_lambda").value);
		space = parseInt(document.getElementById("input_space").value);
		var phaseList =document.getElementsByName("phase"); 
		for(var i=0; i< phaseList.length; i++){
			if(phaseList[i].checked && phaseList[i].value == "s")
				phi = 0;
			else if(phaseList[i].checked && phaseList[i].value == "r")
				phi = Math.PI;
		}
		x1 = space / 2;
		x2 = -space / 2;
		for(var n=0; n < Step; n++){
			for(var i=0; i <= N; i++){
				for(var j=0; j <= N; j++){
					//calculate vartex
					var x = (-N/2 + i) * l;
					var y = (-N/2 + j) * l;
					var z = Amp * (Math.sin(2 * Math.PI * ((time/Time) - (Math.sqrt(Math.pow((x-x1),2) + y*y)/lambda))) + Math.sin(2 * Math.PI * ((time/Time) - Math.sqrt(Math.pow((x-x2),2) + y*y)/lambda) + phi) );
					f[n][i][j] = z;
				}
			}
			time += dt;
		}
		for(var i=0; i<line1.length; i++){
			scene.remove(line1[i]);
		}
		for(var i=0; i<line2.length; i++){
			scene.remove(line2[i]);
		}
		DrawLine();
		restartFlag = false;
		stopFlag = false;
		step = 0;
	}

		if(stopFlag == false){

			if(slow < Slow){
				slow++;
			}
			else{

				step++;
				var n = 0;
				for(var j=0; j<=N; j++){
					for(var i=0; i<=N; i++){
						var x = (-N/2 + i) * l;
						var y = (-N/2 + j) * l;
						var vertex = new THREE.Vector3(x, y, f[step%Step][i][j]);
						lattice.geometry.vertices[n] = vertex;
						n++;
					}
				}
				sphere1.position.set(x1, 0, f[step%Step][Math.round(x1/l + N/2)][N/2]);
				sphere2.position.set(x2, 0, f[step%Step][Math.round(x2/l + N/2)][N/2]);
				lattice.geometry.verticesNeedUpdate = true;
				lattice.geometry.normalsNeedUpdate = true;
				lattice.geometry.computeFaceNormals();
				lattice.geometry.computeVertexNormals();
				slow = 0;
			}
		}
		else{
			lattice.geometry.verticesNeedUpdate = false;
			lattice.geometry.normalsNeedUpdate = false;
		}

		if(line1Flag == false){
			for(var i=0; i<line1.length; i++){
				scene.remove(line1[i]);
			}
		}
		else{
			for(var i=0; i<line1.length; i++){
				scene.add(line1[i]);
			}
		}


		if(line2Flag == false){
			for(var i=0; i<line2.length; i++){
				scene.remove(line2[i]);
			}
		}
		else{
			for(var i=0; i<line2.length; i++){
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

