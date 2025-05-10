const RadiusFactor = Math.PI / 180;
const canvasElement = document.getElementById("canvas");
const canvasContext2D = canvasElement.getContext("2d");
canvasElement.tabIndex = 1;
canvasElement.addEventListener("click", () => {
  switch (estado.atual) {
    case estado.preparese:
      estado.atual = estado.Play;
      audioSfxList.start.play();
      atualizarVisibilidadeDaBarra(); 
      break;
    case estado.Play:
      passaro.flap();
      break;
    case estado.fimDeJogo:
      estado.atual = estado.preparese;
      passaro.speed = 0;
      passaro.y = 100;
      tubo.pipes = [];
      interfaceControl.score.atual = 0;
      audioSfxList.played = false;
      atualizarVisibilidadeDaBarra(); 
      break;
  }
});

canvasElement.onkeydown = function keyDown(e) {
  if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38) {
    // Space Key or W key or arrow up
    switch (estado.atual) {
      case estado.preparese:
        estado.atual = estado.Play;
        audioSfxList.start.play();
        break;
      case estado.Play:
        passaro.flap();
        break;
      case estado.fimDeJogo:
        estado.atual = estado.preparese;
        passaro.speed = 0;
        passaro.y = 100;
        tubo.pipes = [];
        interfaceControl.score.atual = 0;
        audioSfxList.played = false;
        break;
    }
  }
};

let frames = 0;
let dx = 2;


const estado = {
  atual: 0,
  preparese: 0,
  Play: 1,
  fimDeJogo: 2,
};

const topbarElement = document.getElementById("topbar");

function atualizarVisibilidadeDaBarra() {
  if (estado.atual === estado.Play) {
    topbarElement.classList.add("hidden");
  } else {
    topbarElement.classList.remove("hidden");
  }
}


const audioSfxList = {
  start: new Audio(),
  flap: new Audio(),
  score: new Audio(),
  hit: new Audio(),
  die: new Audio(),
  played: false,
};
const pisoControl = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    this.y = parseFloat(canvasElement.height - this.sprite.height);
    canvasContext2D.drawImage(this.sprite, this.x, this.y);
  },
  update: function () {
    if (estado.atual != estado.Play) return;
    this.x -= dx;
    this.x = this.x % (this.sprite.width / 2);
  },
};
const backgroundControl = {
  sprite: new Image(),
  x: 0,
  y: 0,
  speed: 0.3,                             // pixels por frame
  get tileWidth() {                     // metade da largura total
    return this.sprite.width / 2;
  },
  draw: function (ctx) {
    // desenha duas vezes, em x e em x + tileWidth
    ctx.drawImage(this.sprite, this.x, this.y);              
    ctx.drawImage(this.sprite, this.x + this.tileWidth, this.y);
  },
  update: function () {
    if (estado.atual !== estado.Play) return;

    // move para a esquerda
    this.x -= this.speed;                                     

    // quando passou de –tileWidth, “wrap” de volta
    if (this.x <= -this.tileWidth) {
      this.x += this.tileWidth;                               
    }
  }
};


const clouds = {
  sprite: new Image(),
  x: 0,
  y: 0,
  speed: 0.1,                        // pixels por update
  tileWidth: 369,                  // metade de 738
  draw: function (ctx, canvasHeight) {
    debugger;
    // reposiciona verticalmente no pé da tela
    this.y = canvasHeight - this.sprite.height;  

    // desenha duas instâncias do sprite, side by side
    ctx.drawImage(this.sprite, this.x, this.y);  
    ctx.drawImage(this.sprite, this.x + this.tileWidth, this.y);
  },
  update: function () {
    if (estado.atual !== estado.Play) return;

    // avança para a esquerda
    this.x -= this.speed;  

    // quando passou de –tileWidth, reposiciona somando tileWidth
    if (this.x <= -this.tileWidth) {
      this.x += this.tileWidth;  
    }
  }
};


