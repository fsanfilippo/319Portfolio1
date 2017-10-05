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
  //decode JSON object and send to update game
  //var paddleDir = JSON.parse(message.utf8Data);
  var gameObj = clientsGameState.get(client);
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
    this.vertices = [];//TODO: set this to vertices from game
    this.waitingOnClient = true; //if true, one client is waiting for another client
    
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

app.listen(3000);