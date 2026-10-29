<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { debts } from '../levels.js';
import { formatTime } from '../format.js';
import { playFound, playEscape, playBoo, playWin } from '../sound.js';
import RoomScene from './RoomScene.vue';
import ScarePumpkin from './ScarePumpkin.vue';
import ResultStats from './ResultStats.vue';
import GhostSvg from './creatures/GhostSvg.vue';
import PumpkinSvg from './creatures/PumpkinSvg.vue';
import SpiderSvg from './creatures/SpiderSvg.vue';
import BatSvg from './creatures/BatSvg.vue';

const props = defineProps({
  level: Object,
  levelNumber: Number,
  levelCount: Number,
  bestTime: Number,
  scareOn: Boolean,
});

const emit = defineEmits(['next']);

const room = ref(null);
const flashlight = ref(null);
const title = ref(null);
const nextButton = ref(null);

const ghosts = ref([]);
const decor = ref([]);
const captions = ref([]);
const time = ref(0);
const status = ref('play');
const message = ref('');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let cells = [];
let timers = [];
let timerId = null;
let frameId = null;
let startTime = 0;
let captionId = 0;

let roomWidth = 0;
let roomHeight = 0;
let radius = 100;
let lightX = 0;
let lightY = 0;
let targetX = 0;
let targetY = 0;

let samples = [];
let speed = 0;

const runSpeed = 0.8;
const runTime = 500;
const maxRuns = 2;

const foundCount = computed(function () {
  return ghosts.value.filter(function (ghost) {
    return ghost.found;
  }).length;
});

const visibleGhosts = computed(function () {
  return ghosts.value.filter(function (ghost) {
    return !ghost.gone;
  });
});

const isRecord = computed(function () {
  return props.bestTime === null || time.value < props.bestTime;
});

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function later(callback, delay) {
  timers.push(setTimeout(callback, delay));
}

function makeCells() {
  let cols = 5;
  let rows = 3;
  if (roomHeight > roomWidth) {
    cols = 3;
    rows = 5;
  }
  const list = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      list.push({
        x: ((col + 0.5) / cols) * 100 + (Math.random() - 0.5) * (40 / cols),
        y: ((row + 0.5) / rows) * 100 + (Math.random() - 0.5) * (40 / rows),
        busy: false,
      });
    }
  }
  return list;
}

function takeCell() {
  const free = cells.filter(function (cell) {
    return !cell.busy;
  });
  const cell = free[Math.floor(Math.random() * free.length)];
  cell.busy = true;
  return cell;
}

function setupRoom() {
  cells = makeCells();
  const names = shuffle(debts.slice());

  const list = [];
  for (let i = 0; i < props.level.ghosts; i++) {
    const cell = takeCell();
    list.push({
      id: i,
      name: names[i].name,
      text: names[i].text,
      x: cell.x,
      y: cell.y,
      found: false,
      gone: false,
      runs: 0,
      running: false,
    });
  }
  ghosts.value = list;

  const items = [];
  for (let i = 0; i < props.level.decor.length; i++) {
    const cell = takeCell();
    items.push({ id: i, type: props.level.decor[i], x: cell.x, y: cell.y });
  }
  decor.value = items;
}

function drawLight() {
  flashlight.value.style.transform =
    'translate(' + (lightX - roomWidth) + 'px, ' + (lightY - roomHeight) + 'px)';
}

function updateSize() {
  const rect = room.value.getBoundingClientRect();
  roomWidth = rect.width;
  roomHeight = rect.height;
  radius = Math.round(Math.min(props.level.light, Math.min(roomWidth, roomHeight) * 0.3));
  flashlight.value.style.setProperty('--radius', radius + 'px');
  drawLight();
}

// Фонарик догоняет курсор с небольшим сглаживанием
function lightLoop() {
  lightX += (targetX - lightX) * 0.35;
  lightY += (targetY - lightY) * 0.35;
  if (Math.abs(targetX - lightX) < 0.5 && Math.abs(targetY - lightY) < 0.5) {
    lightX = targetX;
    lightY = targetY;
    frameId = null;
  } else {
    frameId = requestAnimationFrame(lightLoop);
  }
  drawLight();
}

function moveLight(x, y) {
  targetX = x;
  targetY = y;
  if (reduceMotion) {
    lightX = x;
    lightY = y;
    drawLight();
    return;
  }
  if (frameId === null) {
    frameId = requestAnimationFrame(lightLoop);
  }
}

