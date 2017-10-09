var fps = 30;
var fpsInterval, startTime, now, before, elapsed;
var leftup = false;
var leftdown = false;
var rightup = false; 
var rightdown = false;
var side = '';
var connection; //WebSocket connection
//KeyCodes: w:leftup-87  s:leftdown-83  i:rightup-73  k:rightdown-75
var score = [0,0];


var numPoints = 16;
var vertexArray;
var vertices = [];


var numBorderIndices = 4;
var borderIndices = new Uint16Array([0, 1, 2, 3]);

var numLeftPaddleIndices = 6;
var leftpaddleIndices = new Uint16Array([4, 5, 6, 4, 6, 7]);

var numRightPaddleIndices = 6;
var rightpaddleIndices = new Uint16Array([8, 9, 10, 8, 10, 11]);

var numBallIndices = 6;
var ballIndices = new Uint16Array([12, 13, 14, 12, 14, 15]);

var gl;
var isSetup = false;

var vertexbuffer;
var borderindexbuffer;
var leftpaddleindexbuffer;
var rightpaddleindexbuffer;
var ballindexbuffer;

var shader;

function main(){
	
	setup();
}



function draw()
{
	  gl.clear(gl.COLOR_BUFFER_BIT);
	  

	  gl.useProgram(shader);

	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

	  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
	  if (positionIndex < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	  }

	  gl.enableVertexAttribArray(positionIndex);
	  
	  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

	  gl.bindBuffer(gl.ARRAY_BUFFER, null);
	  

	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, borderindexbuffer);
	  gl.drawElements(gl.LINES, numBorderIndices, gl.UNSIGNED_SHORT, 0);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, leftpaddleindexbuffer);
	  gl.drawElements(gl.TRIANGLES, numLeftPaddleIndices, gl.UNSIGNED_SHORT, 0);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rightpaddleindexbuffer);
	  gl.drawElements(gl.TRIANGLES, numRightPaddleIndices, gl.UNSIGNED_SHORT, 0);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballindexbuffer);
	  gl.drawElements(gl.TRIANGLES, numBallIndices, gl.UNSIGNED_SHORT, 0);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	  gl.disableVertexAttribArray(positionIndex);
	  gl.useProgram(null);

}


var setup = function(){

	/**
	 * WebSocket Setup
	 */

	window.WebSocket = window.WebSocket || window.MozWebSocket;
	
	connection = new WebSocket('ws://127.0.0.1:1337');

	connection.onopen = function () {
		console.log("Connection Open!");// connection is opened and ready to use
	};

	connection.onerror = function (error) {
		console.log("OH NO! something went wrong!");// an error occurred when sending/receiving data
	};

	connection.onclose = function(){
		console.log("why is this closing?");
	}

	connection.onmessage = function (message) {
		// try to decode json (I assume that each message
		// from server is json)
		var json;
		try {
		  json = JSON.parse(message.data);
		} catch (e) {
		  console.log('This doesn\'t look like a valid JSON: ',
			  message.data);
		  return;
		}
		// handle incoming message
		
		//assume a vertices attribute in json object
		vertices = json.vertices;
		
		//assume a score attribute in json object
		score = json.score;
		
		
	};
	
	  //end of webSocket connection setup

	 setVertexArray();
	 var canvas = document.getElementById('theCanvas');

	  gl = getWebGLContext(canvas, false);
	  if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	  }
	  
	  var vshaderSource = document.getElementById('vertexShader').textContent;
	  var fshaderSource = document.getElementById('fragmentShader').textContent;
	  if (!initShaders(gl, vshaderSource, fshaderSource)) {
		console.log('Failed to intialize shaders.');
		return;
	  }
	  
	  shader = gl.program;
	  gl.useProgram(null);
	  
	  // request a handle for a chunk of GPU memory
	  vertexbuffer = gl.createBuffer();
	  if (!vertexbuffer) {
		  console.log('Failed to create the buffer object');
		  return;
	  }
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
	  
	  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);
	  
	  
	  borderindexbuffer = gl.createBuffer();
	  if (!borderindexbuffer) {
		  console.log('Failed to create the buffer object');
		  return;
	  }
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, borderindexbuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, borderIndices, gl.STATIC_DRAW);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  leftpaddleindexbuffer = gl.createBuffer();
	  if (!leftpaddleindexbuffer) {
		  console.log('Failed to create the buffer object');
		  return;
	  }
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, leftpaddleindexbuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, leftpaddleIndices, gl.STATIC_DRAW);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  rightpaddleindexbuffer = gl.createBuffer();
	  if (!rightpaddleindexbuffer) {
		  console.log('Failed to create the buffer object');
		  return;
	  }
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rightpaddleindexbuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rightpaddleIndices, gl.STATIC_DRAW);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  ballindexbuffer = gl.createBuffer();
	  if (!ballindexbuffer) {
		  console.log('Failed to create the buffer object');
		  return;
	  }
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballindexbuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ballIndices, gl.STATIC_DRAW);
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	  
	  
	  isSetup = true;
	  
	  gl.clearColor(0.0, 0.17, 0.0, 1.0);
	  
	  fpsInterval = 1000/fps;
	  before = Date.now();
	  startTime = before;
	  
	  animate();

}

