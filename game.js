
//****** GAME LOOP ********//

// -Se inicia un bucle de juego (Loop) que utiliza requestAnimationFrame para actualizar continuamente el estado 
// del juego.
// -Init se llama cuando el documento está completamente cargado, inicializa el tiempo y llama a la función Start, 
// que a su vez llama al bucle del juego. 

let time = new Date();
let deltaTime = 0;

 //estas lineas inician el juego cuando las imagenes se hayan cargado

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);                                                            
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}


// -Se definen las variables que representan el estado del juego, como la posición del suelo, la velocidad del personaje, 
// la gravedad, etc.

//****** LOGIC ********//

let sueloY = 22;
let velY = 0;
let impulso = 900;
let gravedad = 2500;

let manPosX = 42;
let manPosY = sueloY; 

let sueloX = 0;
let velEscenario = 1280/3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;

let tiempoHastaObstaculo = 1;
let tiempoObstaculoMin = 0.9;
let tiempoObstaculoMax = 2.0;
let obstaculoPosY = 16;
let obstaculos = [];

let tiempoHastaNube = 0.5;
let tiempoNubeMin = 0.7;
let tiempoNubeMax = 2.7;
let maxNubeY = 270;
let minNubeY = 100;
let nubes = [];
let velNube = 0.5;

let contenedor;
let man;
let textoScore;
let suelo;
let gameOver;


// La función Start se encarga de la inicialización de elementos del juego y la asignación de eventos.
function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    man = document.querySelector(".man");
    document.addEventListener("keydown", HandleKeyDown);
}

// La función Update se llama en cada iteración del bucle de juego y se encarga de actualizar la lógica del juego, 
// como el movimiento del personaje, obstáculos, nubes, detección de colisiones, etc.
function Update() {
    if(parado) return;
    MoveMan();
    MoveGround();
    CreateObstacles();
    CreateClouds();
    MoveObstacles();
    MoveClouds();
    DetectCollision();
    velY -= gravedad * deltaTime;
}

// HandleKeyDown: Maneja el evento de presionar la tecla "Space" para saltar.
function HandleKeyDown(ev) {
    if (ev.keyCode == 32) {
        if (parado) {
            ResetGame();
        } else {
            Jump();
        }
    }
}

// Maneja la acción de saltar del personaje.
function Jump(){
    if(manPosY === sueloY){
        saltando = true;
        velY = impulso;
        man.classList.remove("man-corriendo");
    }
}


// Controlan el movimiento del personaje y del suelo.
function MoveMan() {
    manPosY += velY * deltaTime;
    if(manPosY < sueloY){
        
        Ground();
    }
    man.style.bottom = manPosY+"px";
}

function Ground() {
    manPosY = sueloY;
    velY = 0;
    if(saltando){
        man.classList.add("man-corriendo");
    }
    saltando = false;
}

function MoveGround() {
    sueloX += CalculateDisplacement();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalculateDisplacement() {
    return velEscenario * deltaTime * gameVel;
}

function Crash() {
    man.classList.remove("man-corriendo");
    man.classList.add("man-estrellado");
    parado = true ;
}

//  Funciones relacionadas con obstáculos, nubes y colisiones.
function CreateObstacles() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= -1) {
        CreateObstacle();
    }
}

function CreateClouds() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CreateCloud();
    }
}

function CreateObstacle() {
    let obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";
    
    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function CreateCloud() {
    let nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth+"px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
}

function MoveObstacles() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            EarnPoints();
        }else{
            obstaculos[i].posX -= CalculateDisplacement();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function MoveClouds() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        }else{
            nubes[i].posX -= CalculateDisplacement() * velNube;
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

// Aumenta el puntaje y ajusta la velocidad del juego.
function EarnPoints() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    }else if(score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if(score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3/gameVel)+"s";
}

// Muestra la animación de estrellarse y el mensaje de Game Over.
function GameOver() {
    Crash();
    gameOver.style.display = "block";
}

// Funciones para detectar colisiones entre el personaje y los obstáculos.
function DetectCollision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > manPosX + man.clientWidth) {
            //EVADE
            break; //al estar en orden, no puede chocar con más
        }else{
            if(IsCollision(man, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
        );
    }
    
    // Restablece todas las variables del juego, elimina obstáculos y nubes, oculta el mensaje de Game Over,
    //  y reinicia el bucle del juego.
    function ResetGame() {
        // Reinicializa todas las variables del juego
        sueloX = 0;
        velEscenario = 1280 / 3;
        gameVel = 1;
        score = 0;
        parado = false ;
        saltando = false;
        tiempoHastaObstaculo = 1;
        tiempoHastaNube = 0.5;
        velNube = 0.5;
    
        // Elimina todos los obstáculos y nubes presentes
        for (let i = 0; i < obstaculos.length; i++) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
        }
        obstaculos = [];
    
        for (let i = 0; i < nubes.length; i++) {
            nubes[i].parentNode.removeChild(nubes[i]);
        }
        nubes = [];
    
        // Oculta el mensaje de Game Over
        gameOver.style.display = "none";
    
        // Elimina la clase "man-estrellado" del personaje
        man.classList.remove("man-estrellado");
    
         // Agrega la clase "man-corriendo" al personaje
         man.classList.add("man-corriendo");
    
           // Elimina las clases de ambiente
        contenedor.classList.remove("mediodia", "tarde", "noche");
    
        // Reinicia el loop del juego
        Loop();
    }
    
    