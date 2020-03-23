 // глобальная переменная для контекста WebGL
 function createShader(gl, type, source) {
    var shader = gl.createShader(type);   // создание шейдера
    gl.shaderSource(shader, source);      // устанавливаем шейдеру его программный код
    gl.compileShader(shader);             // компилируем шейдер
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
function start() {
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl");    // инициализация контекста GL
    
    if (!gl) {
        console.log("webGL doesnt work")
    }

    var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
    var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;
 
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);
    // продолжать только если WebGL доступен и работает
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность
    gl.enable(gl.DEPTH_TEST);                               // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 0);
    
    var verticies = [0.0, 0.5, -0.5,-0.5, 0.5,-0.5];
  
    const indicies = [0,1 , 1,2, 2,3, 3,4, 4,0 ];
    let figure = [
        -2,4, 
        0,2, 
        2,4,
        2,-4,
        -2,-2];
    for(let i = 0;i < 10;i++){
        figure[i] /= 8.0; //normalize
    }
    console.log(figure);

    


    

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(figure),gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies),gl.STATIC_DRAW);


    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


    gl.drawElements(gl.LINES , 10, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays(gl.LINE_LOOP,0,5);

    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    // очистить буфер цвета и буфер глубины.


  
}