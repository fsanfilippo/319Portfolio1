var express = require('express');
var path    = require("path");
var app = new express();

app.use(express.static(__dirname + '/views'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist')); // redirect popper
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname + '/views/helloWord.html'));
});

var gameStates = new Array();
var clientsGameState = new Map();
var WebSocketServer = require('websocket').server;
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
    updateGameState(message, connection);
  });

  connection.on('close', function(connection) {
    // close user connection
  });
});

broadcast = function(message) {
  var msgObj =JSON.parse(message.utf8Data);
  var x = msgObj.x;
  var y = msgObj.y;
  console.log("( " + x + ", " + y + " )");
  
};

function updateGameState(message, client){
  //find game from client
  var gameObj = clientsGameState.get(client);
  //update game
  gameObj.game.updateGame(message, gameObj.client);
}

addNewClient = function(client){
    //check for client that needs pair
    //if another client is waiting for a player add client to that object in Connections map

    //handle edge case for first client
    if(gameStates.length == 0){
      let game = new GameState(client);
      gameStates.push(game);
      clientsGameState.set(client,{game: game, client: 1});
      return;
    }

    
    var gameStateCheck = gameStates[gameStates.length - 1];
    //add second client
    if(gameStateCheck.waitingOnClient){
        gameStateCheck.addClient2(client);
        clientsGameState.set(client, {game: gameStateCheck, client: 2});
    }
    //add new game
    else{
      let game = new GameState(client);
      gameStates.push(game);
      clientsGameState.set(client, {game: game, client: 1});
    }
    
    
}

//represents one game between two clients
class GameState {
  constructor(client1){
    this.client1 = client1;
    this.client2 = undefined;
    this.waitingOnClient = true; //if true, one client is waiting for another client
    var vertices = [
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
  }

  //adds the second client
  addClient2(client){
    this.client2 = client;
    this.waitingOnClient = false;
  }

  updateGame(paddleDir, clientNum){
    if(this.waitingOnClient){
      console.log("Test: this game is waiting on another client");
      return;
    }
    this.client1.send("Client 1!");
    this.client2.send("Hey, you're client 2!");
    //call update the game
  }

  sendGameState(){
    //sends the game state to both clients
  }

}

//Game state updating functions
function handleInput(vertices, ){
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

app.listen(3000);