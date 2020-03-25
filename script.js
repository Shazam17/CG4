 // глобальная переменная для контекста WebGL
 const createShader = (gl, type, source) => {
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
const createProgram = (gl, vertexShader, fragmentShader) => {
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

class vector {

    constructor(arr) {
        this.vect = arr;
    }


    len() {
        let sum = 0;
        for(let i = 0; i < this.vect.length;i++){
            sum += this.vect[i] * this.vect[i];
        }
        return Math.sqrt(sum);
    }

    norm() {
        let tLen = this.len();
        let arr = [];
        for(let i = 0; i < this.vect.length; i++){
            arr.push(this.vect[i]/tLen);
        }
        return new vector(arr);
    }

    minus(other) {
        let retArray = [];
        for(let i = 0; i < this.vect.length; i++){
            retArray.push(this.vect[i] - other.vect[i]);
        }
        let retVec = new vector(retArray);
        return retVec;
    }

    plus(other) { 
        let retArray = [];
        for(let i = 0; i < this.vect.length; i++){
            retArray.push(this.vect[i] + other.vect[i]);
        }
        let retVec = new vector(retArray);
        return retVec;
    }

    addCoord(coord) {
        let copyArr = this.vect;
        copyArr.push(coord);
        return new vector(copyArr);
    }
}

const crossProduct3 = (v1 , v2) => {
    return new vector([
        v1.vect[2]*v2.vect[1] - v1.vect[1]*v2.vect[2],
        v1.vect[0]*v2.vect[2] - v1.vect[2]*v2.vect[0],
        v1.vect[1]*v2.vect[0] - v1.vect[0]*v2.vect[1]]);
}

const lookAt3 = (from, to) => {
    let forward = to.minus(from).norm();
    let right = crossProduct3(new vector([0,1,0]),forward);
    let up = crossProduct3(forward,right);
    
    return [
        right.addCoord(0).vect,
        up.addCoord(0).vect,
        forward.addCoord(0).vect,
        from.addCoord(1).vect
    ];
}

const start = () => {
    let canvas = document.getElementById("glcanvas");
    let gl = canvas.getContext("webgl");    // инициализация контекста GL
    
    if (!gl) {
        console.log("webGL doesnt work")
    }

    const vertexShaderSource = document.getElementById("2d-vertex-shader").text;
    const fragmentShaderSource = document.getElementById("2d-fragment-shader").text;
 
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);

    let initSpeed = (2* Math.PI)/5000;
    let speed = initSpeed * 0.1;
    const radius = 0.001;

    gl.useProgram(program);
    // продолжать только если WebGL доступен и работает
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность
    gl.enable(gl.DEPTH_TEST);   
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT_AND_BACK);                            // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0, 0, 0,1);
    
    let figure3d = [
        -2,4,0, 
        0,2,0, 
        2,4,0,
        2,-4,0,
        -2,-2,0,

        -2,4,-2, 
        0,2,-2, 
        2,4,-2,
        2,-4,-2,
        -2,-2,-2
    ];

    const indicies3d = [0,1 , 1,2, 2,3, 3,4, 4,0,
         0,5, 1,6, 2,7,3,8,4,9,
        5,6, 6,7, 7,8, 8,9, 9,5];

    for(let i = 0;i < figure3d.length;i++){
        figure3d[i] /= 8.0; //normalize
    }

   
    let uniformLookMatLocation = gl.getUniformLocation(program,"u_look");
    let matInit = lookAt3(new vector([1,1,1]),new vector([0,0,0]));
    gl.uniformMatrix4fv(uniformLookMatLocation,false,matInit.flat());
    
    let speedSlider = document.getElementById("speedSlider");
    let speedSliderLabel = document.getElementById("speedSliderLabel");
    speedSlider.oninput = () => {
        speed = initSpeed* speedSlider.value;
        speedSliderLabel.innerHTML = `Значение: ${speedSlider.value}`;
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(figure3d),gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies3d),gl.STATIC_DRAW);


    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const render = () =>{
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        let x = radius * Math.sin(performance.now()*speed);
        let y = radius * Math.cos(performance.now()*speed);
        let mat = lookAt3(new vector([0,0,0]),new vector([x,0,y]));
        gl.uniformMatrix4fv(uniformLookMatLocation,false,mat.flat());
        gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
    }
    
    const renderLoop = () => {
        render();
        window.setTimeout(renderLoop, 1000 / 60);
    }

    renderLoop();
}

