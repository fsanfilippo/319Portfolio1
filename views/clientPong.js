var fps = 30;
var fpsInterval, startTime, now, before, elapsed;
var up = false;
var down = false;
var gameID = undefined;


var side = '';
var connection; //WebSocket connection
//KeyCodes: w:up-87  s:down-83
var score = [0,0];
var playerNum = undefined; //determines if you are player1 or player2
var assingedGame = false; //if the game isn't started you will be recieveing player assignment
var msgDisplay = document.getElementById("displayWinner");

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
	
	connection = new WebSocket('ws://127.0.0.1:1337'); //TODO: change when we put on server

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
		var json;

		try {
			json = JSON.parse(message.data);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
		return;
		}

		if(!assingedGame){
			if(json.waiting){
				msgDisplay.textContent = "Waiting for other player...";
			}
			else{
				msgDisplay.textContent = "";
				playerNum = (json.player === "true") ? 1 : 2;
				assingedGame = true;
				gameID = json.gameID;
			}
		}
		//indicates the game ended and we're starting a new one
		else if(json.newGame){
			assingedGame = false;
			playerNum = undefined;
			gameID = undefined;
			msgDisplay.textContent = "";
			
		}
		else if(json.winner){
			if(playerNum == json.winner){
				console.log(score);
				console.log(json.winner);
				msgDisplay.textContent = "YOU WON! :)";
			}
			else{
				msgDisplay.textContent = "YOU LOST :(";
			}
			score[0] = json.score.left;
			score[1] = json.score.right;
		}
		else{
			
			//assume a vertices attribute in json object
			vertices = json.vertices;
			
			//assume a score attribute in json object
			score[0] = json.score.left;
			score[1] = json.score.right;
		}
		
	};//end of webSocket connection setup
	
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
		
		setScore();
		setVertexArray();
		draw();
		
	}
}

function setScore(){
	document.getElementById('score').innerHTML = score[0]+"-"+score[1];
}

function sendInput(){
	var paddleDir = undefined;
	
	if(up){
		paddleDir = "1";
	}
	else if(down){
		paddleDir = "0";
	}
	
	var sendObj = JSON.stringify({paddle: paddleDir, player: playerNum, gameID: gameID});
	connection.send(sendObj);
}

window.onkeydown = function(e){
	var key = e.keyCode;
	if(key == 87){
		up = true;
	}else if(key == 83){
		down = true;
	}
	sendInput();
}

window.onkeyup = function(e){
	var key = e.keyCode;
	if(key == 87){
		up = false;
	}else if(key == 83){
		down = false;
	}
	sendInput();
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

window.onbeforeunload = function() {
	connection.close();
}

