var express = require('express');
var path = require("path");
var app = new express();

app.use(express.static(__dirname + '/views'));


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname + '/views/pong.html'));
});


const interval = 1000/60;
var gameMap = new Map();
const movespeed = 0.06; //the move speed of the ball
var runningGames = new Map();
var waitingForName = new Array();
var WebSocketServer = require('websocket').server;
var waitingOnClient = undefined;//hold the clients that
var ID = 0; //game ID of games 
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});

server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});


// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  
  addNewClient(connection);
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message){
    msgObj = JSON.parse(message.utf8Data);
    console.log(msgObj);
    if(msgObj.name){
      connection.name = msgObj.name;
      findPartners(connection);
    }
    else{
      updateGameState(message);
    }

   
  });

  connection.on('close', function(message) {

    var gameID = gameMap.get(connection);
    
    var game = runningGames.get(gameID).game;

    game.active = false;//stop from sending game state updates

    var clientLeft;
    if(connection == game.client1){
      clientLeft = game.client2;
    }
    else{
      
      clientLeft = game.client1;
    }
    
    
    clientLeft.send(JSON.stringify({newGame: "Hey, this data don't matter"}));

    gameMap.delete(game.client1);
    gameMap.delete(game.client2);
    runningGames.delete(gameID);
    addNewClient(clientLeft);


  });
});


function updateGameState(message){
  //find game from client
  msgObj = JSON.parse(message.utf8Data);
  
  var gameObj = runningGames.get(msgObj.gameID);
  
  //game gets deleted when switching player
  if(gameObj){
    switch(msgObj.player){
      case 1: gameObj.game.player1PaddleDir = msgObj.paddle; break;
      case 2: gameObj.game.player2PaddleDir = msgObj.paddle; break;
    }
  }
  
} 


addNewClient = function(client){

    waitingForName.push(client);
}

findPartners = function(client){
    //check for client that needs pair
    if(waitingOnClient){
      runningGames.set(ID, {
        client1: waitingOnClient,
        client2: client,
        game: new GameState(waitingOnClient, client, ID)});
      var client1Obj = JSON.stringify({player: "true", gameID: ID, opponentName: client.name});//true means player 1
      var client2Obj = JSON.stringify({player: "false", gameID: ID, opponentName: waitingOnClient.name});//false means player 2
      waitingOnClient.send(client1Obj);
      client.send(client2Obj);
      gameMap.set(waitingOnClient, ID);
      gameMap.set(client, ID);
      waitingOnClient = undefined;
      ID++;
    }
    else{
      client.send(JSON.stringify({waiting:" "}));
      waitingOnClient = client;
    }
    
}


//represents one game between two clients
class GameState {
  constructor(client1, client2, ID){
    this.ID = ID;
    this.client1 = client1;
    this.client2 = client2;
    this.ballVelX = 0.02;
    this.ballVelY = 0.02;
    this.player1PaddleDir = undefined; //0 down, 1 up, undefined not moving
    this.player2PaddleDir = undefined; 
    this.score = {left: 0, right: 0};
    this.active = true;
    this.winner = undefined;
    this.vertices = [
      -1.0, -0.9,		//0(0,1)		lower boundary
      1.0, -0.9,		//1(2,3)
      
      -1.0, 0.9,		//2(4,5)		upper boundary
      1.0, 0.9,		//3(6,7)
      
      -0.82, -0.3,	//4(8,9)		left paddle, client1
      -0.8, -0.3,		//5(10,11)
      -0.8, 0.3,		//6(12,13)
      -0.82, 0.3,		//7(14,15)
      
      0.8, -0.3,		//8(16,17)		right paddle, client2
      0.82, -0.3,		//9(18,19)
      0.82, 0.3,		//10(20,21)
      0.8, 0.3,		//11(22,23)
      
      -0.03,-0.06,	//12(24,25)		ball
      0.03,-0.06,		//13(26,27)
      0.03,0.06,		//14(28,29)
      -0.03,0.06		//15(30,31)
      ];
      

      //resetBall(this.vertices, this);
      
      var updateTheGame = function(){
        this.updateGame();
      }.bind(this);
      
      this.gameInterval = setInterval(updateTheGame, interval);
      
  }
  //paddleDir: 0 is down 1 is up
  updateGame(){
    
    var paddle1 = this.player1PaddleDir;
    var paddle2 = this.player2PaddleDir;
    
    handleInput(this.vertices, paddle1, paddle2);
    moveball(this.vertices, this.ballVelX, this.ballVelY);
    checkCollision(this.vertices, this, paddle1, paddle2);
    this.sendGameState();
    //call update the game
  }
  

