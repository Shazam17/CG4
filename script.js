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
    gl.enable(gl.DEPTH_TEST);                               // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
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

    for(let i = 0;i < 10;i++){
        figure[i] /= 8.0; //normalize
    }

    console.log(figure);
    let uniformTranslateMatLocation = gl.getUniformLocation(program,"u_translate");
    let uniformScaleMatLocation = gl.getUniformLocation(program,"u_scale");
    let uniformInvertMatLocation = gl.getUniformLocation(program,"u_invert");
    let uniformRotateMatLocation = gl.getUniformLocation(program,"u_rotate");


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
        gl.drawElements(gl.LINES , 10, gl.UNSIGNED_SHORT, 0);
        inverted = !inverted;
    }

    rotateSlider.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);

        rotateLabel.innerHTML = `Значение: ${rotateSlider.value} градусов`;
        gl.uniformMatrix3fv(uniformRotateMatLocation,false,rotate(toRadian(rotateSlider.value)).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 10, gl.UNSIGNED_SHORT, 0);
    }

    scaleSlider.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        
        scaleLabel.innerHTML = `Значение: ${scaleSlider.value}`;
        gl.uniformMatrix3fv(uniformScaleMatLocation,false,scale(scaleSlider.value,scaleSlider.value).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 10, gl.UNSIGNED_SHORT, 0);
    }

    translateSliderX.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        
        translateLabelX.innerHTML = `Значение: ${translateSliderX.value}`;
        gl.uniformMatrix3fv(uniformTranslateMatLocation,false,translate(translateSliderX.value,translateSliderY.value).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 10, gl.UNSIGNED_SHORT, 0);
    }

    translateSliderY.oninput = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0, 0, 0,1);
        
        translateLabelY.innerHTML = `Значение: ${translateSliderY.value}`;
        gl.uniformMatrix3fv(uniformTranslateMatLocation,false,translate(translateSliderX.value,translateSliderY.value).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.LINES , 10, gl.UNSIGNED_SHORT, 0);
    }
    

        
    
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

}