function makeLink(params) {
  return location.origin + location.pathname + '?' + new URLSearchParams(params).toString();
}

function copyLink(params, msg) {
  const link = makeLink(params);
  navigator.clipboard.writeText(link).then(function () {
    msg.textContent = 'Ссылка скопирована!';
  }).catch(function () {
    msg.textContent = 'Скопируйте вручную: ' + link;
  });
}

function restartAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// Две кнопки

const buttonsScene = document.getElementById('buttons-scene');
const buttonsTries = document.getElementById('buttons-tries');
const buttonsResult = document.getElementById('buttons-result');
const btnLab = document.getElementById('btn-lab');
const btnSleep = document.getElementById('btn-sleep');
const sweat = document.getElementById('sweat');
const drops = sweat.querySelectorAll('.drop');

// верхняя панель комикса в процентах от картинки
const panel = { left: 4, right: 96, top: 2, bottom: 47 };
const sleepStart = { x: 66, y: 19 };

let sleepX = sleepStart.x;
let sleepY = sleepStart.y;
let tries = 0;
let sweatLevel = 0;
let lastDodge = 0;

// чем больше побегов, тем больше капель и тем быстрее они падают
function updateSweat() {
  drops.forEach(function (drop, i) {
    drop.classList.toggle('on', i < sweatLevel);
  });
  sweat.style.setProperty('--speed', Math.max(0.5, 1.6 - sweatLevel * 0.22) + 's');
}

function moveSleep(x, y) {
  sleepX = x;
  sleepY = y;
  btnSleep.style.left = x + '%';
  btnSleep.style.top = y + '%';
}

function resetButtons() {
  tries = 0;
  sweatLevel = 0;
  moveSleep(sleepStart.x, sleepStart.y);
  buttonsTries.textContent = 'Попыток поспать: 0';
  buttonsResult.hidden = true;
  updateSweat();
}

// px, py — где курсор или палец, в пикселях от левого верхнего угла картинки
function runAway(px, py) {
  if (Date.now() - lastDodge < 300) {
    return;
  }
  lastDodge = Date.now();

  // кнопки повёрнуты, поэтому берём их настоящие габариты
  const w = buttonsScene.clientWidth;
  const h = buttonsScene.clientHeight;
  const sleepRect = btnSleep.getBoundingClientRect();
  const labRect = btnLab.getBoundingClientRect();
  const halfW = sleepRect.width / 2 + 4;
  const halfH = sleepRect.height / 2 + 4;
  const minX = panel.left / 100 * w + halfW;
  const maxX = panel.right / 100 * w - halfW;
  const minY = panel.top / 100 * h + halfH;
  const maxY = panel.bottom / 100 * h - halfH;
  const labX = btnLab.offsetLeft;
  const labY = btnLab.offsetTop;
  const cx = sleepX / 100 * w;
  const cy = sleepY / 100 * h;

  // сначала прыгаем от курсора, если упёрлись в край — ищем случайное место подальше.
  // главное не залезть на «Сделать лабу», поэтому запоминаем запасной вариант
  let best = null;
  let spare = null;
  for (let i = 0; i < 200; i++) {
    let x;
    let y;
    if (i === 0) {
      const dx = cx - px;
      const dy = cy - py;
      const len = Math.hypot(dx, dy) || 1;
      x = cx + dx / len * w * 0.35;
      y = cy + dy / len * w * 0.35;
    } else {
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);
    }
    x = Math.min(Math.max(x, minX), maxX);
    y = Math.min(Math.max(y, minY), maxY);

    const farFromPointer = Math.hypot(x - px, y - py) > halfW + 40;
    const notOnLab = Math.abs(x - labX) > (sleepRect.width + labRect.width) / 2 + 4 ||
      Math.abs(y - labY) > (sleepRect.height + labRect.height) / 2 + 4;
    if (notOnLab && farFromPointer) {
      best = { x: x, y: y };
      break;
    }
    if (notOnLab && !spare) {
      spare = { x: x, y: y };
    }
  }
  if (!best) {
    best = spare || { x: cx, y: cy };
  }
  moveSleep(best.x / w * 100, best.y / h * 100);

  tries++;
  sweatLevel++;
  buttonsTries.textContent = 'Попыток поспать: ' + tries;
  buttonsResult.hidden = true;
  updateSweat();
}