// Скорость считаем по пути курсора за последние ~100 мс
function updateSpeed(x, y, now) {
  samples.push({ x: x, y: y, time: now });
  while (samples.length > 2 && now - samples[0].time > 100) {
    samples.shift();
  }
  if (samples.length < 2) {
    speed = 0;
    return;
  }
  let path = 0;
  for (let i = 1; i < samples.length; i++) {
    path += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
  }
  speed = path / Math.max(now - samples[0].time, 16);
}

function onPointerMove(event) {
  const rect = room.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  updateSpeed(x, y, performance.now());
  moveLight(x, y);

  if (samples.length > 1) {
    const prev = samples[samples.length - 2];
    checkRun(prev.x, prev.y, x, y);
  }
}

function onPointerDown(event) {
  samples = [];
  onPointerMove(event);
}

function onPointerLeave() {
  samples = [];
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;
  let t = 0;
  if (length > 0) {
    t = ((px - ax) * dx + (py - ay) * dy) / length;
    t = Math.min(Math.max(t, 0), 1);
  }
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function ghostSize(ghost) {
  const element = document.getElementById('ghost-' + ghost.id);
  if (element === null) {
    return { width: 70, height: 84 };
  }
  return { width: element.offsetWidth, height: element.offsetHeight };
}

// Если курсор резко пролетел через призрака, он убегает
function checkRun(fromX, fromY, x, y) {
  if (status.value !== 'play' || speed < runSpeed) {
    return;
  }
  const moveX = x - fromX;
  const moveY = y - fromY;
  const length = Math.hypot(moveX, moveY);
  if (length === 0) {
    return;
  }
  for (let i = 0; i < ghosts.value.length; i++) {
    const ghost = ghosts.value[i];
    if (!ghost.found && !ghost.running && ghost.runs < maxRuns) {
      const size = ghostSize(ghost);
      const area = Math.max(size.width, size.height) / 2 + 20;
      const ghostX = (ghost.x / 100) * roomWidth;
      const ghostY = (ghost.y / 100) * roomHeight;
      if (distanceToSegment(ghostX, ghostY, fromX, fromY, x, y) < area) {
        runAway(ghost, moveX / length, moveY / length);
      }
    }
  }
}

// Убегает по направлению движения курсора, то есть прочь от него
function runAway(ghost, dirX, dirY) {
  ghost.runs++;
  ghost.running = true;
  addCaption('Убежал!', ghost.x, ghost.y);

  const size = ghostSize(ghost);
  const halfWidth = size.width / 2 + 8;
  const halfHeight = size.height / 2 + 8;
  const startX = (ghost.x / 100) * roomWidth;
  const startY = (ghost.y / 100) * roomHeight;
  const distance = Math.max(Math.min(roomWidth, roomHeight) * 0.35, 120);
  const angles = [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8, 3.14];

  let bestX = startX;
  let bestY = startY;
  let bestMove = 0;
  for (let i = 0; i < angles.length; i++) {
    const cos = Math.cos(angles[i]);
    const sin = Math.sin(angles[i]);
    const x = startX + (dirX * cos - dirY * sin) * distance;
    const y = startY + (dirX * sin + dirY * cos) * distance;
    const newX = Math.min(Math.max(x, halfWidth), roomWidth - halfWidth);
    const newY = Math.min(Math.max(y, halfHeight), roomHeight - halfHeight);
    const moved = Math.hypot(newX - startX, newY - startY);
    if (moved > bestMove) {
      bestX = newX;
      bestY = newY;
      bestMove = moved;
    }
    if (moved >= distance * 0.7) {
      break;
    }
  }

  ghost.x = (bestX / roomWidth) * 100;
  ghost.y = (bestY / roomHeight) * 100;
  playEscape();
  message.value = 'Призрак испугался света и убежал';

  let delay = runTime;
  if (reduceMotion) {
    delay = 50;
  }
  later(function () {
    ghost.running = false;
  }, delay);
}

function lightToGhost(ghost) {
  moveLight((ghost.x / 100) * roomWidth, (ghost.y / 100) * roomHeight);
}

function addCaption(text, x, y) {
  captionId++;
  const id = captionId;
  captions.value.push({
    id: id,
    text: text,
    x: Math.min(Math.max(x, 20), 80),
    y: Math.max(y, 12),
  });
  later(function () {
    captions.value = captions.value.filter(function (caption) {
      return caption.id !== id;
    });
  }, 1800);
}

async function catchGhost(ghost, event) {
  if (ghost.found || ghost.running || status.value !== 'play') {
    return;
  }
  ghost.found = true;
  addCaption(ghost.text, ghost.x, ghost.y);
  playFound();
  message.value = ghost.text + '. Найдено ' + foundCount.value + ' из ' + ghosts.value.length + '.';
  later(function () {
    ghost.gone = true;
  }, 700);

  if (foundCount.value === ghosts.value.length) {
    finishLevel();
    return;
  }

  // С клавиатуры переводим фокус на следующего призрака
  if (event.detail === 0) {
    const next = ghosts.value.find(function (item) {
      return !item.found;
    });
    await nextTick();
    document.getElementById('ghost-' + next.id).focus();
  }
}

function finishLevel() {
  clearInterval(timerId);
  time.value = (Date.now() - startTime) / 1000;
  status.value = 'wait';
  if (props.scareOn) {
    later(function () {
      status.value = 'scare';
      playBoo();
    }, 600);
    later(showResult, 2400);
  } else {
    later(showResult, 800);
  }
}

async function showResult() {
  status.value = 'done';
  playWin();
  await nextTick();
  nextButton.value.focus();
}

onMounted(function () {
  updateSize();
  setupRoom();
  lightX = roomWidth / 2;
  lightY = roomHeight / 2;
  targetX = lightX;
  targetY = lightY;
  drawLight();

  startTime = Date.now();
  timerId = setInterval(function () {
    time.value = (Date.now() - startTime) / 1000;
  }, 100);

  window.addEventListener('resize', updateSize);
  title.value.focus();
});

onBeforeUnmount(function () {
  clearInterval(timerId);
  for (let i = 0; i < timers.length; i++) {
    clearTimeout(timers[i]);
  }
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
  }
  window.removeEventListener('resize', updateSize);
});
</script>

