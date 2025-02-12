//------------------------------------VARIÁVEIS GLOBAIS--------------------------------------//

// Contador de tanques abatidos
let tanksDestroyed = 0;

// Array das explosões
const explosions = [];

// Variável de Explosão no jogador.
let playerExplosion = null;

// Variáveis para Audio
const backgroundMusic = new Audio("/assets/gamesound.mp3");
backgroundMusic.loop = true; // Faz a música tocar repetidamente
backgroundMusic.volume = 0.5; // Define um volume inicial (0.0 a 1.0)

const shootSound = new Audio("/assets/shot16bits.wav");
const ammoPickupSound = new Audio("/assets/get.mp3");
const gameOverSound = new Audio("/assets/gameover.mp3");
const hitSound = new Audio("/assets/gethit.mp3");
const explosionSound = new Audio("/assets/tankexplosion.mp3");
const victoryMusic = new Audio("/assets/victory.mp3");

// Botão para iniciar o Game
const startButton = document.getElementById("startButton");

//-------------------------------CARREGANDO E TRATANDO CANVAS E AS IMAGENS--------------------------------//

// Carregar a imagem de fundo
const backgroundImg = new Image();
backgroundImg.src = "/assets/background.png";

// Controle do fundo em movimento
let bgY = 0;
let bgSpeed = 2; // Velocidade do deslocamento do cenário

//Carregar imagem Explosão
const explosionImg = new Image();
explosionImg.src = "/assets/explosion.png";

// Carregar imagens dos tanques, balas e mísseis.
const soldierImg = new Image();
soldierImg.src = "/assets/tank_green.png";
const tankImg = new Image();
tankImg.src = "/assets/tank_red.png";
const bulletImg = new Image();
bulletImg.src = "/assets/bullet.png";
const missileImg = new Image();
missileImg.src = "/assets/missel.png";

// Configuração do canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 700;

//--------------------------------------------CRIANDO ELEMENTOS-----------------------------------//

// Criando o soldado (tanque verde)
const soldier = {
  x: canvas.width / 2 - 20, // Centralizado
  y: canvas.height - 60, // Posição fixa na parte inferior
  width: 60,
  height: 60,
  speed: 5,
};

// Movimento do soldado
const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});
window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// Evento para disparar quando pressionar a tecla de espaço
window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
  if (event.key === " " || event.key === "Enter") {
    // Espaço ou Enter para disparar
    shoot();
  }
});
window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// Lista de tanques (inimigos)
const tanks = [];
const tankWidth = 110;
const tankHeight = 110;
const tankSpeed = 5;
const maxTanks = 3; // Limite de tanques simultâneos

// Lista de balas coletáveis
const bullets = [];
const bulletWidth = 60;
const bulletHeight = 60;
const bulletSpeed = 3;

// Lista de mísseis disparados
const missiles = [];
const missileWidth = 100;
const missileHeight = 60;
const missileSpeed = 5;

// Criando o sistema de vidas e munição
let lives = 3;
let ammo = 0;

//---------------------------------------------FUNÇÕES DE DESENHO NO JOGO-------------------------------//

// Função para desenhar os objetos no jogo
function drawObjects() {
  // Desenhar o soldado
  ctx.drawImage(
    soldierImg,
    soldier.x,
    soldier.y,
    soldier.width,
    soldier.height
  );

  // Função para desenhar os tanques inimigos
  for (let i = 0; i < tanks.length; i++) {
    ctx.drawImage(
      tankImg,
      tanks[i].x,
      tanks[i].y,
      tanks[i].width,
      tanks[i].height
    );
  }

  // Função para desenhar as balas coletáveis
  for (let i = 0; i < bullets.length; i++) {
    ctx.drawImage(
      bulletImg,
      bullets[i].x,
      bullets[i].y,
      bullets[i].width,
      bullets[i].height
    );
  }
}

// Função para desenhar explosões temporárias
function drawExplosions() {
  const now = Date.now();

  for (let i = 0; i < explosions.length; i++) {
    const explosion = explosions[i];

    // Desenhar explosão na tela
    ctx.drawImage(
      explosionImg,
      explosion.x,
      explosion.y,
      explosion.width,
      explosion.height
    );

    // Remover explosões após 300ms
    if (now - explosion.time > 300) {
      explosions.splice(i, 1);
      i--;
    }
  }
}