  sendGameState(){

    if(this.winner){
      //console.log(this.score);
      var winner = JSON.stringify({winner: this.winner, score: this.score})
      this.client1.send(winner);
      this.client2.send(winner);
      this.active = undefined;
      clearInterval(this.gameInterval);
    }
    else if(!this.active){
      clearInterval(this.gameInterval);
    }
    else if(this.active){ //incase the game was deactivated and players don't exist anymore 
      var gameStateObj = JSON.stringify({vertices: this.vertices, score: this.score});
      this.client1.send(gameStateObj);
      this.client2.send(gameStateObj);//sends the game state to both clients
    }
    
    
  }

} //end of game class



/**
 * 
 * Game updating functions shared by all game states
 */
function handleInput(vertices, paddle1, paddle2){
  
	if(paddle1 === "1" && vertices[13] < 0.9){
		vertices[9] = vertices[9] + movespeed;
		vertices[11] = vertices[11] + movespeed;
		vertices[13] = vertices[13] + movespeed;
		vertices[15] = vertices[15] + movespeed;
	}
	else if(paddle1 === "0" && vertices[9] > -0.9){
		vertices[9] = vertices[9] - movespeed;
		vertices[11] = vertices[11] - movespeed;
		vertices[13] = vertices[13] - movespeed;
		vertices[15] = vertices[15] - movespeed;
	}
	else if(paddle2 === "1" && vertices[21] < 0.9){
		vertices[17] = vertices[17] + movespeed;
		vertices[19] = vertices[19] + movespeed;
		vertices[21] = vertices[21] + movespeed;
		vertices[23] = vertices[23] + movespeed;
	}
	else if(paddle2 === "0" && vertices[17] > -0.9){
		vertices[17] = vertices[17] - movespeed;
		vertices[19] = vertices[19] - movespeed;
		vertices[21] = vertices[21] - movespeed;
		vertices[23] = vertices[23] - movespeed;
	}
	
}

function moveball(vertices, ballVelX, ballVelY){
	vertices[24]+= ballVelX;
	vertices[25]+= ballVelY;
	vertices[26]+= ballVelX;
	vertices[27]+= ballVelY;
	vertices[28]+= ballVelX;
	vertices[29]+= ballVelY;
	vertices[30]+= ballVelX;
	vertices[31]+= ballVelY;
}

function checkCollision(vertices, game, paddle1, paddle2){
	if(vertices[31] > 0.9 || vertices[25] < -0.9){
		game.ballVelY = game.ballVelY*-1.0;
	}
	
	if((vertices[24] > vertices[8] && vertices[24] < vertices[10]) ||
		(vertices[30] > vertices[8] && vertices[30] < vertices[10])){
		if((vertices[29] > vertices[11] && vertices[29] < vertices[13]) ||
			(vertices[27] > vertices[11] && vertices[27] < vertices[13])){
				
				if(paddle1 === "1"){
					
					game.ballVelY = game.ballVelY*(-1.5);
					game.ballVelX = game.ballVelX*(-1.0);
				} else if(paddle1 === "0"){
					
					game.ballVelY = game.ballVelY*(-0.5);
					game.ballVelX =game.ballVelX*(-1.0);
				} else{
					game.ballVelX = game.ballVelX*-1.0;
				}
		}
	}
	
	if((vertices[26] > vertices[16] && vertices[26] < vertices[18]) ||
		(vertices[28] > vertices[16] && vertices[28] < vertices[18])){
		if((vertices[29] > vertices[17] && vertices[29] < vertices[23]) ||
			(vertices[27] > vertices[17] && vertices[27] < vertices[23])){
				if(paddle2 === '1"'){
					
					game.ballVelY = game.ballVelY*(-1.5);
					game.ballVelX = game.ballVelX*(-1.0);
				} else if(paddle2 === "0"){
					
					game.ballVelY = game.ballVelY*(-0.5);
					game.ballVelX = game.ballVelX*(-1.0);
				} else{
					game.ballVelX = game.ballVelX*-1.0;
				}
		}
	}
	
	if(vertices[24] < -0.99){
    game.score.right += 1;
    if(game.score.right === 10){
      game.winner = 2;
    }
    else{
      resetBall(vertices, game);
    }
		
	}
	else if(vertices[26] > 0.99){
    game.score.left += 1;
    if(game.score.left === 10){
      game.winner = 1;
    }
    else{
      resetBall(vertices, game);
    }
		
	}
}

function resetBall(vertices, game){
	vertices[24] = -0.03;
	vertices[25] = -0.06;
	vertices[26] = 0.03;
	vertices[27] = -0.06;
	vertices[28] = 0.03;
	vertices[29] = 0.06;
	vertices[30] = -0.03;
	vertices[31] = 0.06;
	game.ballVelX = game.ballVelX*(-1);
}

app.listen(3000);