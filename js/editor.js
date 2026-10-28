const editorMemes = {
  drake: {
    title: 'Дрейк',
    img: 'img/drake.jpg',
    alt: 'Дрейк отворачивается от одного варианта и одобряет другой',
    texts: [['Учить весь семестр', 75, 25], ['Учить за ночь перед экзаменом', 75, 75]],
    style: { size: 34, color: '#111111', stroke: 0, font: 'Montserrat, sans-serif', width: 45 }
  }
};

const stage = document.getElementById('stage');
const stageImg = document.getElementById('stage-img');
const editorTitle = document.getElementById('editor-title');
const blocksEl = document.getElementById('blocks');
const stylesEl = document.querySelector('.styles');
const sizeInput = document.getElementById('font-size');
const sizeVal = document.getElementById('size-val');
const colorInput = document.getElementById('font-color');
const strokeColorInput = document.getElementById('stroke-color');
const strokeInput = document.getElementById('stroke-width');
const strokeVal = document.getElementById('stroke-val');
const fontInput = document.getElementById('font-family');
const uploadInput = document.getElementById('upload');

let currentId = null;
let state = null;
let selected = 0;
let drag = null;

function newBlock(text, x, y) {
  return {
    text: text,
    x: x,
    y: y,
    size: 44,
    color: '#ffffff',
    strokeColor: '#000000',
    stroke: 3,
    font: 'Impact, Oswald, sans-serif',
    width: 90
  };
}

function getDefaults(id) {
  return {
    img: editorMemes[id].img,
    blocks: editorMemes[id].texts.map(function (t) {
      return Object.assign(newBlock(t[0], t[1], t[2]), editorMemes[id].style);
    })
  };
}

function save() {
  const key = 'meme-' + currentId;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // своя картинка не влезла в localStorage — сохраняем только текст
    localStorage.setItem(key, JSON.stringify({ img: editorMemes[currentId].img, blocks: state.blocks }));
  }
}

function openEditor(id) {
  currentId = id;
  const saved = localStorage.getItem('meme-' + id);
  state = saved ? JSON.parse(saved) : getDefaults(id);
  selected = 0;
  editorTitle.textContent = editorMemes[id].title;
  stageImg.alt = editorMemes[id].alt;
  stageImg.src = state.img;
  renderList();
  renderStage();
  updateControls();
}

// размер текста считаем от ширины картинки 500px, чтобы на телефоне было так же
function applyStyle(el, b, k) {
  el.style.left = b.x + '%';
  el.style.top = b.y + '%';
  el.style.maxWidth = b.width + '%';
  el.style.fontSize = b.size * k + 'px';
  el.style.color = b.color;
  el.style.fontFamily = b.font;
  el.style.webkitTextStroke = b.stroke * 2 * k + 'px ' + b.strokeColor;
}

function renderStage() {
  stage.querySelectorAll('.meme-text').forEach(function (el) {
    el.remove();
  });
  const k = stage.clientWidth / 500;
  state.blocks.forEach(function (b, i) {
    const el = document.createElement('div');
    el.className = 'meme-text';
    if (i === selected) {
      el.classList.add('active');
    }
    el.textContent = b.text;
    applyStyle(el, b, k);
    el.addEventListener('pointerdown', function (e) {
      startDrag(e, i, el);
    });
    stage.appendChild(el);
  });
}

function renderList() {
  blocksEl.innerHTML = '';
  state.blocks.forEach(function (b, i) {
    const div = document.createElement('div');
    div.className = i === selected ? 'block active' : 'block';

    const label = document.createElement('label');
    label.className = 'field';
    const span = document.createElement('span');
    span.className = 'field-label';
    span.textContent = 'Текст ' + (i + 1);
    const area = document.createElement('textarea');
    area.rows = 2;
    area.value = b.text;
    area.addEventListener('input', function () {
      b.text = area.value;
      renderStage();
      save();
    });
    area.addEventListener('focus', function () {
      selectBlock(i);
    });
    label.appendChild(span);
    label.appendChild(area);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-del';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Удалить текст ' + (i + 1));
    del.addEventListener('click', function () {
      state.blocks.splice(i, 1);
      if (selected >= state.blocks.length) {
        selected = state.blocks.length - 1;
      }
      renderList();
      renderStage();
      updateControls();
      save();
    });

    div.appendChild(label);
    div.appendChild(del);
    blocksEl.appendChild(div);
  });
}