<template>
  <div class="game">
    <div class="hud">
      <h2 ref="title" class="hud__title" tabindex="-1">
        Комната {{ levelNumber }}/{{ levelCount }}: {{ level.name }}
      </h2>
      <p class="hud__stats">
        <span>Найдено: <b>{{ foundCount }} / {{ ghosts.length }}</b></span>
        <span>Время: <b>{{ formatTime(time) }}</b></span>
        <span v-if="bestTime !== null">Рекорд: <b>{{ formatTime(bestTime) }}</b></span>
      </p>
      <slot />
    </div>

    <div
      ref="room"
      class="room"
      :class="['room--' + level.scene, { 'room--lit': status !== 'play' }]"
      @pointermove="onPointerMove"
      @pointerdown="onPointerDown"
      @pointerleave="onPointerLeave"
    >
      <RoomScene :scene="level.scene" />

      <div
        v-for="item in decor"
        :key="'decor-' + item.id"
        class="decor"
        :class="'decor--' + item.type"
        :style="{ left: item.x + '%', top: item.y + '%' }"
      >
        <PumpkinSvg v-if="item.type === 'pumpkin'" />
        <SpiderSvg v-else-if="item.type === 'spider'" />
        <BatSvg v-else />
      </div>

      <button
        v-for="ghost in visibleGhosts"
        :key="'ghost-' + ghost.id"
        :id="'ghost-' + ghost.id"
        type="button"
        class="ghost"
        :class="{ 'ghost--found': ghost.found, 'ghost--running': ghost.running }"
        :style="{ left: ghost.x + '%', top: ghost.y + '%' }"
        :aria-label="'Призрак: ' + ghost.name"
        :tabindex="ghost.found ? -1 : 0"
        @click="catchGhost(ghost, $event)"
        @focus="lightToGhost(ghost)"
      >
        <GhostSvg />
      </button>

      <div ref="flashlight" class="flashlight" aria-hidden="true"></div>

      <p
        v-for="caption in captions"
        :key="'caption-' + caption.id"
        class="caption"
        :style="{ left: caption.x + '%', top: caption.y + '%' }"
        aria-hidden="true"
      >
        {{ caption.text }}
      </p>
    </div>

    <p class="visually-hidden" aria-live="polite">{{ message }}</p>

    <ScarePumpkin v-if="status === 'scare'" />

    <div v-if="status === 'done'" class="overlay">
      <section class="panel" aria-label="Комната пройдена">
        <ResultStats
          :found="ghosts.length"
          :count="ghosts.length"
          :time="time"
          :best="isRecord ? time : bestTime"
          :record="isRecord"
        />
        <button
          ref="nextButton"
          type="button"
          class="button button--primary"
          :aria-label="levelNumber < levelCount ? 'Следующая комната' : 'К результатам'"
          @click="emit('next', time)"
        >
          {{ levelNumber < levelCount ? 'Следующая комната' : 'К результатам' }}
        </button>
      </section>
    </div>
  </div>
</template>
