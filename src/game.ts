// Ensure this TypeScript file is compiled to JavaScript and linked in the HTML
import './style.css'

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// looool
// TypeScript code for the Flappy Bird clone

// Constants for game configuration
const GRAVITY = 0.25;
const FLAP_STRENGTH = -4.5;
const PIPE_WIDTH = 50;
const PIPE_INTERVAL = 1900;
const PIPE_GAP = 150;


// Bird class
class Bird {
    x: number; 
    y: number;
    width: number;
    height: number;
    velocity: number;
    image: HTMLImageElement;


    draw() {
        // Dibujamos la imagen en lugar de un bloque amarillo
        ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2  , this.width, this.height);
    }

    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.width = 20;
        this.height = 20;
        this.velocity = 0;
        this.image = new Image();
        this.image.src = 'coco.png'; // Asegúrate de usar la ruta correcta
        this.image.onload = () => {
            // Ajustar el tamaño de la caja de colisión del pájaro según la imagen y la escala
            this.width = this.image.width * 0.12;
            this.height = this.image.height * 0.12;
        }
    }

    /* draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    } */

    checkCollision(pipe: Pipe): boolean {
        const dx = this.x - Math.max(pipe.x, Math.min(this.x, pipe.x + PIPE_WIDTH));
        const dy = this.y - Math.max((pipe.top ? 0 : canvas.height - pipe.height), Math.min(this.y, (pipe.top ? pipe.height : canvas.height)));
        return (dx * dx + dy * dy) < (this.width / 2) * (this.width / 2);
    }

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;

        if (this.y + this.height / 2 >= canvas.height) {
            gameOver();
        }
    }

    flap() {
        this.velocity = FLAP_STRENGTH;
    }
}

// Pipe class
class Pipe {
    x: number;
    height: number;
    top: boolean;
    passed : boolean

    constructor(x: number, height: number, top: boolean) {
        this.x = x;
        this.height = height;
        this.top = top;
        this.passed = false; 
    }

    draw() {
        ctx.fillStyle = 'green';
        if (this.top) {
            ctx.fillRect(this.x, 0, PIPE_WIDTH, this.height);
        } else {
            ctx.fillRect(this.x, canvas.height - this.height, PIPE_WIDTH, this.height);
        }
    }

    update() {
        this.x -= 3;

        if (this.x + PIPE_WIDTH < 0) {
            return true; // Pipe is out of canvas
        }

        return false;
    }
}

// Game variables
let bird = new Bird();
let pipes: Pipe[] = [];
let score = 0;

function resetGame() {
    document.getElementById('gameOver').style.display = 'none';  
    bird = new Bird();
    pipes = [];
    score = 0;
    lastPipeTime = 0;
    counter = true;
/*   */
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.draw();
    pipes.forEach(pipe => pipe.draw());
    document.getElementById('score').innerText = `${score}`;
}

function update() {
    bird.update();
    pipes = pipes.filter(pipe => {
        const outOfBounds = pipe.update();
        if (!outOfBounds && !pipe.passed && pipe.x < bird.x) {
            // Si el pájaro pasa el tubo sin colisionar, incrementamos el puntaje
            pipe.passed = true; // Marcamos la tubería como pasada
            if (pipe.top && counter) {
                score++; // Incrementamos el puntaje solo una vez por par de tuberías
                document.getElementById('score').innerText = `${score}`;
            }
        }
        return !outOfBounds;
    });
}

function gameOver() {
    counter = false;
    document.getElementById('gameOver').style.display = 'block';
}
function detectCollision() {
    pipes.forEach(pipe => {
        if (bird.checkCollision(pipe)) {
            gameOver();
        }
    });
}

function generatePipes() {
    // Calculamos el espacio máximo que una tubería puede ocupar, teniendo en cuenta el GAP
    const maxPipeHeight = canvas.height - PIPE_GAP;
    // Definimos un margen mínimo desde el suelo y el techo para las tuberías
    const pipeEndMargin = 20; // margen mínimo en pixeles
    // La altura de la tubería superior se elige al azar, respetando los márgenes
    const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - 2 * pipeEndMargin)) + pipeEndMargin;
    // La altura de la tubería inferior se calcula en base a la altura de la tubería superior y el GAP
    const bottomPipeHeight = maxPipeHeight - topPipeHeight;

    pipes.push(new Pipe(canvas.width, topPipeHeight, true)); // Tubo superior
    pipes.push(new Pipe(canvas.width, bottomPipeHeight, false)); // Tubo inferior
}

let counter = true;
let lastPipeTime = 0;
function gameLoop(timestamp: number) {
    const deltaTime = timestamp - lastPipeTime;
    if (deltaTime > PIPE_INTERVAL) {
        generatePipes();
        lastPipeTime = timestamp;
    }
    update();
    draw();
    detectCollision();

    requestAnimationFrame(gameLoop);
}

function resizeGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeGame);
resizeGame();

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        bird.flap();
    }
    if (!counter)
        resetGame(); 
});

document.getElementById('gameOver').addEventListener('click', () => {
    
    resetGame();
    //gameLoop();
});

//resetGame();
gameLoop();