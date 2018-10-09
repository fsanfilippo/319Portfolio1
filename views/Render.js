var vertexArray;
var numBorderIndices = 4;
var borderIndices = new Uint16Array([0, 1, 2, 3]);

var numLeftPaddleIndices = 6;
var leftpaddleIndices = new Uint16Array([4, 5, 6, 4, 6, 7]);

var numRightPaddleIndices = 6;
var rightpaddleIndices = new Uint16Array([8, 9, 10, 8, 10, 11]);

var numBallIndices = 6;
var ballIndices = new Uint16Array([12, 13, 14, 12, 14, 15]);

var gl;
var vertices = [];
var isSetup = false; //wheather it's setup

define(function(){
    return{
        initializeWebGL: function (canvas){
                    
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
            
            
        },
        setVertexArray: function(){
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
        },
        draw: function()
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
    
        },
        setVertices(newVertices){
            vertices = newVertices;
        }
    }
})


 
 