const tubo = {
  top: { sprite: new Image() },
  bot: { sprite: new Image() },
  gap: 95,
  moved: true,
  pipes: [],
  draw: function () {
    for (let i = 0; i < this.pipes.length; i++) {
      let p = this.pipes[i];
      canvasContext2D.drawImage(this.top.sprite, p.x, p.y);
      canvasContext2D.drawImage(
        this.bot.sprite,
        p.x,
        p.y + parseFloat(this.top.sprite.height) + this.gap
      );
    }
  },
  update: function () {
    if (estado.atual != estado.Play) return;
    if (frames % 100 == 0) {
      this.pipes.push({
        x: parseFloat(canvasElement.width),
        y: -210 * Math.min(Math.random() + 1, 1.8),
      });
    }
    this.pipes.forEach((tubo) => {
      tubo.x -= dx;
    });

    if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
      this.pipes.shift();
      this.moved = true;
    }
  },
};
const passaro = {
  animations: [
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
  ],
  rotatation: 0,
  x: 50,
  y: 100,
  speed: 0,
  gravity: 0.125,
  thrust: 3.6,
  frame: 0,
  draw: function () {
    if(this.frame == 4 && estado.atual != estado.fimDeJogo) 
    {
      this.frame = 0;
    }
    let h = this.animations[this.frame].sprite.height;
    let w = this.animations[this.frame].sprite.width;
    canvasContext2D.save();
    canvasContext2D.translate(this.x, this.y);
    canvasContext2D.rotate(this.rotatation * RadiusFactor);
    canvasContext2D.drawImage(this.animations[this.frame].sprite, -w / 2, -h / 2);
    canvasContext2D.restore();
  },
  update: function () {
    let r = parseFloat(this.animations[0].sprite.width) / 2;
    switch (estado.atual) {
      case estado.preparese:
        this.rotatation = 0;
        this.y += frames % 10 == 0 ? Math.sin(frames * RadiusFactor) : 0;
        this.frame += frames % 10 == 0 ? 1 : 0;
        break;
      case estado.Play:
        this.frame += frames % 5 == 0 ? 1 : 0;
        this.y += this.speed;
        this.setRotation();
        this.speed += this.gravity;
        if (this.y + r >= pisoControl.y || this.collisioned()) {
          estado.atual = estado.fimDeJogo;
        }

        break;
      case estado.fimDeJogo:
        this.frame = 4;
        if (this.y + r < pisoControl.y) {
          this.y += this.speed;
          this.setRotation();
          this.speed += this.gravity * 2;
        } else {
          this.speed = 0;
          this.y = pisoControl.y - r;
          this.rotatation = 90;
          if (!audioSfxList.played) {
            audioSfxList.die.play();
            audioSfxList.played = true;
          }
        }

        break;
    }
    this.frame = this.frame % this.animations.length;
  },
  flap: function () {
    if (this.y > 0) {
      audioSfxList.flap.play();
      this.speed = -this.thrust;
    }
  },
  setRotation: function () {
    if (this.speed <= 0) {
      this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust));
    } else if (this.speed > 0) {
      this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2));
    }
  },
  collisioned: function () {
    if (!tubo.pipes.length) return;
    let passaro = this.animations[4].sprite;
    let x = tubo.pipes[0].x;
    let y = tubo.pipes[0].y;
    let r = passaro.height / 4 + passaro.width / 4;
    let roof = y + parseFloat(tubo.top.sprite.height);
    let floor = roof + tubo.gap;
    let w = parseFloat(tubo.top.sprite.width);
    if (this.x + r >= x) {
      if (this.x + r < x + w) {
        if (this.y - r <= roof || this.y + r >= floor) {
          audioSfxList.hit.play();
          return true;
        }
      } else if (tubo.moved) {
        interfaceControl.score.atual++;
        audioSfxList.score.play();
        tubo.moved = false;
      }
    }
  },
};
const interfaceControl = {
  preparese: { sprite: new Image() },
  fimDeJogo: { sprite: new Image() },
  toque: [{ sprite: new Image() }, { sprite: new Image() }],
  score: {
    atual: 0,
    best: 0,
  },
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  frame: 0,
  draw: function () {
    switch (estado.atual) {
      case estado.preparese:
        this.y = parseFloat(canvasElement.height - this.preparese.sprite.height) / 2;
        this.x = parseFloat(canvasElement.width - this.preparese.sprite.width) / 2;
        this.tx = parseFloat(canvasElement.width - this.toque[0].sprite.width) / 2;
        this.ty =
          this.y + this.preparese.sprite.height - this.toque[0].sprite.height;
        canvasContext2D.drawImage(this.preparese.sprite, this.x, this.y);
        canvasContext2D.drawImage(this.toque[this.frame].sprite, this.tx, this.ty);
        break;
      case estado.fimDeJogo:
        this.y = parseFloat(canvasElement.height - this.fimDeJogo.sprite.height) / 2;
        this.x = parseFloat(canvasElement.width - this.fimDeJogo.sprite.width) / 2;
        this.tx = parseFloat(canvasElement.width - this.toque[0].sprite.width) / 2;
        this.ty =
          this.y + this.fimDeJogo.sprite.height - this.toque[0].sprite.height;
        canvasContext2D.drawImage(this.fimDeJogo.sprite, this.x, this.y);
        canvasContext2D.drawImage(this.toque[this.frame].sprite, this.tx, this.ty);
        break;
    }
    this.drawScore();
  },
  drawScore: function () {
    canvasContext2D.fillStyle = "#FFFFFF";
    canvasContext2D.strokeStyle = "#000000";
    switch (estado.atual) {
      case estado.Play:
        canvasContext2D.lineWidth = "2";
        canvasContext2D.font = "35px Squada One";
        canvasContext2D.fillText(this.score.atual, canvasElement.width / 2 - 5, 50);
        canvasContext2D.strokeText(this.score.atual, canvasElement.width / 2 - 5, 50);
        break;
      case estado.fimDeJogo:
        canvasContext2D.lineWidth = "2";
        canvasContext2D.font = "40px Squada One";
        let sc = `PONTOS :  ${this.score.atual}`;
        try {
          this.score.best = Math.max(
            this.score.atual,
            localStorage.getItem("best")
          );
          localStorage.setItem("best", this.score.best);
          let bs = `RECORDE  :  ${this.score.best}`;
          canvasContext2D.fillText(sc, canvasElement.width / 2 - 80, canvasElement.height / 2 + 0);
          canvasContext2D.strokeText(sc, canvasElement.width / 2 - 80, canvasElement.height / 2 + 0);
          canvasContext2D.fillText(bs, canvasElement.width / 2 - 80, canvasElement.height / 2 + 30);
          canvasContext2D.strokeText(bs, canvasElement.width / 2 - 80, canvasElement.height / 2 + 30);
        } catch (e) {
          canvasContext2D.fillText(sc, canvasElement.width / 2 - 85, canvasElement.height / 2 + 15);
          canvasContext2D.strokeText(sc, canvasElement.width / 2 - 85, canvasElement.height / 2 + 15);
        }

        break;
    }
  },
  update: function () {
    if (estado.atual == estado.Play) return;
    this.frame += frames % 10 == 0 ? 1 : 0;
    this.frame = this.frame % this.toque.length;
  },
};

