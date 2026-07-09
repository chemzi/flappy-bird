(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("startBtn");

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 96;

  // 物理参数（已调低难度，更适合休闲游玩）
  const GRAVITY = 0.30; // 重力：更小，下落更慢
  const FLAP = -6.5;    // 拍翅：力度更柔和，滞空更久
  const PIPE_W = 56;
  const GAP = 165;      // 管道缝隙：更宽
  const PIPE_INTERVAL = 140; // 帧数：管道更稀疏
  const SPEED = 1.6;    // 移动速度：更慢

  const bird = {
    x: 90,
    y: H / 2,
    r: 14,
    vy: 0,
    rot: 0,
  };

  let pipes = [];
  let frame = 0;
  let score = 0;
  let best = Number(localStorage.getItem("flappyBest") || 0);
  let state = "ready"; // ready | playing | dead

  function reset() {
    bird.y = H / 2;
    bird.vy = 0;
    bird.rot = 0;
    pipes = [];
    frame = 0;
    score = 0;
    state = "ready";
  }

  function spawnPipe() {
    const margin = 50;
    const minTop = margin;
    const maxTop = GROUND_Y - GAP - margin;
    const top = minTop + Math.random() * (maxTop - minTop);
    pipes.push({ x: W, top, passed: false });
  }

  function flap() {
    if (state === "ready") {
      state = "playing";
      hideOverlay();
    }
    if (state === "playing") {
      bird.vy = FLAP;
    }
  }

  function showOverlay(html) {
    overlay.innerHTML = html;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
    overlay.innerHTML = "";
  }

  function die() {
    state = "dead";
    if (score > best) {
      best = score;
      localStorage.setItem("flappyBest", String(best));
    }
    showOverlay(
      `<h1>GAME OVER</h1>
       <div class="score-big">${score}</div>
       <p class="best">最高分: ${best}</p>
       <button id="startBtn">再来一次</button>`
    );
    document.getElementById("startBtn").addEventListener("click", start);
  }

  function start() {
    reset();
    flap();
  }

  // 输入
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      flap();
    }
  });
  canvas.addEventListener("mousedown", flap);
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    flap();
  }, { passive: false });
  startBtn.addEventListener("click", start);

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rot);
    // 身体
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath();
    ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    // 翅膀
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-4, 4, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 眼睛
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(7, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(9, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // 嘴
    ctx.fillStyle = "#ff7f2a";
    ctx.beginPath();
    ctx.moveTo(bird.r - 2, -2);
    ctx.lineTo(bird.r + 8, 0);
    ctx.lineTo(bird.r - 2, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPipes() {
    ctx.fillStyle = "#5bbf3a";
    ctx.strokeStyle = "#3c8a26";
    ctx.lineWidth = 2;
    for (const p of pipes) {
      // 上管道
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.strokeRect(p.x, 0, PIPE_W, p.top);
      // 下管道
      const bottomY = p.top + GAP;
      ctx.fillRect(p.x, bottomY, PIPE_W, GROUND_Y - bottomY);
      ctx.strokeRect(p.x, bottomY, PIPE_W, GROUND_Y - bottomY);
      // 管口
      ctx.fillRect(p.x - 4, p.top - 18, PIPE_W + 8, 18);
      ctx.strokeRect(p.x - 4, p.top - 18, PIPE_W + 8, 18);
      ctx.fillRect(p.x - 4, bottomY, PIPE_W + 8, 18);
      ctx.strokeRect(p.x - 4, bottomY, PIPE_W + 8, 18);
    }
  }

  function drawGround() {
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = "#c9b96f";
    ctx.fillRect(0, GROUND_Y, W, 6);
    ctx.fillStyle = "#5bbf3a";
    ctx.fillRect(0, GROUND_Y + 6, W, 4);
  }

  function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(String(score), W / 2, 80);
    ctx.fillText(String(score), W / 2, 80);
  }

  function update() {
    if (state !== "playing") return;
    frame++;
    bird.vy += GRAVITY;
    bird.y += bird.vy;
    bird.rot = Math.max(-0.4, Math.min(1.4, bird.vy / 12));

    if (frame % PIPE_INTERVAL === 0) spawnPipe();

    for (const p of pipes) {
      p.x -= SPEED;
      if (!p.passed && p.x + PIPE_W < bird.x) {
        p.passed = true;
        score++;
      }
      // 碰撞检测
      if (
        bird.x + bird.r > p.x &&
        bird.x - bird.r < p.x + PIPE_W &&
        (bird.y - bird.r < p.top || bird.y + bird.r > p.top + GAP)
      ) {
        die();
      }
    }
    pipes = pipes.filter((p) => p.x + PIPE_W > -10);

    // 撞地 / 飞出顶部
    if (bird.y + bird.r >= GROUND_Y) {
      bird.y = GROUND_Y - bird.r;
      die();
    }
    if (bird.y - bird.r < 0) {
      bird.y = bird.r;
      bird.vy = 0;
    }
  }

  function loop() {
    update();
    ctx.clearRect(0, 0, W, H);
    drawPipes();
    drawGround();
    drawBird();
    if (state === "playing" || state === "dead") drawScore();
    requestAnimationFrame(loop);
  }

  reset();
  loop();
})();
