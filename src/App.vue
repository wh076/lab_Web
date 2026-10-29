<script setup>
import { ref, computed } from 'vue';
import { levels } from './levels.js';
import { setSound, playClick, playDoor } from './sound.js';
import StartScreen from './components/StartScreen.vue';
import GameRoom from './components/GameRoom.vue';
import EndScreen from './components/EndScreen.vue';
import SettingsBar from './components/SettingsBar.vue';

function loadBest() {
  const best = { levels: [], total: null };
  for (let i = 0; i < levels.length; i++) {
    best.levels.push(null);
  }
  try {
    const data = JSON.parse(localStorage.getItem('dark-house-best'));
    if (data === null || typeof data !== 'object' || !Array.isArray(data.levels)) {
      return best;
    }
    for (let i = 0; i < levels.length; i++) {
      if (typeof data.levels[i] === 'number') {
        best.levels[i] = data.levels[i];
      }
    }
    if (typeof data.total === 'number') {
      best.total = data.total;
    }
  } catch (error) {
    return best;
  }
  return best;
}

function saveBest() {
  try {
    localStorage.setItem('dark-house-best', JSON.stringify(best.value));
  } catch (error) {
    return;
  }
}

const screen = ref('start');
const levelIndex = ref(0);
const results = ref([]);
const total = ref(0);
const newRecord = ref(false);
const best = ref(loadBest());
const soundOn = ref(false);
const scareOn = ref(true);

const currentLevel = computed(function () {
  return levels[levelIndex.value];
});

function toggleSound() {
  soundOn.value = !soundOn.value;
  setSound(soundOn.value);
  playClick();
}

function toggleScare() {
  scareOn.value = !scareOn.value;
  playClick();
}

function startGame() {
  results.value = [];
  levelIndex.value = 0;
  newRecord.value = false;
  screen.value = 'game';
  playDoor();
}

function nextLevel(time) {
  const index = levelIndex.value;
  results.value.push(time);
  if (best.value.levels[index] === null || time < best.value.levels[index]) {
    best.value.levels[index] = time;
  }

  if (index + 1 < levels.length) {
    levelIndex.value++;
  } else {
    let sum = 0;
    for (let i = 0; i < results.value.length; i++) {
      sum += results.value[i];
    }
    total.value = sum;
    newRecord.value = best.value.total === null || sum < best.value.total;
    if (newRecord.value) {
      best.value.total = sum;
    }
    screen.value = 'end';
  }
  saveBest();
}
</script>

<template>
  <main class="app">
    <StartScreen v-if="screen === 'start'" @start="startGame">
      <SettingsBar :sound-on="soundOn" :scare-on="scareOn" @toggle-sound="toggleSound" @toggle-scare="toggleScare" />
    </StartScreen>

    <GameRoom
      v-else-if="screen === 'game'"
      :key="currentLevel.id"
      :level="currentLevel"
      :level-number="levelIndex + 1"
      :level-count="levels.length"
      :best-time="best.levels[levelIndex]"
      :scare-on="scareOn"
      @next="nextLevel"
    >
      <SettingsBar :sound-on="soundOn" :scare-on="scareOn" @toggle-sound="toggleSound" @toggle-scare="toggleScare" />
    </GameRoom>

    <EndScreen
      v-else
      :levels="levels"
      :total="total"
      :best-total="best.total"
      :new-record="newRecord"
      @again="startGame"
    />
  </main>
</template>
