var x = 0;
var y = 0;

//0 = up, 1 = right, 2 = down, 3 = left
var direction; 
var canvas;
var ctx;
var interval;

function initGame(){
    canvas = document.createElement("canvas");
    console.log(canvas);
    canvas.width = 500;
    canvas.height = 200;
    ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    direction = 1;

    interval = setInterval(function(){
        updateGame();
    }, 10);
}


function turnLeft(){
    if(direction == 0){
        direction = 3;
    }
    else{
        direction--;
    }
}

function turnRight(){
    direction = (direction + 1)%4;
}
function stop(){
    clearInterval(interval);
}

function updateGame(){
    
    switch(direction){
        case 0:
        y = Math.max(y - 1, 0);
        break;
        case 1:
        x = Math.min(x + 1, canvas.width - 10);
        break;
        case 2:
        y = Math.min(y + 1, canvas.height - 10);
        console.log(y);
        break;
        case 3:
        x = Math.max(x -1 , 0);
        break;
    }
    sendMessage(x, y);
    ctx.fillRect(x,y,10,10);

}