function isNearSleep(px, py) {
  const cx = sleepX / 100 * buttonsScene.clientWidth;
  const cy = sleepY / 100 * buttonsScene.clientHeight;
  return Math.hypot(px - cx, py - cy) < btnSleep.offsetWidth / 2 + 30;
}

// мышь: убегаем, когда курсор подходит близко
buttonsScene.addEventListener('pointermove', function (e) {
  if (e.pointerType !== 'mouse') {
    return;
  }
  const r = buttonsScene.getBoundingClientRect();
  const px = e.clientX - r.left;
  const py = e.clientY - r.top;
  if (isNearSleep(px, py)) {
    runAway(px, py);
  }
});

// палец: убегаем при касании рядом с кнопкой
buttonsScene.addEventListener('pointerdown', function (e) {
  const r = buttonsScene.getBoundingClientRect();
  const px = e.clientX - r.left;
  const py = e.clientY - r.top;
  if (isNearSleep(px, py)) {
    runAway(px, py);
  }
});

// с клавиатуры тоже не нажать
btnSleep.addEventListener('click', function () {
  const cx = sleepX / 100 * buttonsScene.clientWidth;
  const cy = sleepY / 100 * buttonsScene.clientHeight;
  runAway(cx - 1, cy);
});

btnLab.addEventListener('click', function () {
  sweatLevel = 0;
  updateSweat();
  moveSleep(sleepStart.x, sleepStart.y);
  buttonsResult.hidden = false;
});

document.getElementById('buttons-reset').addEventListener('click', resetButtons);

// Отвлёкшийся парень

const bfForm = document.getElementById('boyfriend-form');
const bfScene = document.getElementById('boyfriend-scene');
const bfBox = document.getElementById('boyfriend-box');
const bfActions = document.getElementById('boyfriend-actions');
const bfResult = document.getElementById('boyfriend-result');
const bfMsg = document.getElementById('boyfriend-msg');
const labels = [
  document.getElementById('label-lure'),
  document.getElementById('label-who'),
  document.getElementById('label-should')
];

let bfData = null;
let bfTimers = [];

function stopBoyfriend() {
  bfTimers.forEach(function (t) {
    clearTimeout(t);
  });
  bfTimers = [];
}

// подписи прилетают по очереди, потом финал
function playBoyfriend() {
  stopBoyfriend();
  bfBox.classList.remove('win');
  bfResult.hidden = true;
  labels.forEach(function (label) {
    label.classList.remove('show');
  });
  void bfBox.offsetWidth;

  labels.forEach(function (label, i) {
    bfTimers.push(setTimeout(function () {
      label.classList.add('show');
    }, 400 + i * 800));
  });
  bfTimers.push(setTimeout(function () {
    bfBox.classList.add('win');
    bfResult.hidden = false;
  }, 400 + labels.length * 800 + 300));
}

function startBoyfriend(data) {
  bfData = data;
  bfForm.hidden = true;
  bfScene.hidden = false;
  bfActions.hidden = false;
  bfMsg.textContent = '';
  labels[0].textContent = data.lure;
  labels[1].textContent = data.who;
  labels[2].textContent = data.should;
  playBoyfriend();
}

function resetBoyfriend() {
  stopBoyfriend();
  bfScene.hidden = true;
  bfActions.hidden = true;
  bfForm.hidden = false;
  history.replaceState(null, '', location.pathname);
}

function fillBoyfriendForm(data) {
  document.getElementById('boyfriend-who').value = data.who;
  document.getElementById('boyfriend-should').value = data.should;
  document.getElementById('boyfriend-lure').value = data.lure;
}

bfForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const data = {
    who: document.getElementById('boyfriend-who').value.trim(),
    should: document.getElementById('boyfriend-should').value.trim(),
    lure: document.getElementById('boyfriend-lure').value.trim()
  };
  localStorage.setItem('boyfriend', JSON.stringify(data));
  history.replaceState(null, '', makeLink({ meme: 'boyfriend', who: data.who, should: data.should, lure: data.lure }));
  startBoyfriend(data);
});

document.getElementById('boyfriend-again').addEventListener('click', playBoyfriend);