function selectBlock(i) {
  selected = i;
  stage.querySelectorAll('.meme-text').forEach(function (el, j) {
    el.classList.toggle('active', j === i);
  });
  blocksEl.querySelectorAll('.block').forEach(function (el, j) {
    el.classList.toggle('active', j === i);
  });
  updateControls();
}

function updateControls() {
  const b = state.blocks[selected];
  stylesEl.disabled = !b;
  if (!b) {
    return;
  }
  sizeInput.value = b.size;
  sizeVal.textContent = b.size;
  colorInput.value = b.color;
  strokeColorInput.value = b.strokeColor;
  strokeInput.value = b.stroke;
  strokeVal.textContent = b.stroke;
  fontInput.value = b.font;
}

function changeStyle() {
  const b = state.blocks[selected];
  if (!b) {
    return;
  }
  b.size = Number(sizeInput.value);
  b.color = colorInput.value;
  b.strokeColor = strokeColorInput.value;
  b.stroke = Number(strokeInput.value);
  b.font = fontInput.value;
  sizeVal.textContent = b.size;
  strokeVal.textContent = b.stroke;
  renderStage();
  save();
}

[sizeInput, colorInput, strokeColorInput, strokeInput, fontInput].forEach(function (input) {
  input.addEventListener('input', changeStyle);
});

// перетаскивание мышью и пальцем
function startDrag(e, i, el) {
  e.preventDefault();
  selectBlock(i);
  const rect = stage.getBoundingClientRect();
  const b = state.blocks[i];
  drag = {
    el: el,
    block: b,
    dx: e.clientX - (rect.left + b.x / 100 * rect.width),
    dy: e.clientY - (rect.top + b.y / 100 * rect.height)
  };
  el.setPointerCapture(e.pointerId);
  el.classList.add('drag');
}

stage.addEventListener('pointermove', function (e) {
  if (!drag) {
    return;
  }
  const rect = stage.getBoundingClientRect();
  let x = (e.clientX - drag.dx - rect.left) / rect.width * 100;
  let y = (e.clientY - drag.dy - rect.top) / rect.height * 100;
  drag.block.x = Math.min(Math.max(x, 0), 100);
  drag.block.y = Math.min(Math.max(y, 0), 100);
  drag.el.style.left = drag.block.x + '%';
  drag.el.style.top = drag.block.y + '%';
});

function endDrag() {
  if (!drag) {
    return;
  }
  drag.el.classList.remove('drag');
  drag = null;
  save();
}

stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);

document.getElementById('add-block').addEventListener('click', function () {
  state.blocks.push(newBlock('НОВЫЙ ТЕКСТ', 50, 50));
  selected = state.blocks.length - 1;
  renderList();
  renderStage();
  updateControls();
  save();
});

uploadInput.addEventListener('change', function () {
  const file = uploadInput.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    state.img = reader.result;
    stageImg.src = state.img;
    save();
  };
  reader.readAsDataURL(file);
  uploadInput.value = '';
});

document.getElementById('editor-reset').addEventListener('click', function () {
  localStorage.removeItem('meme-' + currentId);
  openEditor(currentId);
});

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  text.split('\n').forEach(function (part) {
    let line = '';
    part.split(' ').forEach(function (word) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    lines.push(line);
  });
  return lines;
}

async function downloadMeme() {
  const canvas = document.createElement('canvas');
  canvas.width = stageImg.naturalWidth;
  canvas.height = stageImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(stageImg, 0, 0);

  const k = canvas.width / 500;
  for (const b of state.blocks) {
    const size = b.size * k;
    ctx.font = size + 'px ' + b.font;
    await document.fonts.load(ctx.font);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.fillStyle = b.color;
    ctx.strokeStyle = b.strokeColor;
    ctx.lineWidth = b.stroke * 2 * k;

    const lines = wrapText(ctx, b.text, canvas.width * b.width / 100);
    const lineHeight = size * 1.1;
    const x = b.x / 100 * canvas.width;
    let y = b.y / 100 * canvas.height - (lines.length - 1) * lineHeight / 2;
    lines.forEach(function (line) {
      if (b.stroke > 0) {
        ctx.strokeText(line, x, y);
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
    });
  }

  const link = document.createElement('a');
  link.download = 'meme-' + currentId + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

document.getElementById('download').addEventListener('click', downloadMeme);

stageImg.addEventListener('load', renderStage);

window.addEventListener('resize', function () {
  if (state && !document.getElementById('editor-view').hidden) {
    renderStage();
  }
});
