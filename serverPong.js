//var fps = 30;
//var fpsInterval, startTime, now, before, elapsed;
var leftup = false;
var leftdown = false;
var rightup = false; 
var rightdown = false;

var scoreleft = 0;
var scoreright = 0;

var movespeed = 0.06;
var ballspeedX = 0.02;
var ballspeedY = 0.02;


var numPoints = 16;

var vertices = [
-1.0, -0.9,		//0(0,1)		lower boundary
1.0, -0.9,		//1(2,3)

-1.0, 0.9,		//2(4,5)		upper boundary
1.0, 0.9,		//3(6,7)

-0.82, -0.3,	//4(8,9)		left paddle
-0.8, -0.3,		//5(10,11)
-0.8, 0.3,		//6(12,13)
-0.82, 0.3,		//7(14,15)

0.8, -0.3,		//8(16,17)		right paddle
0.82, -0.3,		//9(18,19)
0.82, 0.3,		//10(20,21)
0.8, 0.3,		//11(22,23)

-0.03,-0.06,	//12(24,25)		ball
0.03,-0.06,		//13(26,27)
0.03,0.06,		//14(28,29)
-0.03,0.06		//15(30,31)
];


var numBorderIndices = 4;
var borderIndices = new Uint16Array([0, 1, 2, 3]);

var numLeftPaddleIndices = 6;
var leftpaddleIndices = new Uint16Array([4, 5, 6, 4, 6, 7]);

var numRightPaddleIndices = 6;
var rightpaddleIndices = new Uint16Array([8, 9, 10, 8, 10, 11]);

var numBallIndices = 6;
var ballIndices = new Uint16Array([12, 13, 14, 12, 14, 15]);

var gl;
var setup = false;

var vertexbuffer;
var borderindexbuffer;
var leftpaddleindexbuffer;
var rightpaddleindexbuffer;
var ballindexbuffer;

var shader;








function main(){
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
	  
	  
	  setup = true;
	  
	  gl.clearColor(0.0, 0.17, 0.0, 1.0);
	  
	  fpsInterval = 1000/fps;
	  before = Date.now();
	  startTime = before;
	  
	  animate();

}



function setScore(){
	
}

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

function handleInput(){
	if(leftup == true && vertices[13] < 0.9){
		vertices[9] = vertices[9] + movespeed;
		vertices[11] = vertices[11] + movespeed;
		vertices[13] = vertices[13] + movespeed;
		vertices[15] = vertices[15] + movespeed;
	}
	if(leftdown == true && vertices[9] > -0.9){
		vertices[9] = vertices[9] - movespeed;
		vertices[11] = vertices[11] - movespeed;
		vertices[13] = vertices[13] - movespeed;
		vertices[15] = vertices[15] - movespeed;
	}
	if(rightup == true && vertices[21] < 0.9){
		vertices[17] = vertices[17] + movespeed;
		vertices[19] = vertices[19] + movespeed;
		vertices[21] = vertices[21] + movespeed;
		vertices[23] = vertices[23] + movespeed;
	}
	if(rightdown == true && vertices[17] > -0.9){
		vertices[17] = vertices[17] - movespeed;
		vertices[19] = vertices[19] - movespeed;
		vertices[21] = vertices[21] - movespeed;
		vertices[23] = vertices[23] - movespeed;
	}
	
}