function drawPlayerExplosion() {
  if (playerExplosion) {
    ctx.drawImage(
      explosionImg,
      playerExplosion.x,
      playerExplosion.y,
      playerExplosion.width,
      playerExplosion.height
    );

    // Remover explosão após 500ms
    if (Date.now() - playerExplosion.time > 500) {
      playerExplosion = null;
    }
  }
}

// Desenha o fundo
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
  ctx.drawImage(
    backgroundImg,
    0,
    bgY - canvas.height,
    canvas.width,
    canvas.height
  );
}

// Desenhar os disparos
function drawShots() {
  missiles.forEach((missile) =>
    ctx.drawImage(
      missileImg,
      missile.x,
      missile.y,
      missile.width,
      missile.height
    )
  );
}

//-------------------------------------FUNÇÕES DE SPAWN DE ELEMENTOS NA TELA-----------------------------------//

// Atualiza a posição do fundo
function updateBackground() {
  bgY += bgSpeed;
  if (bgY >= canvas.height) {
    bgY = 0;
  }
}

// Exibir vidas e munição na tela
function drawHUD() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Vidas: " + lives, 10, 30);
  ctx.fillText("Munição: " + ammo, 10, 60);
  ctx.fillText("Tanques abatidos: " + tanksDestroyed, 10, 90);
}

// Função para criar tanques inimigos
function spawnTank() {
  if (tanks.length < maxTanks) {
    let newX;
    let overlapping;

    do {
      newX = Math.random() * (canvas.width - tankWidth);
      overlapping = tanks.some((tank) => Math.abs(tank.x - newX) < tankWidth);
    } while (overlapping);

    const tank = {
      x: newX, // Posição horizontal aleatória sem sobreposição
      y: -tankHeight, // Começa fora da tela, no topo
      width: tankWidth,
      height: tankHeight,
      speed: tankSpeed,
    };
    tanks.push(tank);
  }
}

// Função para criar balas coletáveis
function spawnBullet() {
  let newX;
  let overlapping;

  do {
    newX = Math.random() * (canvas.width - bulletWidth);
    overlapping = tanks.some((tank) => Math.abs(tank.x - newX) < tankWidth);
  } while (overlapping);

  const bullet = {
    x: newX, // Posição horizontal aleatória sem sobreposição com tanques
    y: -bulletHeight, // Começa fora da tela, no topo
    width: bulletWidth,
    height: bulletHeight,
    speed: bulletSpeed,
  };
  bullets.push(bullet);
}

// Função para disparo dos mísseis.
function shoot() {
  if (ammo > 0) {
    const shot = {
      x: soldier.x + soldier.width / 2 - missileWidth / 2, // Disparo centralizado no soldado
      y: soldier.y - missileHeight, // Começa logo acima do soldado
      width: missileWidth,
      height: missileHeight,
      speed: missileSpeed,
    };
    missiles.push(shot);
    ammo--; // Diminui a quantidade de balas

    // Tocar som de tiro
    shootSound.currentTime = 0; // Reinicia o áudio caso esteja tocando
    shootSound.play();
  }
}

// Atualizar a posição dos disparos
function updateShots() {
  for (let i = 0; i < missiles.length; i++) {
    missiles[i].y -= missiles[i].speed; // Movimento para cima (reduzindo o Y)

    // Remover disparo quando sair da tela
    if (missiles[i].y + missiles[i].height < 0) {
      missiles.splice(i, 1);
      i--;
    }
  }
}