function animate(){
	requestAnimationFrame(animate);
	
	now = Date.now();
	elapsed = now - before;
	
	if(elapsed > fpsInterval){
		before = now - (elapsed % fpsInterval);
		sendInput();
		//moveball();
		//checkCollision();
		setScore();
		setVertexArray();
		draw();
		
	}
}

function setScore(){
	document.getElementById('score').innerHTML = score[0]+"-"+score[1];
}


//SHOULD BE ON SERVER SIDE
/**
function moveball(){
	vertices[24]+= ballspeedX;
	vertices[25]+= ballspeedY;
	vertices[26]+= ballspeedX;
	vertices[27]+= ballspeedY;
	vertices[28]+= ballspeedX;
	vertices[29]+= ballspeedY;
	vertices[30]+= ballspeedX;
	vertices[31]+= ballspeedY;
}

function checkCollision(){
	if(vertices[31] > 0.9 || vertices[25] < -0.9){
		ballspeedY = ballspeedY*-1.0;
	}
	
	if((vertices[24] > vertices[8] && vertices[24] < vertices[10]) ||
		(vertices[30] > vertices[8] && vertices[30] < vertices[10])){
		if((vertices[29] > vertices[11] && vertices[29] < vertices[13]) ||
			(vertices[27] > vertices[11] && vertices[27] < vertices[13])){
				
				if(leftup){
					
					ballspeedY = ballspeedY*(-1.5);
					ballspeedX = ballspeedX*(-1.0);
				} else if(leftdown){
					
					ballspeedY = ballspeedY*(-0.5);
					ballspeedX = ballspeedX*(-1.0);
				} else{
					ballspeedX = ballspeedX*-1.0;
				}
		}
	}
	
	if((vertices[26] > vertices[16] && vertices[26] < vertices[18]) ||
		(vertices[28] > vertices[16] && vertices[28] < vertices[18])){
		if((vertices[29] > vertices[17] && vertices[29] < vertices[23]) ||
			(vertices[27] > vertices[17] && vertices[27] < vertices[23])){
				if(leftup){
					
					ballspeedY = ballspeedY*(-1.5);
					ballspeedX = ballspeedX*(-1.0);
				} else if(leftdown){
					
					ballspeedY = ballspeedY*(-0.5);
					ballspeedX = ballspeedX*(-1.0);
				} else{
					ballspeedX = ballspeedX*-1.0;
				}
		}
	}
	
	if(vertices[24] < -0.99){
		scoreright = scoreright + 1;
		resetBall();
	}
	if(vertices[26] > 0.99){
		scoreleft = scoreleft + 1;
		resetBall();
	}
}

function resetBall(){
	vertices[24] = -0.03;
	vertices[25] = -0.06;
	vertices[26] = 0.03;
	vertices[27] = -0.06;
	vertices[28] = 0.03;
	vertices[29] = 0.06;
	vertices[30] = -0.03;
	vertices[31] = 0.06;
	ballspeedX = ballspeedX*(-1);
}
**/

function sendInput(){
	if(leftup || leftdown){
		var inputmsg = leftup ? 1 : 0;
		connection.send(inputmsg);
	}
}

window.onkeydown = function(e){
	var key = e.keyCode;
	if(key == 87){
		leftup = true;
	}else if(key == 83){
		leftdown = true;
	}else if(key == 73){
		rightup = true;
	}else if(key == 75){
		rightdown = true;
	}
}

window.onkeyup = function(e){
	var key = e.keyCode;
	
	if(key == 87){
		leftup = false;
	}else if(key == 83){
		leftdown = false;
	}else if(key == 73){
		rightup = false;
	}else if(key == 75){
		rightdown = false;
	}
}

function setVertexArray(){
	vertexArray = null;
	vertexArray = new Float32Array([
	 vertices[0],vertices[1],vertices[2],vertices[3],
	 vertices[4],vertices[5],vertices[6],vertices[7],
	 vertices[8],vertices[9],vertices[10],vertices[11],
	 vertices[12],vertices[13],vertices[14],vertices[15],
	 vertices[16],vertices[17],vertices[18],vertices[19],
	 vertices[20],vertices[21],vertices[22],vertices[23],
	 vertices[24],vertices[25],vertices[26],vertices[27],
	 vertices[28],vertices[29],vertices[30],vertices[31]]);
	 if(isSetup){
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
	  
	  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);
	 }
}

