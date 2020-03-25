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

const rotate = (fi) => {
    return [
        [Math.cos(fi), Math.sin(fi), 0],
        [-Math.sin(fi), Math.cos(fi), 0],
        [0 , 0 , 1]
    ];
}

const scale = (a, b) => {
    return [
        [a, 0, 0],
        [0, b, 0],
        [0, 0, 1]
    ];
}

const invert = () => { 
    return [
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, 1]
    ];
}

const translate = (a, b) => {
    return [
        [1, 0, 0],
        [0, 1, 0],
        [a, b, 1]
    ];
}
const identity = () => {
    return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
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
    let forward = from.minus(to).norm();
    let right = crossProduct3(new vector([0,1,0]),forward);
    let up = crossProduct3(forward,right);
    
    return [
        right.addCoord(0).vect,
        up.addCoord(0).vect,
        forward.addCoord(0).vect,
        from.addCoord(1).vect
    ];
}



const toRadian = (deg) => {
    return deg * 0.0174533;
}

const start = () => {
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
    gl.enable(gl.DEPTH_TEST);   
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT_AND_BACK);                            // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL    );                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0, 0, 0,1);
    
    var verticies = [0.0, 0.5, -0.5,-0.5, 0.5,-0.5];
  
    const indicies = [0,1 , 1,2, 2,3, 3,4, 4,0 ];
    
    let figure = [
        -2,4, 
        0,2, 
        2,4,
        2,-4,
        -2,-2];

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

    for(let i = 0;i < figure.length;i++){
        figure[i] /= 8.0; //normalize
    }
    for(let i = 0;i < figure3d.length;i++){
        figure3d[i] /= 8.0; //normalize
    }

    let mat = lookAt3(new vector([0,0,0]),new vector([0,0,0]));
    console.log(mat);

    console.log(figure);
    let uniformTranslateMatLocation = gl.getUniformLocation(program,"u_translate");
    let uniformScaleMatLocation = gl.getUniformLocation(program,"u_scale");
    let uniformInvertMatLocation = gl.getUniformLocation(program,"u_invert");
    let uniformRotateMatLocation = gl.getUniformLocation(program,"u_rotate");
    let uniformLookMatLocation = gl.getUniformLocation(program,"u_look");
    let matInit = lookAt3(new vector([1,1,1]),new vector([0,0,0]));
    gl.uniformMatrix4fv(uniformLookMatLocation,false,matInit.flat());
    
    gl.uniformMatrix3fv(uniformTranslateMatLocation,false,identity().flat());
    gl.uniformMatrix3fv(uniformScaleMatLocation,false,identity().flat());
    gl.uniformMatrix3fv(uniformInvertMatLocation,false,identity().flat());
    gl.uniformMatrix3fv(uniformRotateMatLocation,false,identity().flat());


    let translateSliderX = document.getElementById("translateSliderX");
    let translateSliderY = document.getElementById("translateSliderY");
    let scaleSlider = document.getElementById("scaleSlider");
    let rotateSlider = document.getElementById("rotateSlider");
    let invertCheckBox = document.getElementById("invertCheckBox");

    //labes
    let translateLabelX = document.getElementById("translateLabelX");
    let translateLabelY = document.getElementById("translateLabelY");
    let rotateLabel = document.getElementById("rotateLabel");
    let scaleLabel = document.getElementById("scaleLabel");

    let inverted = false;
    invertCheckBox.onchange = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);

        if(inverted){
            gl.uniformMatrix3fv(uniformInvertMatLocation,false,identity().flat());
        }else{
            gl.uniformMatrix3fv(uniformInvertMatLocation,false,invert().flat());
        }
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
        inverted = !inverted;
    }

    rotateSlider.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);

        rotateLabel.innerHTML = `Значение: ${rotateSlider.value} градусов`;
        gl.uniformMatrix3fv(uniformRotateMatLocation,false,rotate(toRadian(rotateSlider.value)).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
    }

    scaleSlider.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        
        scaleLabel.innerHTML = `Значение: ${scaleSlider.value}`;
        gl.uniformMatrix3fv(uniformScaleMatLocation,false,scale(scaleSlider.value,scaleSlider.value).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
    }

    translateSliderX.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);

        let mat = lookAt3(new vector([translateSliderX.value,translateSliderY.value,1]),new vector([0,0,-1]));
        gl.uniformMatrix4fv(uniformLookMatLocation,false,mat.flat());
        translateLabelX.innerHTML = `Значение: ${translateSliderX.value}`;
        gl.uniformMatrix3fv(uniformTranslateMatLocation,false,translate(translateSliderX.value,translateSliderY.value).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
    }

    translateSliderY.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        
        let mat = lookAt3(new vector([translateSliderX.value,translateSliderY.value,1]),new vector([0,0,-1]));
        gl.uniformMatrix4fv(uniformLookMatLocation,false,mat.flat());
        translateLabelY.innerHTML = `Значение: ${translateSliderY.value}`;
        gl.uniformMatrix3fv(uniformTranslateMatLocation,false,translate(translateSliderX.value,translateSliderY.value).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
    }




   

    var vertexBuffer = gl.createBuffer();
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


    gl.drawElements(gl.LINES , 30, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays(gl.LINE_LOOP,0,5);

    let last = performance.now();
    
    const speed = (2* Math.PI)/5000;
    const radius = 0.001;
    let angle = 0;
    

    const render = () =>{
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        angle += speed * 0.01;
        //let x = Math.cos(angle) * radius;
        //let y = Math.sin(angle) * radius;
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

