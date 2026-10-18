(function () {

  var $ = function (i) {
      return document.getElementById(i);
    },
    cv = $('c'),
    ctx = cv.getContext('2d'),
    H = 540,
    GY = 470,
    vw = 960,
    sc = 1,
    dpr = 1;
  function rs() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    sc = innerHeight / H;
    vw = innerWidth / sc;
  }
  rs();
  addEventListener('resize', rs);


  var AC,
    mg,
    nb,
    wf,
    wg,
    on = true,
    st = 0,
    nt = 0;
  function initA() {
    if (AC) {
      AC.resume();
      return;
    }
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return;
    }
    mg = AC.createGain();
    mg.gain.value = 0.55;
    mg.connect(AC.destination);
    nb = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    var d = nb.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var s = AC.createBufferSource();
    s.buffer = nb;
    s.loop = true;
    wf = AC.createBiquadFilter();
    wf.type = 'bandpass';
    wf.frequency.value = 500;
    wf.Q.value = 0.6;
    wg = AC.createGain();
    wg.gain.value = 0;
    s.connect(wf);
    wf.connect(wg);
    wg.connect(mg);
    s.start();
    nt = AC.currentTime + 0.1;
    setInterval(sched, 70);
  }
  function tone(f, t, d, ty, v, f2) {
    var o = AC.createOscillator(),
      g = AC.createGain();
    o.type = ty;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g);
    g.connect(mg);
    o.start(t);
    o.stop(t + d + 0.03);
  }
  function nz(t, d, v, f0, f1) {
    var s = AC.createBufferSource();
    s.buffer = nb;
    var f = AC.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + d);
    var g = AC.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f);
    f.connect(g);
    g.connect(mg);
    s.start(t, Math.random(), d + 0.05);
  }
  var bass = [55, 55, 0, 55, 65.4, 0, 49, 49],
    lead = [220, 0, 262, 330, 0, 294, 262, 0, 247, 0, 294, 370, 330, 0, 294, 0],
    prog = [1, 1, 0.89, 0.75];
  function sched() {
    if (!AC || !on || AC.state !== 'running') return;
    while (nt < AC.currentTime + 0.3) {
      var s = st % 16,
        m = prog[Math.floor(st / 16) % 4],
        t = nt;
      if (bass[s % 8]) tone(bass[s % 8] * m, t, 0.17, 'sawtooth', 0.1);
      if (lead[s]) tone(lead[s] * m, t, 0.14, 'square', 0.04);
      if (s % 4 === 0) tone(95, t, 0.13, 'sine', 0.28, 45);
      if (s % 4 !== 2) nz(t, 0.05, 0.07, 1400, 600);
      if (s % 2) nz(t, 0.03, 0.05, 6000, 5000);
      nt += 0.19;
      st++;
    }
  }
  function sfx(k) {
    if (!AC || !on) return;
    var t = AC.currentTime;
    if (k === 'web') {
      nz(t, 0.16, 0.35, 2600, 700);
      tone(900, t, 0.08, 'triangle', 0.12, 1500);
    } else if (k === 'rel') {
      nz(t, 0.22, 0.2, 900, 2400);
    } else if (k === 'coin') {
      tone(880, t, 0.08, 'square', 0.07);
      tone(1320, t + 0.07, 0.12, 'square', 0.07);
    } else if (k === 'hit') {
      tone(130, t, 0.3, 'sine', 0.4, 45);
      nz(t, 0.2, 0.3, 900, 200);
    } else if (k === 'catch') {
      [523, 659, 784, 1046].forEach(function (f, i) {
        tone(f, t + i * 0.08, 0.18, 'square', 0.08);
      });
    } else if (k === 'over') {
      tone(440, t, 0.8, 'sawtooth', 0.12, 90);
    } else if (k === 'thud') {
      tone(90, t, 0.15, 'sine', 0.25, 50);
      nz(t, 0.1, 0.12, 500, 150);
    } else if (k === 'flip') {
      nz(t, 0.2, 0.22, 500, 1800);
      tone(500, t, 0.12, 'triangle', 0.07, 900);
    } else if (k === 'perfect') {
      tone(660, t, 0.1, 'triangle', 0.12);
      tone(990, t + 0.08, 0.22, 'triangle', 0.12);
    } else if (k === 'hee') {
      tone(380, t, 0.28, 'sawtooth', 0.08, 640);
      tone(640, t + 0.28, 0.12, 'sawtooth', 0.07, 560);
      tone(300, t + 0.45, 0.45, 'sawtooth', 0.08, 170);
      tone(150, t + 0.45, 0.45, 'square', 0.03, 90);
    }
  }
  $('mute').addEventListener('click', function (e) {
    on = !on;
    if (mg) mg.gain.value = on ? 0.55 : 0;
    this.textContent = on ? 'Sound on' : 'Sound off';
    this.blur();
  });


  function mkLayer(P, mn, mx, c1, c2, lit, det) {
    var c = document.createElement('canvas');
    c.width = P * 2;
    c.height = H * 2;
    var q = c.getContext('2d');
    q.scale(2, 2);
    for (var x = 0; x < P;) {
      var w = Math.min(P - x, 50 + Math.random() * 80),
        h = mn + Math.random() * (mx - mn),
        y = H - h;
      var gr = q.createLinearGradient(0, y, 0, H);
      gr.addColorStop(0, c2);
      gr.addColorStop(1, c1);
      q.fillStyle = gr;
      q.fillRect(x, y, w, h);
      for (var wy = y + 10; wy < H - 20; wy += 14)
        for (var wx = x + 6; wx < x + w - 8; wx += 11) {
          if (Math.random() < lit) {
            q.fillStyle = Math.random() < 0.2 ? '#9fd6ff' : '#ffd98a';
            q.globalAlpha = 0.5 + Math.random() * 0.45;
          } else {
            q.fillStyle = '#000';
            q.globalAlpha = 0.16;
          }
          q.fillRect(wx, wy, 5, 7);
        }
      q.globalAlpha = 1;
      if (det && Math.random() < 0.5) {
        q.fillStyle = c2;
        q.fillRect(x + w / 2 - 1, y - 16 - Math.random() * 20, 2, 30);
      }
      x += w;
    }
    return c;
  }
  var L1 = mkLayer(1300, 120, 260, '#2a2255', '#4a3688', 0.1, 0),
    L2 = mkLayer(1500, 140, 330, '#1a1840', '#2c2764', 0.28, 0),
    L3 = mkLayer(1700, 80, 230, '#0e0d26', '#1b1946', 0.34, 1);
  var stars = [];
  for (var i = 0; i < 90; i++) stars.push([Math.random(), Math.random() * 0.55, Math.random() * 6]);

 

  var state = 'menu',
    hero,
    thief,
    anchors,
    coins,
    crates,
    parts,
    cam = 0,
    camY = 0,
    shake = 0,
    score = 0,
    nc = 0,
    lvl = 1,
    best = 0,
    tm = 0,
    holding = false,
    lastA,
    lastC,
    dustT = 0,
    hhT = 8,
    clock = 0;
  function reset() {
    hero = {
      x: 0,
      y: GY - 22,
      vx: 300,
      vy: 0,
      att: null,
      L: 0,
      glide: false,
      hitT: 0,
      fly: 100,
      onG: true,
      rot: 0.12,
      spinT: 0,
      flip: true,
      coy: 0,
      webT: 1,
      combo: 0,
    };
    thief = { x: 520, hop: 0, hv: 0, vl: 0 };
    anchors = [];
    coins = [];
    crates = [];
    parts = [];
    lastA = 60;
    lastC = 500;
    score = 0;
    nc = 0;
    lvl = 1;
    shake = 0;
    camY = 0;
    hhT = 7;
    holding = false;
    genTo(1800);
  }
  function genTo(lim) {
    while (lastA < lim) {
      var px = lastA;
      lastA += 260 + Math.random() * 120;
      var ay = 90 + Math.random() * 130;
      anchors.push({ x: lastA, y: ay, ph: Math.random() * 6 });
      if (Math.random() < 0.55) {
        var cy = 230 + Math.random() * 80;
        for (var i = 0; i < 5; i++)
          coins.push({
            x: px + 50 + (i * (lastA - px - 100)) / 4,
            y: cy - Math.sin((i / 4) * Math.PI) * 70,
            got: 0,
          });
      }
    }
    while (lastC < lim) {
      lastC += 520 + Math.random() * 520;
      crates.push({ x: lastC, w: 44, h: 36 + Math.random() * 30 });
    }
  }
  function P(x, y, vx, vy, l, c, r) {
    if (parts.length < 260) parts.push({ x: x, y: y, vx: vx, vy: vy, l: l, m: l, c: c, r: r });
  }
  

  function bestAnchor(h) {
    var bn = null,
      bs = 1e9;
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i],
        dx = a.x - h.x,
        dy = h.y - a.y;
      if (dx > 20 && dx < 440 && dy > 40) {
        var d = Math.hypot(dx, dy);
        if (d < 500) {
          var sc2 = Math.abs(dx - 190) + (dy < 90 ? 80 : 0) + Math.abs(d - 300) * 0.3;
          if (sc2 < bs) {
            bs = sc2;
            bn = a;
          }
        }
      }
    }
    return bn;
  }
  function tryAttach() {
    var h = hero,
      a = bestAnchor(h);
    if (!a) return false;
    h.att = a;
    h.L = Math.hypot(a.x - h.x, a.y - h.y);
    h.webT = 0;
    if (Math.hypot(h.vx, h.vy) < 650) h.vx *= 1.08;
    sfx('web');
    for (var k = 0; k < 8; k++)
      P(a.x, a.y, (Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160, 0.4, '#fff', 2);
    return true;
  }
  function press() {
    if (state !== 'play') return;
    holding = true;
    tryAttach();
  }
  function lift(jump) {
    holding = false;
    var h = hero;
    if (!h || !h.att) return;
    var a = h.att,
      ang = Math.atan2(h.x - a.x, h.y - a.y);
    h.att = null;
    h.flip = true;
    if (h.vy < -30 && ang > 0.4 && ang < 1.2) {
      h.combo = Math.min(5, h.combo + 1);
      h.vx *= 1.18;
      h.vy = h.vy * 1.1 - 80;
      score += 25 * h.combo;
      sfx('perfect');
      toast('Perfect release x' + h.combo);
      for (var k = 0; k < 14; k++)
        P(h.x, h.y, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, 0.5, '#9fd6ff', 2.5);
    } else {
      h.vx *= 1.04;
      h.vy -= 40;
      sfx('rel');
    }
    if (jump) h.vy -= 220;
  }
  function upKey() {
    if (state !== 'play') return;
    var h = hero;
    if (h.att) {
      lift(true);
      return;
    }
    if (h.onG || h.coy > 0) {
      h.vy = -640;
      h.onG = false;
      h.coy = 0;
      sfx('flip');
      for (var k = 0; k < 6; k++)
        P(h.x, GY - 4, (Math.random() - 0.5) * 160, -Math.random() * 120, 0.4, '#8d84a8', 3);
    } else if (h.flip) {
      h.flip = false;
      h.vy = -560;
      h.spinT = 0.45;
      sfx('flip');
      for (var k = 0; k < 10; k++)
        P(h.x, h.y + 12, (Math.random() - 0.5) * 220, Math.random() * 120, 0.4, '#bfe6ff', 2.5);
    }
  }
  function toast(t) {
    var e = $('toast');
    e.textContent = t;
    e.style.opacity = 1;
    setTimeout(function () {
      e.style.opacity = 0;
    }, 1100);
  }

 
  function update(dt) {
    var h = hero,
      t = thief,
      kx = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0),
      dn = keys.ArrowDown || keys.KeyS;
    if (holding && !h.att) tryAttach();
    var g = 1500,
      wasG = h.onG,
      pvy = h.vy;
    h.glide = false;
    if (!h.att && holding && h.fly > 0 && h.y < GY - 40) {
      h.glide = true;
      g = 450;
      h.vx += 70 * dt;
      h.fly -= 36 * dt;
    } else if (!h.att && !h.onG && Math.abs(h.vy) < 140) g = 980;
    if (h.att || h.onG) h.fly = Math.min(100, h.fly + 24 * dt);
    if (!h.att && !h.onG) {
      h.vx += kx * 260 * dt;
      if (dn && !h.glide) h.vy += 2000 * dt;
    }
    if (h.att) {
      var rx = h.x - h.att.x,
        ry = h.y - h.att.y,
        rd = Math.hypot(rx, ry) || 1;
      h.vx += (ry / rd) * kx * 560 * dt;
      h.vy -= (rx / rd) * kx * 560 * dt;
    }
    h.vy += g * dt;
    if (h.glide && h.vy > 150) h.vy = 150;
    if (h.vy > 1300) h.vy = 1300;
    if (h.onG && !h.att) h.vx += (300 + kx * 90 - h.vx) * Math.min(1, 3 * dt);
    else if (!h.att) h.vx *= 1 - 0.05 * dt;

    h.x += h.vx * dt;
    h.y += h.vy * dt;
    if (h.att) {
      var a = h.att,
        dx = h.x - a.x,
        dy = h.y - a.y,
        d = Math.hypot(dx, dy);
      h.L = Math.max(70, h.L - (dn ? 150 : 70) * dt);
      if (d > h.L) {
        var nx = dx / d,
          ny = dy / d;
        h.x = a.x + nx * h.L;
        h.y = a.y + ny * h.L;
        var vn = h.vx * nx + h.vy * ny;
        if (vn > 0) {
          h.vx -= nx * vn;
          h.vy -= ny * vn;
        }
      }
    }
    h.vx = Math.min(1100, Math.max(-200, h.vx));
    h.onG = false;
    if (h.y > GY - 22) {
      h.y = GY - 22;
      if (h.vy > 0) h.vy = 0;
      h.onG = true;
    }
    if (h.onG) {
      h.coy = 0.1;
      h.flip = true;
      h.combo = 0;
      if (!wasG && pvy > 450) {
        shake = 0.12;
        sfx('thud');
        for (var k0 = 0; k0 < 8; k0++)
          P(h.x, GY - 4, (Math.random() - 0.5) * 240, -Math.random() * 160, 0.45, '#8d84a8', 3);
      }
    } else h.coy -= dt;
    if (h.att) h.flip = true;
    h.webT = Math.min(1, h.webT + dt * 12);
    if (h.spinT > 0) h.spinT -= dt;
    // Smoothed body rotation
    var tr;
    if (h.glide) tr = 1.3;
    else if (h.att) tr = Math.atan2(h.att.x - h.x, h.y - h.att.y) * 0.9;
    else if (!h.onG) tr = Math.max(-0.6, Math.min(0.9, Math.atan2(h.vy, Math.max(1, h.vx)) * 0.6));
    else tr = 0.12;
    h.rot += (tr - h.rot) * Math.min(1, 12 * dt);
    if (h.vx > 650 && !h.onG) P(h.x - 8, h.y, 0, 0, 0.22, 'rgba(255,80,100,.55)', 8);
    if (h.hitT > 0) h.hitT -= dt;
    // Crate and coin collisions
    for (var i = 0; i < crates.length; i++) {
      var c = crates[i];
      if (h.hitT <= 0 && Math.abs(c.x + c.w / 2 - h.x) < c.w / 2 + 12 && h.y + 22 > GY - c.h + 6) {
        h.hitT = 1;
        h.vx *= 0.35;
        shake = 0.3;
        sfx('hit');
        $('flash').style.opacity = 0.4;
        setTimeout(function () {
          $('flash').style.opacity = 0;
        }, 120);
        for (var k = 0; k < 12; k++)
          P(h.x, GY - 10, (Math.random() - 0.2) * 240, -Math.random() * 240, 0.5, '#b98a5a', 3);
      }
    }
    for (var j = 0; j < coins.length; j++) {
      var q = coins[j];
      if (!q.got && Math.hypot(q.x - h.x, q.y - h.y) < 32) {
        q.got = 1;
        nc++;
        score += 10;
        sfx('coin');
        for (var k = 0; k < 6; k++)
          P(q.x, q.y, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0.4, '#ffd34d', 2.5);
      }
    }
    t.x += (340 + lvl * 30 + Math.sin(tm * 0.7) * 30) * dt;
    if (t.hop === 0 && t.hv === 0)
      for (var m = 0; m < crates.length; m++) {
        var cx = crates[m].x - t.x;
        if (cx > 20 && cx < 140) {
          t.hv = 560;
          break;
        }
      }
    if (t.hv || t.hop) {
      t.hop += t.hv * dt;
      t.hv -= 1700 * dt;
      if (t.hop <= 0) {
        t.hop = 0;
        t.hv = 0;
      }
    }
    hhT -= dt;
    if (hhT <= 0) {
      hhT = 9 + Math.random() * 6;
      sfx('hee');
    }
    var gap = t.x - h.x;
    if (gap < 55) {
      score += 500;
      lvl++;
      t.x = h.x + 560;
      toast('Caught him! Level ' + lvl);
      sfx('catch');
      for (var k = 0; k < 24; k++)
        P(h.x + 30, h.y, (Math.random() - 0.3) * 400, (Math.random() - 0.5) * 400, 0.7, '#fff', 3);
    }
    if (gap > Math.max(760, vw * 0.72 + 80)) endRun();
    score += Math.max(0, h.vx) * dt * 0.02;
    dustT -= dt;
    if (dustT <= 0) {
      dustT = 0.05;
      if (h.onG) P(h.x - 10, GY - 2, -h.vx * 0.2, -30 - Math.random() * 40, 0.5, '#8d84a8', 3);
      P(t.x - 30, GY - 2, -120, -30 - Math.random() * 40, 0.5, '#8d84a8', 3);
    }
    genTo(h.x + vw * 1.6 + 600);
    while (anchors.length && anchors[0].x < h.x - 600) anchors.shift();
    while (coins.length && coins[0].x < h.x - 600) coins.shift();
    while (crates.length && crates[0].x < h.x - 600) crates.shift();
  }

 

  function leg(hx, hy, a, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + Math.sin(a) * 10, hy + 12);
    var fy = hy + 24 - Math.abs(Math.sin(a)) * 7;
    ctx.lineTo(hx + Math.sin(a) * 22, fy);
    ctx.stroke();
    ctx.fillStyle = '#2c2623';
    ctx.beginPath();
    ctx.arc(hx + Math.sin(a) * 22, fy, 3.2, 0, 7);
    ctx.fill();
  }
  function drawThief(x, y, t, hop) {
    ctx.save();
    ctx.translate(x, y - hop);
    var s1 = Math.sin(t * 13),
      s2 = Math.sin(t * 13 + 2.4);
    ctx.strokeStyle = '#4a423e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-32, -42);
    ctx.quadraticCurveTo(-48, -38 + s1 * 4, -44, -18 + s2 * 5);
    ctx.stroke();
    leg(-20, -24, s2 * 0.8, '#5a514c');
    leg(24, -24, s1 * 0.8, '#5a514c');
    ctx.fillStyle = '#8f857d';
    ctx.beginPath();
    ctx.ellipse(0, -36, 35, 17, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#b9afa6';
    ctx.beginPath();
    ctx.ellipse(2, -28, 28, 8, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#8f857d';
    ctx.beginPath();
    ctx.moveTo(22, -46);
    ctx.lineTo(36, -70);
    ctx.lineTo(50, -62);
    ctx.lineTo(36, -34);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(52, -68, 17, 9, 0.55, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#d4cabf';
    ctx.beginPath();
    ctx.ellipse(63, -61, 8, 6.5, 0.55, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#3b3430';
    ctx.beginPath();
    ctx.arc(66, -61, 1.8, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, -71, 2, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#8f857d';
    ctx.beginPath();
    ctx.moveTo(40, -72);
    ctx.lineTo(36, -97 + s1 * 2);
    ctx.lineTo(47, -75);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(45, -74);
    ctx.lineTo(49, -99 + s2 * 2);
    ctx.lineTo(54, -72);
    ctx.fill();
    ctx.strokeStyle = '#2c2623';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, -74);
    ctx.lineTo(24, -48);
    ctx.stroke();
    leg(-24, -24, s1 * 0.85, '#6f655f');
    leg(20, -24, s2 * 0.85, '#6f655f');
    ctx.fillStyle = '#4a2a8a';
    ctx.beginPath();
    ctx.moveTo(-6, -66);
    ctx.bezierCurveTo(-30, -62 + s1 * 4, -52, -56 + s2 * 6, -68, -44 + s1 * 8);
    ctx.bezierCurveTo(-48, -50, -28, -50, -8, -52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1c1a2e';
    ctx.beginPath();
    ctx.moveTo(-8, -52);
    ctx.lineTo(-4, -70);
    ctx.lineTo(10, -68);
    ctx.lineTo(8, -50);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -78, 9.5, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, -82);
    ctx.lineTo(-14, -90 + s1);
    ctx.lineTo(-2, -74);
    ctx.fill();
    ctx.fillStyle = '#ffe14a';
    ctx.fillRect(5, -80, 5, 2.6);
    ctx.strokeStyle = '#1c1a2e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(4, -66);
    ctx.lineTo(24, -58);
    ctx.lineTo(34, -62);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -52);
    ctx.lineTo(8, -38);
    ctx.lineTo(2, -29);
    ctx.stroke();
    ctx.restore();
  }
  function drawHero(h) {
    if (h.hitT > 0 && Math.floor(tm * 20) % 2) return;
    ctx.save();
    ctx.translate(h.x, h.y);
    var rot,
      run = Math.sin(tm * 16) * 0.9,
      air = !h.onG;
    rot = h.rot + (h.spinT > 0 ? -(1 - h.spinT / 0.45) * 6.283 : 0);
    ctx.rotate(rot);
    ctx.lineCap = 'round';
    if (h.glide) {
      ctx.fillStyle = 'rgba(225,235,255,.45)';
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, -10);
      ctx.lineTo(34, -4);
      ctx.lineTo(36, 24);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(35, 10);
      ctx.moveTo(18, -7);
      ctx.lineTo(19, 19);
      ctx.stroke();
    }
    var la = h.onG ? run : h.att ? 0.5 : 0.3,
      aa = h.onG ? -run : h.att ? -0.3 : -0.6;
    ctx.strokeStyle = '#2a55d8';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(Math.sin(la) * 10, 22 + (h.glide ? 4 : 0));
    ctx.moveTo(0, 10);
    ctx.lineTo(Math.sin(-la) * 10 - (air ? 4 : 0), 21);
    ctx.stroke();
    ctx.strokeStyle = '#e5283c';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.fillStyle = '#2a55d8';
    ctx.fillRect(-7, 6, 14, 4);
    ctx.strokeStyle = '#e5283c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    if (h.att) {
      var ang = Math.atan2(h.att.y - h.y, h.att.x - h.x) - rot;
      ctx.lineTo(Math.cos(ang) * 22, -8 + Math.sin(ang) * 22);
    } else if (h.glide) ctx.lineTo(30, -6);
    else ctx.lineTo(Math.sin(aa) * 14 + 4, 6);
    ctx.stroke();
    ctx.fillStyle = '#e5283c';
    ctx.beginPath();
    ctx.arc(2, -20, 9.5, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(6, -21, 4.6, 2.6, 0.45, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0);
    var sg = ctx.createLinearGradient(0, 0, 0, H);
    sg.addColorStop(0, '#080b26');
    sg.addColorStop(0.45, '#33256a');
    sg.addColorStop(0.8, '#c2557a');
    sg.addColorStop(1, '#ff9a6a');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, vw, H);
    stars.forEach(function (s) {
      ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(tm * 1.5 + s[2]));
      ctx.fillStyle = '#fff';
      ctx.fillRect(s[0] * vw, s[1] * H, 1.6, 1.6);
    });
    ctx.globalAlpha = 1;
    var mx = vw * 0.78,
      mgd = ctx.createRadialGradient(mx, 90, 10, mx, 90, 120);
    mgd.addColorStop(0, 'rgba(255,245,215,.55)');
    mgd.addColorStop(1, 'rgba(255,245,215,0)');
    ctx.fillStyle = mgd;
    ctx.fillRect(mx - 130, -40, 260, 260);
    ctx.fillStyle = '#fff6dc';
    ctx.beginPath();
    ctx.arc(mx, 90, 28, 0, 7);
    ctx.fill();
    ctx.save();
    ctx.translate(0, -camY * 0.15);
    function dl(c, f, Pw) {
      var o = -((cam * f) % Pw);
      if (o > 0) o -= Pw;
      for (var x = o; x < vw; x += Pw) ctx.drawImage(c, x, 0, Pw, H);
    }
    dl(L1, 0.1, 1300);
    dl(L2, 0.25, 1500);
    var hz = ctx.createLinearGradient(0, GY - 160, 0, GY);
    hz.addColorStop(0, 'rgba(255,130,120,0)');
    hz.addColorStop(1, 'rgba(255,130,120,.28)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, GY - 160, vw, 160);
    dl(L3, 0.5, 1700);
    ctx.restore();
    ctx.save();
    ctx.translate(
      -cam + (shake > 0 ? (Math.random() - 0.5) * 8 : 0),
      -camY + (shake > 0 ? (Math.random() - 0.5) * 8 : 0),
    );
    var gg = ctx.createLinearGradient(0, GY, 0, GY + 400);
    gg.addColorStop(0, '#23203f');
    gg.addColorStop(1, '#0c0b1c');
    ctx.fillStyle = gg;
    ctx.fillRect(cam - 20, GY, vw + 40, 420);
    ctx.fillStyle = '#5a5486';
    ctx.fillRect(cam - 20, GY, vw + 40, 3);
    ctx.fillStyle = '#d8d2ff55';
    for (var x = Math.floor(cam / 90) * 90; x < cam + vw + 90; x += 90) ctx.fillRect(x, GY + 48, 46, 4);
    for (var lx = Math.floor(cam / 380) * 380; lx < cam + vw + 380; lx += 380) {
      ctx.fillStyle = '#14122a';
      ctx.fillRect(lx, GY - 110, 5, 110);
      ctx.fillRect(lx, GY - 112, 26, 4);
      var lg = ctx.createRadialGradient(lx + 24, GY - 104, 2, lx + 24, GY - 104, 70);
      lg.addColorStop(0, 'rgba(255,220,140,.6)');
      lg.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(lx - 50, GY - 180, 150, 150);
    }
    crates.forEach(function (c) {
      ctx.fillStyle = '#8a5e3a';
      ctx.fillRect(c.x, GY - c.h, c.w, c.h);
      ctx.strokeStyle = '#c9a06b';
      ctx.lineWidth = 3;
      ctx.strokeRect(c.x + 2, GY - c.h + 2, c.w - 4, c.h - 4);
      ctx.beginPath();
      ctx.moveTo(c.x + 2, GY - c.h + 2);
      ctx.lineTo(c.x + c.w - 2, GY - 2);
      ctx.stroke();
    });
    var tgt = state === 'play' && !hero.att ? bestAnchor(hero) : null;
    anchors.forEach(function (a) {
      var p = 1 + Math.sin(tm * 3 + a.ph) * 0.15,
        isT = a === tgt || a === hero.att;
      var gr = ctx.createRadialGradient(a.x, a.y, 2, a.x, a.y, isT ? 34 : 22);
      gr.addColorStop(0, isT ? 'rgba(255,255,255,.95)' : 'rgba(120,200,255,.8)');
      gr.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(a.x, a.y, (isT ? 34 : 22) * p, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#dff4ff';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 4, 0, 7);
      ctx.fill();
      if (isT) {
        ctx.strokeStyle = 'rgba(255,255,255,.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 16 + Math.sin(tm * 8) * 3, 0, 7);
        ctx.stroke();
      }
    });
    coins.forEach(function (c, i) {
      if (c.got) return;
      var w = Math.abs(Math.cos(tm * 4 + i));
      ctx.fillStyle = '#ffc83d';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 9 * w + 2, 9, 0, 0, 7);
      ctx.fill();
      ctx.strokeStyle = '#fff3b0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    if (state !== 'menu' || true) {
      drawThief(thief.x, GY, tm, thief.hop);
    }
    if (hero.att) {
      var a = hero.att,
        hx = hero.x + 6,
        hy = hero.y - 12,
        k = Math.min(1, hero.webT),
        ex = hx + (a.x - hx) * k,
        ey = hy + (a.y - hy) * k,
        sag = (1 - k) * 14 + Math.sin(tm * 20) * (1 - k) * 4;
      ctx.save();
      ctx.shadowColor = '#bfe6ff';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo((hx + ex) / 2, (hy + ey) / 2 + sag, ex, ey);
      ctx.stroke();
      ctx.restore();
    }
    drawHero(hero);
    parts.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.l / p.m);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
    if (state === 'play' && hero.vx > 520) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = 1.5;
      for (var i = 0; i < 10; i++) {
        var y = (i * 97 + tm * 600) % H,
          x = (((i * 211 - tm * 1400) % vw) + vw) % vw;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 90, y);
        ctx.stroke();
      }
    }
    var vg = ctx.createRadialGradient(vw / 2, H / 2, H * 0.45, vw / 2, H / 2, H * 1.1);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,10,.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, vw, H);
  }

 
  function frame(ts) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.033, (ts - clock) / 1000 || 0.016);
    clock = ts;
    tm += dt;
    if (state === 'play') {
      update(dt);
      var gap = thief.x - hero.x;
      $('gap').style.width = Math.min(100, (gap / Math.max(760, vw * 0.72 + 80)) * 100) + '%';
      $('fly').style.width = hero.fly + '%';
      $('score').textContent = Math.floor(score);
      $('lvl').textContent = lvl;
      $('coins').textContent = nc;
    } else {
      hero.x += dt * 160;
      hero.vx = 160;
      thief.x = hero.x + 420;
      genTo(hero.x + vw * 1.6 + 600);
      hero.onG = true;
      hero.y = GY - 22;
    }
    var la = Math.max(0, Math.min(1, hero.vx / 1000));
    cam += (hero.x - vw * (0.34 - 0.14 * la) - cam) * Math.min(1, 8 * dt);
    camY += (Math.min(0, hero.y - 170) - camY) * Math.min(1, 4 * dt);
    if (shake > 0) shake -= dt;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.l -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      if (p.l <= 0) parts.splice(i, 1);
    }
    if (wg && AC) {
      wg.gain.setTargetAtTime(
        state === 'play' ? Math.min(0.22, (Math.abs(hero.vx) / 1000) * 0.22) : 0,
        AC.currentTime,
        0.1,
      );
      wf.frequency.setTargetAtTime(300 + Math.abs(hero.vx), AC.currentTime, 0.1);
    }
    draw();
  }

  function startRun() {
    initA();
    reset();
    cam = hero.x - vw * 0.34;
    state = 'play';
    $('panel').classList.add('hide');
    $('hud').classList.remove('hide');
  }
  function endRun() {
    state = 'over';
    holding = false;
    hero.att = null;
    sfx('over');
    best = Math.max(best, Math.floor(score));
    $('title').textContent = 'He got away';
    $('msg').textContent =
      'Score ' + Math.floor(score) + '. Level ' + lvl + ', coins ' + nc + ', best ' + best + '.';
    $('go').textContent = 'Chase again';
    $('panel').classList.remove('hide');
    $('hud').classList.add('hide');
  }
 

  $('go').addEventListener('click', startRun);
  var keys = {};
  addEventListener('keydown', function (e) {
    var c = e.code;
    if (c === 'Space' || c.indexOf('Arrow') === 0) e.preventDefault();
    if (e.repeat) return;
    keys[c] = 1;
    if (c === 'Space') press();
    if (c === 'ArrowUp' || c === 'KeyW') upKey();
  });
  addEventListener('keyup', function (e) {
    keys[e.code] = 0;
    if (e.code === 'Space') lift();
  });
  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    press();
  });
  addEventListener('pointerup', function () {
    lift();
  });
  addEventListener('pointercancel', function () {
    lift();
  });
  reset();
  requestAnimationFrame(frame);
})();