pisoControl.sprite.src = "img/piso.png";
backgroundControl.sprite.src = "img/backGround.svg";
clouds.sprite.src = "img/Clouds.svg";
tubo.top.sprite.src = "img/tuboCima.png";
tubo.bot.sprite.src = "img/tuboBaixo.png";
interfaceControl.fimDeJogo.sprite.src = "img/fimDeJogo.svg";
interfaceControl.preparese.sprite.src = "img/Prepare‑se.svg";
interfaceControl.toque[0].sprite.src = "img/toque/t0.svg";
interfaceControl.toque[1].sprite.src = "img/toque/t1.svg";
passaro.animations[0].sprite.src = "img/passaro/P0.svg";
passaro.animations[1].sprite.src = "img/passaro/P1.svg";
passaro.animations[2].sprite.src = "img/passaro/P2.svg";
passaro.animations[3].sprite.src = "img/passaro/P0.svg";
passaro.animations[4].sprite.src = "img/passaro/PMorto.svg";
audioSfxList.start.src = "sfx/start.wav";
audioSfxList.flap.src = "sfx/flap.wav";
audioSfxList.score.src = "sfx/score.wav";
audioSfxList.hit.src = "sfx/hit.wav";
audioSfxList.die.src = "sfx/die.wav";

function loopDeJogo() {
  update();
  draw();
  frames++;
}

function update() {
  passaro.update();
  pisoControl.update();
  backgroundControl.update();
  clouds.update();
  tubo.update();
  interfaceControl.update();
}

function draw() {
  canvasContext2D.fillStyle = "#30c0df";
  canvasContext2D.fillRect(0, 0, canvasElement.width, canvasElement.height);

  backgroundControl.draw(canvasContext2D);
  debugger;
  clouds.draw(canvasContext2D, canvasElement.height);
  tubo.draw();

  passaro.draw();
  pisoControl.draw();
  interfaceControl.draw();
}

setInterval(loopDeJogo, 20);

function resizeCanvas() {
  const canvas = document.getElementById('canvas');
  const larguraOriginal = canvas.width;   
  const alturaOriginal = canvas.height;  

  let escala;
  if (window.innerWidth > window.innerHeight) {     
      escala = window.innerHeight / alturaOriginal;
  } else {
      escala = window.innerWidth / larguraOriginal;
  }

  canvas.style.width  = (larguraOriginal * escala) + 'px';
  canvas.style.height = (alturaOriginal * escala) + 'px';
}

window.addEventListener('load',   resizeCanvas);
window.addEventListener('resize', resizeCanvas);