document.getElementById('boyfriend-reset').addEventListener('click', resetBoyfriend);

document.getElementById('boyfriend-copy').addEventListener('click', function () {
  copyLink({ meme: 'boyfriend', who: bfData.who, should: bfData.should, lure: bfData.lure }, bfMsg);
});

// Ждун

const zhdunForm = document.getElementById('zhdun-form');
const zhdunScene = document.getElementById('zhdun-scene');
const zhdunActions = document.getElementById('zhdun-actions');
const zhdunTitle = document.getElementById('zhdun-title');
const zhdunTry = document.getElementById('zhdun-try');
const zhdunBar = document.getElementById('zhdun-bar');
const zhdunPercentEl = document.getElementById('zhdun-percent');
const zhdunStatus = document.getElementById('zhdun-status');
const zhdunMsg = document.getElementById('zhdun-msg');

const statuses = ['Ещё чуть-чуть…', 'Почти готово…', 'Печатает…', 'Прочитано'];

let zhdunData = null;
let zhdunTimer = null;
let zhdunStatusTimer = null;
let zhdunPercent = 0;
let zhdunAttempt = 1;
let statusIndex = 0;

function stopZhdun() {
  clearInterval(zhdunTimer);
  clearTimeout(zhdunTimer);
  clearInterval(zhdunStatusTimer);
}

function showPercent() {
  zhdunBar.style.width = zhdunPercent + '%';
  zhdunPercentEl.textContent = Math.floor(zhdunPercent) + '%';
}

// грузим до 99%, потом откатываемся и пробуем снова
function runZhdun() {
  zhdunTry.textContent = 'Попытка №' + zhdunAttempt;
  zhdunBar.classList.remove('back');
  const step = 99 / (zhdunData.time * 10);
  zhdunTimer = setInterval(function () {
    zhdunPercent = Math.min(zhdunPercent + step, 99);
    showPercent();
    if (zhdunPercent >= 99) {
      clearInterval(zhdunTimer);
      zhdunTimer = setTimeout(function () {
        zhdunBar.classList.add('back');
        zhdunPercent = 0;
        showPercent();
        zhdunAttempt++;
        zhdunTimer = setTimeout(runZhdun, 800);
      }, 1200);
    }
  }, 100);
}

function startZhdun(data) {
  stopZhdun();
  zhdunData = data;
  zhdunForm.hidden = true;
  zhdunScene.hidden = false;
  zhdunActions.hidden = false;
  zhdunMsg.textContent = '';

  zhdunTitle.textContent = 'Жду: ' + data.what;
  zhdunPercent = 0;
  zhdunAttempt = 1;
  statusIndex = 0;
  zhdunBar.classList.add('back');
  showPercent();
  zhdunStatus.textContent = statuses[0];
  restartAnimation(zhdunScene, 'play');

  runZhdun();
  zhdunStatusTimer = setInterval(function () {
    statusIndex = (statusIndex + 1) % statuses.length;
    zhdunStatus.textContent = statuses[statusIndex];
    restartAnimation(zhdunStatus, 'fade');
  }, 1500);
}

function resetZhdun() {
  stopZhdun();
  zhdunScene.hidden = true;
  zhdunActions.hidden = true;
  zhdunForm.hidden = false;
  history.replaceState(null, '', location.pathname);
}

function fillZhdunForm(data) {
  document.getElementById('zhdun-what').value = data.what;
  document.getElementById('zhdun-time').value = data.time;
}

zhdunForm.addEventListener('submit', function (e) {
  e.preventDefault();
  let time = parseInt(document.getElementById('zhdun-time').value) || 8;
  time = Math.min(Math.max(time, 3), 120);
  const data = {
    what: document.getElementById('zhdun-what').value.trim(),
    time: time
  };
  localStorage.setItem('zhdun', JSON.stringify(data));
  history.replaceState(null, '', makeLink({ meme: 'zhdun', what: data.what, time: data.time }));
  startZhdun(data);
});

document.getElementById('zhdun-reset').addEventListener('click', resetZhdun);

document.getElementById('zhdun-copy').addEventListener('click', function () {
  copyLink({ meme: 'zhdun', what: zhdunData.what, time: zhdunData.time }, zhdunMsg);
});
