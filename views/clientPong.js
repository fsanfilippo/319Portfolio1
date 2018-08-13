define(function (require) {
	var fps = 30;
	var fpsInterval, now, before, elapsed;
	var up = false;
	var down = false;
	var gameID = undefined;
	var state = 0;

	var connection; //WebSocket connection
	//KeyCodes: w:up-87  s:down-83
	var score = [0,0];
	var playerNum = undefined; //determines if you are player1 or player2
	var assingedGame = false; //if the game isn't started you will be recieveing player assignment
	var msgDisplay = document.getElementById("displayWinner");
	var opponentName = document.getElementById("displayOpponentName");
	var vertices = [];

	var Render = require('./Render');
	var WebSocketInit = require('./WebSocketInit');

	function main(){
		
		setup();
	}

	var setup = function(){

		//Create Websocket connection
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		connection = new WebSocket('ws://127.0.0.1:1337'); //TODO: change when we put on server
		WebSocketInit.init(connection, onmessage);
		
		//Intialize WebGl
		var canvas = document.getElementById('theCanvas');
		Render.setVertexArray();
		Render.initializeWebGL(canvas);

		fpsInterval = 1000/fps;
		before = 0
		
		requestAnimationFrame(animate);
	}

	var onmessage = function(message) {
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
				opponentName = json.opponentName;
				console.log(json);
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
			Render.setVertices(vertices);
			//assume a score attribute in json object
			score[0] = json.score.left;
			score[1] = json.score.right;
		}
		
	};//end of webSocket connection setup

	

	function animate(timestamp){
		requestAnimationFrame(animate);
		
		now = timestamp;
		elapsed = now - before;

		if(elapsed > fpsInterval){
			before = now - (elapsed % fpsInterval);
			
			setScore();
			Render.setVertexArray();
			Render.draw();
			
		}
	}

	function setScore(){
		document.getElementById('score').innerHTML = "SCORE | " + score[0]+"-"+score[1];
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

		if (e.keyCode == 13) {
			connection.send(JSON.stringify({name: "Frank"}))
		}

		var key = e.keyCode;
		if(key == 87){
			up = false;
		}else if(key == 83){
			down = false;
		}
		sendInput();
	}


	window.onbeforeunload = function() {
		connection.close();
	}
	window.onload = main;

	
});
