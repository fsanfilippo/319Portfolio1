var connection;
$(function () {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
  
    connection = new WebSocket('ws://127.0.0.1:1337');
  
    connection.onopen = function () {
      console.log("Connection Open!");// connection is opened and ready to use
      
    };
  
    connection.onerror = function (error) {
      // an error occurred when sending/receiving data
    };
  
    connection.onmessage = function (message) {
      // try to decode json (I assume that each message
      // from server is json)
      try {
        var json = JSON.parse(message.data);
      } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ',
            message.data);
        return;
      }
      // handle incoming message
    };

  });

//message Sending function
function sendMessage(){
  var msg = "doesn't even matter right now";
  connection.send(msg);
}
function sendDir(dir){
  console.log("UP");
  console.log(dir);
  //up is 1, down is 0
  connection.send(dir);
}