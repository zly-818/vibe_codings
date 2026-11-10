  /* ---------- 1. 飘落花瓣 ---------- */
  (function makePetals() {
    var colors = ['#CBB8F0', '#F2C6D6', '#A9C4EC', '#B9E2D0', '#F5C08A', '#E2A7C3'];
    var box = document.getElementById('petals');
    for (var i = 0; i < 20; i++) {
      var p = document.createElement('span');
      p.className = 'petal';
      var s = 6 + Math.random() * 9;
      p.style.width = s + 'px';
      p.style.height = (s * 1.4) + 'px';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--drift', (Math.random() * 180 - 90) + 'px');
      p.style.animationDuration = (9 + Math.random() * 11) + 's';
      p.style.animationDelay = (Math.random() * 12) + 's';
      p.style.opacity = 0.5 + Math.random() * 0.4;
      box.appendChild(p);
    }
  })();

  /* ---------- 2. 分屏切换 ---------- */
  var screens = document.querySelectorAll('.screen');
  var dotsBox = document.getElementById('dots');
  var current = 0;

  screens.forEach(function () {
    var d = document.createElement('span');
    d.className = 'dot';
    dotsBox.appendChild(d);
  });
  var dots = dotsBox.querySelectorAll('.dot');

  function goTo(i) {
    if (i < 0 || i >= screens.length) return;
    screens[current].classList.remove('active');
    current = i;
    screens[current].classList.add('active');
    dots.forEach(function (d, idx) { d.classList.toggle('active', idx === current); });
    if (current === 5) { startDanmaku(); } else { stopDanmaku(); }  // 弹幕雨
    refreshNav();
    window.scrollTo(0, 0);
  }

  /* ---------- 右上角 返回 ---------- */
  var backBtn = document.getElementById('backBtn');

  function canNext() {
    if (current === 1) return lit === 0;                             // 蛋糕：吹灭所有蜡烛才能继续
    if (current === 4) return envelope.classList.contains('open');  // 信封：打开后才能继续
    if (current === 6) return false;                                // 最后一屏（按钮页）
    return true;
  }
  function refreshNav() {
    backBtn.disabled = (current === 0);
  }
  function advance() {
    if (!canNext()) return;
    goTo(current + 1);
  }
  function goBack() {
    if (current > 0) goTo(current - 1);
  }
  backBtn.addEventListener('click', function (e) { e.stopPropagation(); goBack(); });

  /* ---------- 音乐开关 ---------- */
  var musicBtn = document.getElementById('musicBtn');
  var bgm = document.getElementById('bgm');
  var LOOP_START = 2.84;   // "嘿嘿"说完、音乐开始的时间点(秒)，循环时跳过前面的"嘿嘿"

  function setPlaying(on) {
    musicBtn.classList.toggle('playing', on);
    musicBtn.classList.toggle('paused', !on);
  }
  function startMusic() {
    if (!bgm.paused) return;               // 已经在播就不重复
    var p = bgm.play();
    if (p && p.then) {
      p.then(function () { setPlaying(true); })
       .catch(function () { /* 音乐文件还没放进文件夹，或浏览器暂禁自动播放，保持原样 */ });
    } else {
      setPlaying(true);
    }
  }
  function stopMusic() {
    bgm.pause();
    setPlaying(false);
  }
  function toggleMusic() {
    if (bgm.paused) startMusic(); else stopMusic();
  }
  musicBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMusic();
  });

  // 播到结尾时：跳过开头"嘿嘿"，从音乐开始处循环
  bgm.addEventListener('ended', function () {
    bgm.currentTime = LOOP_START;
    bgm.play();
  });

  // 进入页面自动播放：先直接尝试一次；浏览器若禁止"零交互自动放声"，就借第一次点击（点"点我进入"弹窗）再启动
  startMusic();
  function autoPlayOnce() {
    startMusic();
    document.removeEventListener('click', autoPlayOnce);
    document.removeEventListener('keydown', autoPlayOnce);
    document.removeEventListener('touchstart', autoPlayOnce);
  }
  document.addEventListener('click', autoPlayOnce);
  document.addEventListener('keydown', autoPlayOnce);
  document.addEventListener('touchstart', autoPlayOnce);

  /* ---------- 3. 吹蜡烛 ---------- */
  var candles = document.querySelectorAll('.candle');
  var lit = candles.length;
  var statusEl = document.getElementById('candleStatus');

  function updateStatus() {
    if (lit > 0) statusEl.textContent = '还剩 ' + lit + ' 根蜡烛，点蜡烛吹灭 🕯️';
    else statusEl.textContent = '蜡烛都吹灭啦，点一下继续 🎉';
    refreshNav();
  }
  candles.forEach(function (c) {
    c.addEventListener('click', function (e) {
      e.stopPropagation();               // 点蜡烛不触发整屏跳转
      if (c.classList.contains('out')) return;
      c.classList.add('out');
      lit--;
      updateStatus();
    });
  });

  /* ---------- 4. 信封打开 ---------- */
  var envelope = document.getElementById('envelope');
  envelope.addEventListener('click', function (e) {
    if (!this.classList.contains('open')) {
      this.classList.add('open');
      refreshNav();                       // 打开后即可点一下继续
      e.stopPropagation();               // 第一次点：打开信封，不跳转
    }
    // 已打开时不拦截，事件冒泡到屏幕触发跳转
  });

  /* ---------- 6. 点击整屏跳转 ---------- */
  screens.forEach(function (screen) {
    screen.addEventListener('click', advance);
  });

  function resetHome() {
    candles.forEach(function (c) { c.classList.remove('out'); });
    lit = candles.length;
    updateStatus();
    envelope.classList.remove('open');
    goTo(0);
  }
  document.getElementById('homeBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    resetHome();
  });

  /* ---------- 7. 弹幕雨 ---------- */
  var dmBox = document.getElementById('danmaku');
  // ✏️ 在这里改：弹幕内容（一句一条，可随意增删）
  var dmMessages = [
    '小袁 21 岁生日快乐！🎂', '天天开心！', '万事胜意！', '越来越美！',
    '暴富！', '岁岁平安！', '朱璐瑶永远爱你 🥰', '许的愿望都实现！',
    '生日快乐！', '要一直幸福呀！', '新的一岁更棒！', '🥳🥳🥳'
  ];
  var dmColors = ['#C87FA9', '#8B7BD0', '#6FA8D8', '#7FC4AE', '#F5C08A', '#F7D98C'];
  var dmTimer = null;

  function spawnDm() {
    var el = document.createElement('div');
    el.className = 'dm';
    el.textContent = dmMessages[(Math.random() * dmMessages.length) | 0];
    el.style.top = (Math.random() * 88) + '%';
    el.style.color = dmColors[(Math.random() * dmColors.length) | 0];
    el.style.animationDuration = (7 + Math.random() * 6) + 's';
    dmBox.appendChild(el);
    el.addEventListener('animationend', function () { el.remove(); });
  }
  function startDanmaku() {
    stopDanmaku();
    for (var i = 0; i < 6; i++) spawnDm();          // 先来一波
    dmTimer = setInterval(spawnDm, 260);
  }
  function stopDanmaku() {
    if (dmTimer) clearInterval(dmTimer);
    dmTimer = null;
    dmBox.innerHTML = '';                            // 清掉已出现的弹幕
  }

  /* ---------- 8. 最后按钮页 + 沙瓶小游戏 + 五子棋 ---------- */
  var sandOverlay = document.getElementById('sandOverlay');
  var gomokuOverlay = document.getElementById('gomokuOverlay');
  var needleOverlay = document.getElementById('needleOverlay');

  document.getElementById('sandGameBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    sandOverlay.classList.add('active');
    drawSand();
  });
  document.getElementById('gomokuBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    gomokuOverlay.classList.add('active');
    drawGomoku();
  });
  document.getElementById('needleBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    needleOverlay.classList.add('active');
    needleInit();
    startNeedleLoop();
  });
  function closeOverlays() {
    sandOverlay.classList.remove('active');
    gomokuOverlay.classList.remove('active');
    needleOverlay.classList.remove('active');
    stopSandPour();
    stopNeedleLoop();
  }
  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', closeOverlays);
  });
  [sandOverlay, gomokuOverlay, needleOverlay].forEach(function (ov) {
    ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlays(); });
  });

  /* 沙瓶小游戏 */
  var sandCanvas = document.getElementById('sandCanvas');
  var sctx = sandCanvas.getContext('2d');
  var sandColors = ['#E5756F', '#F3AB70', '#F7D98C', '#9CC9B4', '#A9C4EC', '#CBB8F0', '#C87FA9', '#FE97A8', '#FFFFFF', '#FAEEDF'];
  var sandPalette = document.getElementById('sandPalette');
  var sandColor = sandColors[0];
  var sandPouring = false;
  var sandRaf = null;
  var BX = 30, BY = 20, BW = 240, BH = 360;
  var COLW = 3, NCOL = Math.floor(BW / COLW), SLOPE = 2;
  var MAXAREA = BW * BH * 0.82;      // 装满上限（面积）
  var cols = [];                     // cols[i] = [{c,h},...] 自下而上的沙层
  for (var ci = 0; ci < NCOL; ci++) cols.push([]);
  var pourCol = Math.floor(NCOL / 2), pourX = BX + BW / 2;   // 注沙口位置(跟随手指)

  sandColors.forEach(function (c, i) {
    var d = document.createElement('span');
    d.className = 'sand-color' + (i === 0 ? ' active' : '');
    d.style.background = c;
    d.addEventListener('click', function (e) {
      e.stopPropagation();
      sandColor = c;
      sandPalette.querySelectorAll('.sand-color').forEach(function (el) { el.classList.remove('active'); });
      d.classList.add('active');
    });
    sandPalette.appendChild(d);
  });

  function colH(i) {
    var t = 0;
    cols[i].forEach(function (l) { t += l.h; });
    return t;
  }
  function sandArea() {
    var t = 0;
    for (var i = 0; i < NCOL; i++) t += colH(i);
    return t * COLW;
  }
  function addSand(i, c, amt) {
    var st = cols[i], top = st[st.length - 1];
    if (top && top.c === c) top.h += amt;
    else st.push({ c: c, h: amt });
  }
  // 在注口附近铺成小丘（中心多、两侧少）
  function deposit(c, totalH) {
    var W = [0.34, 0.22, 0.11];
    for (var k = -2; k <= 2; k++) {
      var i = c + k;
      if (i < 0 || i >= NCOL) continue;
      addSand(i, sandColor, totalH * W[Math.abs(k)]);
    }
  }
  // 相邻列坡度超过 SLOPE 时，把高处的沙搬到低处，让沙自然摊平
  function move(from, to, amt) {
    var st = cols[from];
    while (amt > 0.01 && st.length) {
      var top = st[st.length - 1];
      var take = Math.min(top.h, amt);
      top.h -= take;
      amt -= take;
      if (top.h <= 0.01) st.pop();
      addSand(to, top.c, take);
    }
  }
  function relax() {
    for (var it = 0; it < 7; it++) {
      for (var i = 0; i < NCOL - 1; i++) {
        var d = colH(i) - colH(i + 1);
        if (d > SLOPE) move(i, i + 1, Math.min((d - SLOPE) / 2, 4));
        else if (d < -SLOPE) move(i + 1, i, Math.min((-d - SLOPE) / 2, 4));
      }
    }
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  // 沙子颗粒纹理（一次性生成，让沙看起来有颗粒感）
  var grain = document.createElement('canvas');
  grain.width = grain.height = 72;
  (function () {
    var g = grain.getContext('2d');
    var img = g.createImageData(72, 72);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 64 + ((Math.random() * 128) | 0);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  })();
  var grainPat = sctx.createPattern(grain, 'repeat');

  function drawSand() {
    var W = sandCanvas.width, H = sandCanvas.height;
    sctx.clearRect(0, 0, W, H);
    // 玻璃瓶底
    sctx.fillStyle = 'rgba(255,255,255,0.55)';
    roundRect(sctx, BX, BY, BW, BH, 26); sctx.fill();
    // 沙画在瓶子内部（圆角裁剪，底部不会溢出瓶外）
    sctx.save();
    roundRect(sctx, BX, BY, BW, BH, 26); sctx.clip();
    var i, j;
    // 1) 逐列画各层底色
    for (i = 0; i < NCOL; i++) {
      var x = BX + i * COLW;
      var yy = BY + BH;
      for (j = 0; j < cols[i].length; j++) {
        var L = cols[i][j];
        yy -= L.h;
        sctx.fillStyle = L.c;
        sctx.fillRect(x - 0.4, yy, COLW + 0.8, L.h + 0.8);
      }
    }
    // 2) 沿着沙面轮廓：明暗渐变 + 真沙颗粒
    sctx.save();
    sctx.beginPath();
    sctx.moveTo(BX, BY + BH);
    sctx.lineTo(BX, BY + BH - colH(0));
    for (i = 0; i < NCOL; i++) {
      sctx.lineTo(BX + (i + 0.5) * COLW, BY + BH - colH(i));
    }
    sctx.lineTo(BX + BW, BY + BH - colH(NCOL - 1));
    sctx.lineTo(BX + BW, BY + BH);
    sctx.closePath();
    sctx.clip();
    var grd = sctx.createLinearGradient(0, BY, 0, BY + BH);
    grd.addColorStop(0, 'rgba(255,255,255,0.10)');
    grd.addColorStop(1, 'rgba(0,0,0,0.12)');
    sctx.fillStyle = grd;
    sctx.fillRect(BX, BY, BW, BH);
    sctx.globalAlpha = 0.4;
    sctx.globalCompositeOperation = 'overlay';
    sctx.fillStyle = grainPat;
    sctx.fillRect(BX, BY, BW, BH);
    sctx.globalAlpha = 1;
    sctx.globalCompositeOperation = 'source-over';
    sctx.restore();
    // 3) 倒沙的流（跟随手指，落在沙面上）
    if (sandPouring) {
      var surfY = BY + BH - colH(pourCol);
      sctx.globalAlpha = 0.85;
      sctx.fillStyle = sandColor;
      sctx.fillRect(pourX - 2, BY + 2, 4, Math.max(0, surfY - BY - 4));
      sctx.globalAlpha = 1;
    }
    sctx.restore();
    // 玻璃描边 + 高光
    sctx.strokeStyle = 'rgba(94,84,112,0.35)';
    sctx.lineWidth = 3;
    roundRect(sctx, BX, BY, BW, BH, 26); sctx.stroke();
    sctx.fillStyle = 'rgba(255,255,255,0.4)';
    roundRect(sctx, BX + 9, BY + 9, 14, BH - 18, 7); sctx.fill();
  }
  var pourLast = 0;
  function sandPourLoop(ts) {
    if (!sandPouring) return;
    if (!pourLast) pourLast = ts;
    var dt = Math.min((ts - pourLast) / 1000, 0.05);   // 秒，上限防跳帧
    pourLast = ts;
    if (sandArea() >= MAXAREA) { sandPouring = false; drawSand(); return; }
    deposit(pourCol, 1100 * dt);                       // 慢慢倒：约 20 秒装满
    relax();
    drawSand();
    sandRaf = requestAnimationFrame(sandPourLoop);
  }
  function startSandPour() {
    sandPouring = true;
    pourLast = 0;
    cancelAnimationFrame(sandRaf);
    sandRaf = requestAnimationFrame(sandPourLoop);
  }
  function stopSandPour() {
    sandPouring = false;
    cancelAnimationFrame(sandRaf);
    drawSand();
  }
  function setPourPos(e) {
    var rect = sandCanvas.getBoundingClientRect();
    var cx = (e.clientX - rect.left) * (sandCanvas.width / rect.width);
    pourX = Math.max(BX + 2, Math.min(BX + BW - 2, cx));
    pourCol = Math.max(0, Math.min(NCOL - 1, Math.floor((pourX - BX) / COLW)));
  }
  sandCanvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { sandCanvas.setPointerCapture(e.pointerId); } catch (err) {}
    setPourPos(e);
    startSandPour();
  });
  sandCanvas.addEventListener('pointermove', function (e) {
    if (sandPouring) setPourPos(e);      // 手指移到哪，沙就倒到哪
  });
  sandCanvas.addEventListener('pointerup', stopSandPour);
  sandCanvas.addEventListener('pointercancel', stopSandPour);

  document.getElementById('sandClear').addEventListener('click', function (e) {
    e.stopPropagation();
    for (var i = 0; i < NCOL; i++) cols[i].length = 0;
    drawSand();
  });

  drawSand();   // 初始画一个空瓶子

  /* ---------- 9. 双人五子棋 ---------- */
  var gomokuCanvas = document.getElementById('gomokuCanvas');
  var gctx = gomokuCanvas.getContext('2d');
  var gomokuTurn = document.getElementById('gomokuTurn');
  var GSIZE = 15, GCELL = 26, GPAD = 28;
  var gBoard = [], gTurn = 1, gOver = false;

  function gomokuInit() {
    gBoard = [];
    for (var r = 0; r < GSIZE; r++) {
      var rowArr = [];
      for (var c = 0; c < GSIZE; c++) rowArr.push(0);
      gBoard.push(rowArr);
    }
    gTurn = 1;
    gOver = false;
    gomokuTurn.textContent = '⚫ 黑棋先下 · 点击棋盘落子';
  }
  function gomokuWin(row, col, p) {
    var dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (var d = 0; d < 4; d++) {
      var cnt = 1, dr = dirs[d][0], dc = dirs[d][1];
      for (var s = -1; s <= 1; s += 2) {
        var r = row + dr * s, c = col + dc * s;
        while (r >= 0 && r < GSIZE && c >= 0 && c < GSIZE && gBoard[r][c] === p) {
          cnt++; r += dr * s; c += dc * s;
        }
      }
      if (cnt >= 5) return true;
    }
    return false;
  }
  function drawGomoku() {
    var W = gomokuCanvas.width, H = gomokuCanvas.height;
    gctx.clearRect(0, 0, W, H);
    gctx.fillStyle = '#F3D9A4';
    gctx.fillRect(0, 0, W, H);
    gctx.strokeStyle = 'rgba(120,80,40,0.75)';
    gctx.lineWidth = 1.5;
    var end = GPAD + (GSIZE - 1) * GCELL, i;
    for (i = 0; i < GSIZE; i++) {
      var p = GPAD + i * GCELL;
      gctx.beginPath(); gctx.moveTo(GPAD, p); gctx.lineTo(end, p); gctx.stroke();
      gctx.beginPath(); gctx.moveTo(p, GPAD); gctx.lineTo(p, end); gctx.stroke();
    }
    var stars = [[3, 3], [3, 11], [11, 3], [11, 11], [7, 7]];
    gctx.fillStyle = 'rgba(120,80,40,0.8)';
    stars.forEach(function (st) {
      gctx.beginPath(); gctx.arc(GPAD + st[0] * GCELL, GPAD + st[1] * GCELL, 4, 0, Math.PI * 2); gctx.fill();
    });
    for (var r = 0; r < GSIZE; r++) for (var c = 0; c < GSIZE; c++) {
      if (!gBoard[r][c]) continue;
      var x = GPAD + c * GCELL, y = GPAD + r * GCELL;
      var grad = gctx.createRadialGradient(x - 4, y - 4, 2, x, y, GCELL * 0.5);
      if (gBoard[r][c] === 1) { grad.addColorStop(0, '#666'); grad.addColorStop(1, '#111'); }
      else { grad.addColorStop(0, '#fff'); grad.addColorStop(1, '#c9c9c9'); }
      gctx.fillStyle = grad;
      gctx.beginPath(); gctx.arc(x, y, GCELL * 0.44, 0, Math.PI * 2); gctx.fill();
    }
  }
  gomokuCanvas.addEventListener('click', function (e) {
    if (gOver) return;
    var rect = gomokuCanvas.getBoundingClientRect();
    var cx = (e.clientX - rect.left) * (gomokuCanvas.width / rect.width);
    var cy = (e.clientY - rect.top) * (gomokuCanvas.height / rect.height);
    var col = Math.round((cx - GPAD) / GCELL);
    var row = Math.round((cy - GPAD) / GCELL);
    if (row < 0 || row >= GSIZE || col < 0 || col >= GSIZE) return;
    if (gBoard[row][col] !== 0) return;
    gBoard[row][col] = gTurn;
    if (gomokuWin(row, col, gTurn)) {
      gOver = true;
      gomokuTurn.textContent = (gTurn === 1 ? '⚫ 黑棋' : '⚪ 白棋') + ' 赢啦！🎉';
    } else {
      gTurn = gTurn === 1 ? 2 : 1;
      gomokuTurn.textContent = (gTurn === 1 ? '⚫ 黑棋' : '⚪ 白棋') + ' 落子';
    }
    drawGomoku();
  });
  document.getElementById('gomokuReset').addEventListener('click', function (e) {
    e.stopPropagation();
    gomokuInit();
    drawGomoku();
  });

  gomokuInit();   // 初始化棋盘
  refreshNav();   // 初始化右上角返回按钮状态

  /* ---------- 10. 见缝插针小游戏 ---------- */
  var needleCanvas = document.getElementById('needleCanvas');
  var nctx = needleCanvas.getContext('2d');
  var needleTip = document.getElementById('needleTip');

  var N_W = needleCanvas.width, N_H = needleCanvas.height;   // 360 x 400
  var NCX = N_W / 2, NCY = 150;                               // 圆心
  var NR = 78;                                                // 圆盘半径
  var NLEN = 54;                                              // 针长
  var DOWN_ANGLE = Math.PI / 2;                               // 发射口在正下方
  var LAUNCH_HEAD_Y = N_H - 24;                               // 待发针的针头位置（底部）

  var nNeedles = [];       // 已插上的针，存"盘上相对角度"
  var nDisc = 0;           // 圆盘当前转角
  var nSpin = 0.02;        // 转速（弧度/帧）
  var nFly = null;         // 飞行中的针 { tipY, speed }
  var nScore = 0;
  var nOver = false;
  var nRunning = false;
  var nRaf = null;

  function normAngle(a) {
    a = a % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
  }
  function angleDiff(a, b) {
    var d = normAngle(a - b);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  }
  function needleInit() {
    nNeedles = [];
    nDisc = 0;
    nSpin = 0.02;
    nFly = null;
    nScore = 0;
    nOver = false;
    needleTip.textContent = '点击发射针 · 别碰到其他针';
    drawNeedle();
  }
  function fireNeedle() {
    if (nOver || !nRunning || nFly) return;
    nFly = { tipY: LAUNCH_HEAD_Y - NLEN, speed: 7 };
  }
  function checkNeedleHit(rel) {
    var minGap = 0.12;                               // 针与针最小角度间隔
    for (var i = 0; i < nNeedles.length; i++) {
      if (angleDiff(nNeedles[i], rel) < minGap) return true;
    }
    return false;
  }
  function gameOverNeedle() {
    nOver = true;
    needleTip.textContent = '💥 撞针啦！共插 ' + nScore + ' 根 · 点"重新开始"';
  }
  function needleFrame() {
    nRaf = requestAnimationFrame(needleFrame);
    nDisc = normAngle(nDisc + nSpin);

    if (nFly) {
      nFly.tipY -= nFly.speed;
      if (nFly.tipY <= NCY + NR) {                   // 针尖到达盘边
        var rel = normAngle(DOWN_ANGLE - nDisc);     // 此刻正对发射口的盘上角度
        if (checkNeedleHit(rel)) {
          gameOverNeedle();
        } else {
          nNeedles.push(rel);
          nScore++;
          nSpin = Math.min(nSpin + 0.0009, 0.05);    // 慢慢加速
          needleTip.textContent = '已插 ' + nScore + ' 根 · 继续！';
        }
        nFly = null;
      }
    }
    drawNeedle();
  }
  function startNeedleLoop() {
    if (nRunning) return;
    nRunning = true;
    nRaf = requestAnimationFrame(needleFrame);
  }
  function stopNeedleLoop() {
    nRunning = false;
    cancelAnimationFrame(nRaf);
  }

  function drawShaft(x1, y1, x2, y2, color) {
    nctx.strokeStyle = color;
    nctx.lineWidth = 5;
    nctx.lineCap = 'round';
    nctx.beginPath();
    nctx.moveTo(x1, y1);
    nctx.lineTo(x2, y2);
    nctx.stroke();
  }
  function drawHead(x, y, color) {
    nctx.fillStyle = color;
    nctx.beginPath();
    nctx.arc(x, y, 7, 0, Math.PI * 2);
    nctx.fill();
  }
  function drawNeedle() {
    nctx.clearRect(0, 0, N_W, N_H);

    // 圆盘
    var g = nctx.createRadialGradient(NCX - 16, NCY - 16, 10, NCX, NCY, NR);
    g.addColorStop(0, '#CBE9DB');
    g.addColorStop(1, '#6FA8D8');
    nctx.fillStyle = g;
    nctx.beginPath();
    nctx.arc(NCX, NCY, NR, 0, Math.PI * 2);
    nctx.fill();
    nctx.strokeStyle = 'rgba(94,84,112,0.4)';
    nctx.lineWidth = 3;
    nctx.stroke();
    nctx.fillStyle = 'rgba(255,255,255,0.65)';
    nctx.beginPath();
    nctx.arc(NCX, NCY, 9, 0, Math.PI * 2);
    nctx.fill();

    // 已插上的针（随盘一起转）
    var i;
    for (i = 0; i < nNeedles.length; i++) {
      var a = nDisc + nNeedles[i];
      var cos = Math.cos(a), sin = Math.sin(a);
      var x1 = NCX + cos * NR, y1 = NCY + sin * NR;
      var x2 = NCX + cos * (NR + NLEN), y2 = NCY + sin * (NR + NLEN);
      drawShaft(x1, y1, x2, y2, '#4A3A36');
      drawHead(x2, y2, '#FE97A8');
    }

    // 待发 / 飞行中的针（固定在正下方，指向上）
    if (!nOver) {
      var tipY = nFly ? nFly.tipY : LAUNCH_HEAD_Y - NLEN;
      var headY = tipY + NLEN;
      drawShaft(NCX, tipY, NCX, headY, '#4A3A36');
      drawHead(NCX, headY, '#F7D98C');
    }
  }

  needleCanvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    fireNeedle();
  });
  document.getElementById('needleReset').addEventListener('click', function (e) {
    e.stopPropagation();
    needleInit();
  });

  needleInit();   // 初始化见缝插针


/* ===== 进入页面问候弹窗（原 myjs.js） ===== */
// 进入页面时的问候弹窗：根据现在的时间，显示 早上好 / 中午好 / 晚上好
document.addEventListener('DOMContentLoaded', function () {
  var hour = new Date().getHours();   // 当前小时 0~23

  var word = '晚上好';
  var icon = '🌙';
  if (hour >= 5 && hour < 11)       { word = '早上好'; icon = '🌤️'; }
  else if (hour >= 11 && hour < 14) { word = '中午好'; icon = '☀️'; }
  else if (hour >= 14 && hour < 18) { word = '下午好'; icon = '🌇'; }

  var overlay = document.getElementById('greetOverlay');
  var text = document.getElementById('greetText');
  var iconEl = document.getElementById('greetIcon');
  if (!overlay || !text) return;   // 页面里没有弹窗就不处理

  if (iconEl) iconEl.textContent = icon;
  text.textContent = word + '，小袁';
  overlay.classList.add('active');   // 显示弹窗

  // 点弹窗任意处（或按钮）就进入
  overlay.addEventListener('click', function () {
    overlay.classList.remove('active');
  });
});
