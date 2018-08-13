define(function(){
    return{
        init: function(connection, onmessage) {
            connection.onopen = function () {
                console.log("Connection Open!");// connection is opened and ready to use
            };
    
            connection.onerror = function (error) {
                console.log("OH NO! something went wrong!");// an error occurred when sending/receiving data
            };
    
            connection.onclose = function(){
                console.log("why is this closing?");
                
            }
    
            connection.onmessage = onmessage;
        }
    }
});