(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("startBtn");

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 96;

  // 物理参数：让起跳更干脆、下落更有重量，但不至于太难控
  const GRAVITY = 0.24;
  const FLAP = -4.9;
  const MAX_FALL_SPEED = 6.8;
  const MAX_RISE_SPEED = -5.6;
  const PIPE_W = 56;
  const GAP = 164;
  const PIPE_INTERVAL = 138;
  const SPEED = 1.78;

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
    pipes.push({ x: W, top: getPipeTop(), passed: false });
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
    // overlay 内容会被替换，所以这里重新绑定一次按钮
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
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    flap();
  });
  startBtn.addEventListener("click", start);

  function getPipeTop() {
    const margin = 50;
    const minTop = margin;
    const maxTop = GROUND_Y - GAP - margin;
    return minTop + Math.random() * (maxTop - minTop);
  }

  function isBirdHitPipe(p) {
    return (
      bird.x + bird.r > p.x &&
      bird.x - bird.r < p.x + PIPE_W &&
      (bird.y - bird.r < p.top || bird.y + bird.r > p.top + GAP)
    );
  }

  function drawBird() {
    const r = bird.r;
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rot);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    // 耳朵
    ctx.fillStyle = "#f7a8c4";
    ctx.beginPath();
    ctx.ellipse(-r * 0.55, -r * 0.7, r * 0.32, r * 0.42, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.35, -r * 0.8, r * 0.32, r * 0.42, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 头
    ctx.fillStyle = "#f7a8c4";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 猪鼻
    ctx.fillStyle = "#ef8aae";
    ctx.beginPath();
    ctx.ellipse(r * 0.55, r * 0.1, r * 0.45, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 鼻孔
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(r * 0.45, r * 0.1, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.7, r * 0.1, r * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(r * 0.28, -r * 0.35, r * 0.13, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawPipes() {
    ctx.fillStyle = "#5bbf3a";
    ctx.strokeStyle = "#3c8a26";
    ctx.lineWidth = 2;
    for (const p of pipes) {
      const bottomY = p.top + GAP;
      const pipeBottomH = GROUND_Y - bottomY;

      // 上、下管道与管口分开绘制，避免重复计算
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.strokeRect(p.x, 0, PIPE_W, p.top);
      ctx.fillRect(p.x, bottomY, PIPE_W, pipeBottomH);
      ctx.strokeRect(p.x, bottomY, PIPE_W, pipeBottomH);
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
    bird.vy = Math.min(MAX_FALL_SPEED, bird.vy + GRAVITY);
    bird.vy = Math.max(MAX_RISE_SPEED, bird.vy);
    bird.y += bird.vy;
    bird.rot = Math.max(-0.55, Math.min(1.45, bird.vy / 10));

    if (frame % PIPE_INTERVAL === 0) {
      spawnPipe();
    }

    for (const p of pipes) {
      p.x -= SPEED;
      if (!p.passed && p.x + PIPE_W < bird.x) {
        p.passed = true;
        score++;
      }
      if (isBirdHitPipe(p)) {
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