// Atualizar posição dos tanques e balas coletáveis
function updateObjects() {
  for (let i = 0; i < tanks.length; i++) {
    tanks[i].y += tanks[i].speed;

    // Remover tanque quando sair da tela
    if (tanks[i].y > canvas.height) {
      tanks.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y += bullets[i].speed;

    // Remover bala quando sair da tela
    if (bullets[i].y > canvas.height) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

// Atualizar posição do soldado
function updateSoldier() {
  if (keys["ArrowLeft"] && soldier.x > 0) {
    soldier.x -= soldier.speed;
  }
  if (keys["ArrowRight"] && soldier.x < canvas.width - soldier.width) {
    soldier.x += soldier.speed;
  }
}

//----------------------------------------FUNÇÕES DE MECÂNICA DE COLISÃO-------------------------------//

// Verificar colisões entre disparos e tanques
function checkShotCollisions() {
  for (let i = 0; i < missiles.length; i++) {
    for (let j = 0; j < tanks.length; j++) {
      if (checkCollision(missiles[i], tanks[j])) {
        explosionSound.currentTime = 0; // Reinicia o som para toques rápidos
        explosionSound.play(); // Toca o som da explosão

        explosions.push({
          x: tanks[j].x,
          y: tanks[j].y,
          width: tanks[j].width,
          height: tanks[j].height,
          time: Date.now(), // Marca o momento da explosão
        });

        // Remover tanque atingido
        tanks.splice(j, 1); // Remove o tanque atingido após a explosão
        j--;

        // Remover disparo
        missiles.splice(i, 1);
        i--;

        // Aumentar o contador de tanques abatidos
        tanksDestroyed++;

        // Verificar se o jogador venceu o jogo
        if (tanksDestroyed >= 20) {
          backgroundMusic.pause(); // Pausar música de fundo
          backgroundMusic.currentTime = 0;
          victoryMusic.play(); // Tocar som de Vitória

          setTimeout(() => {
            alert("Parabéns! Você destruiu 20 tanques!");
            document.location.reload();
          }, 500);
        }

        break; // Apenas um tanque pode ser atingido por disparo
      }
    }
  }
}

// Função de detecção de colisão
function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Verificar colisões com tanques e balas coletáveis
function checkCollisions() {
  for (let i = 0; i < tanks.length; i++) {
    if (checkCollision(soldier, tanks[i])) {
      lives--; // Reduz uma vida
      tanks.splice(i, 1);
      i--;

      // Tocar som de impacto ao ser atingido
      hitSound.currentTime = 0; // Reinicia o áudio caso esteja tocando
      hitSound.play();

      // Criar explosão na posição do jogador
      playerExplosion = {
        x: soldier.x,
        y: soldier.y,
        width: soldier.width,
        height: soldier.height,
        time: Date.now(),
      };

      // Se vidas chegarem a zero, Game Over
      if (lives <= 0) {
        backgroundMusic.pause(); // Pausar música de fundo
        gameOverSound.play(); // Tocar som de Game Over

        setTimeout(() => {
          alert("Game Over! Tente novamente.");
          document.location.reload();
        }, 1000);
      }
    }
  }

  for (let i = 0; i < bullets.length; i++) {
    if (checkCollision(soldier, bullets[i])) {
      ammo++; // Aumenta a munição
      bullets.splice(i, 1);
      i--;

      // Tocar som de coleta de munição
      ammoPickupSound.currentTime = 0; // Reinicia o áudio caso esteja tocando
      ammoPickupSound.play();

      if (ammo >= 20) {
        backgroundMusic.pause(); // Pausar música de fundo
        backgroundMusic.currentTime = 0;
        victoryMusic.play(); // Tocar som de Vitória
        setTimeout(() => {
          alert("Parabéns! Você coletou 20 mísseis!");
          document.location.reload();
        }, 500);
      }
    }
  }
}

//-------------------------------------------CHAMADAS PRINCIPAIS DO JOGO-------------------------------------//

// Loop do jogo
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateBackground();
  drawBackground();
  updateSoldier();
  updateObjects();
  updateShots(); // Atualiza os tiros
  checkCollisions();
  checkShotCollisions(); // Verificar colisões dos disparos
  drawObjects();
  drawExplosions();
  drawPlayerExplosion();
  drawShots(); // Desenhar os disparos
  drawHUD();

  requestAnimationFrame(gameLoop);
}

// Adicionar um novo tanque e munição periodicamente
setInterval(spawnTank, 500);
setInterval(spawnBullet, 3000);

startButton.addEventListener("click", function () {
  startButton.style.display = "none"; // Esconde o botão
  backgroundMusic.play(); // Inicia a música de fundo
  gameLoop(); // Inicia o jogo
});
