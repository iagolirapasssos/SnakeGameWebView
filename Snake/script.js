const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let speed = 4;
let tileCount = 20;
let tileSize = canvas.width / tileCount - 2;
let headX = 10;
let headY = 10;
const snakeParts = [];
let tailLength = 2; 

let appleX = 5;
let appleY = 5;

let xVelocity=0;
let yVelocity=0;

let score = 0;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Define os sons globalmente para que possam ser acessados pelas funções relevantes.
let bgMusic, gameOverSound;

function drawGameBoundaries() {
    // Ajusta a cor para branco
    ctx.strokeStyle = 'white';
    // Desenha um retângulo do início (0,0) até o fim (canvas.width, canvas.height)
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}


function drawGame() {
    changeSnakePosition();
    
    let result = isGameOver();
    if(result) {
        return;
    }
    
    if (isGameOver()) {
        return; // Para a execução se o jogo terminou
    }

    clearScreen();
    checkAppleCollision();
    drawApple();
    drawSnake();
    drawScore();

    setTimeout(drawGame, 1000 / speed);
    
}

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}

function handleTouchMove(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
}

function handleTouchEnd() {
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // Detecta movimento horizontal
        if (xDiff > 0) {
            // Movimento para esquerda
            if (xVelocity == 1) return; // Impede movimento oposto instantâneo
            xVelocity = -1;
            yVelocity = 0;
        } else {
            // Movimento para direita
            if (xVelocity == -1) return;
            xVelocity = 1;
            yVelocity = 0;
        }
    } else { // Detecta movimento vertical
        if (yDiff > 0) {
            // Movimento para cima
            if (yVelocity == 1) return;
            yVelocity = -1;
            xVelocity = 0;
        } else {
            // Movimento para baixo
            if (yVelocity == -1) return;
            yVelocity = 1;
            xVelocity = 0;
        }
    }
    // Reseta os valores após calcular a direção
    touchEndX = 0;
    touchEndY = 0;
    touchStartX = 0;
    touchStartY = 0;
}

// Agora, adicione os ouvintes de eventos
// Primeiro, vamos adicionar a lógica para carregar e tocar a música de fundo e o som de derrota
document.addEventListener('DOMContentLoaded', () => {
    bgMusic = new Audio('snake-hissing-6092.mp3');
    bgMusic.loop = true;

    gameOverSound = new Audio('snake-hissing-6092.mp3');

    // Define um único manipulador de evento para iniciar a música de fundo em resposta a uma interação do usuário.
    function startBackgroundMusic() {
        bgMusic.play().catch(e => console.log("Não foi possível iniciar a música de fundo: ", e));
        // Remove os ouvintes após a música ter sido iniciada com sucesso.
        document.removeEventListener('keydown', startBackgroundMusic);
        document.removeEventListener('touchstart', startBackgroundMusic);
    }

    // Adiciona ouvintes de eventos para tecla pressionada e toque na tela.
    document.addEventListener('keydown', startBackgroundMusic);
    document.addEventListener('touchstart', startBackgroundMusic);

    window.addEventListener('load', resizeGame);
    window.addEventListener('resize', resizeGame);
});


// Ajuste para iniciar os sons após a primeira interação do usuário
// Função para iniciar o áudio
function initAudio() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic && bgMusic.paused) {
        bgMusic.play().then(() => {
            console.log("Playback started successfully");
        }).catch(e => {
            console.log("Playback failed:", e);
        });
    }

    // Remove os ouvintes após a inicialização para não repetir a ação
    document.removeEventListener('keydown', initAudio);
    document.removeEventListener('touchstart', initAudio);
}

// Adiciona ouvintes de eventos para 'keydown' e 'touchstart'
document.addEventListener('keydown', initAudio);
document.addEventListener('touchstart', initAudio);

// Adiciona ouvintes de eventos para 'keydown' e 'touchstart'
document.addEventListener('keydown', function(event) {
    initAudio();
    //drawGameBoundaries();
});

document.addEventListener('touchstart', function(event) {
    initAudio();
    //drawGameBoundaries();
});

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);

function resizeGame() {
    const canvas = document.getElementById('gameCanvas');
    // Ajusta o canvas para ocupar a largura e altura da janela do navegador
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Chama resizeGame quando a página é carregada ou quando a janela é redimensionada
window.onload = resizeGame;
window.onresize = resizeGame;

function isGameOver() {
    let gameOver = false;

    if (yVelocity ===0 && xVelocity ===0) {
        return false;
    }

    // As condições originais verificam se a cobra toca ou passa as bordas do canvas:
    // Walls
    if (headX < 0) {
        gameOver = true;
    } else if (headX === tileCount) {
        gameOver = true;
    } else if (headY < 0) {
        gameOver = true;
    } else if (headY === tileCount) {
        gameOver = true;
    }


    // Verificação de colisão com o próprio corpo da cobra permanece igual
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        if (part.x === headX && part.y === headY) {
            gameOver = true;
            break;
        }
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "50px Verdana";

        var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");
        // Fill with gradient
        ctx.fillStyle = gradient;

        ctx.fillText("Game Over!", canvas.width / 6.5, canvas.height / 2);
        
        // Toca o som de derrota e reinicia o jogo após um breve delay.
        gameOverSound.play();
        setTimeout(() => window.location.reload(), 500); // Alterado para 1000ms para dar tempo ao som de ser ouvido.
    }

    return gameOver;
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "10px Verdana";
    ctx.fillText("Score " + score, canvas.width-50, 10);
}

function clearScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {

    ctx.fillStyle = 'green';
    for(let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
    }

    snakeParts.push(new SnakePart(headX, headY)); //put an item at the end of the list next to the head
    if(snakeParts.length > tailLength){
        snakeParts.shift(); //remove the furthers item from the snake parts if have more than our tail size.
    }

    ctx.fillStyle = 'orange';
    ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
}

function changeSnakePosition(){
    headX = headX + xVelocity;
    headY = headY + yVelocity;
}

function drawApple() {
    ctx.fillStyle = "red";
    ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}

function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        tailLength++;
        score++;
    }
}

document.body.addEventListener('keydown', keyDown);

function keyDown(event) {
    //Up
    if (event.keyCode == 38) {
        if (yVelocity == 1)
            return;
        yVelocity = -1;
        xVelocity = 0;
    }

    //Down
    if (event.keyCode == 40) {
        if (yVelocity == -1)
            return;
        yVelocity = 1;
        xVelocity = 0;
    }

    //Left
    if (event.keyCode == 37) {
        if (xVelocity == 1)
            return;
        yVelocity = 0;
        xVelocity = -1;
    }

    //Right
    if (event.keyCode == 39) {
        if (xVelocity == -1)
            return;
        yVelocity = 0;
        xVelocity = 1;
    }
}

function SnakePart(x, y){
    this.x = x;
    this.y = y;
}

drawGame();

