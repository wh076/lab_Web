let audio = null;
let enabled = false;

export function setSound(value) {
  enabled = value;
  if (enabled && audio === null) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audio = new AudioContext();
    }
  }
  if (audio !== null && audio.state === 'suspended') {
    audio.resume();
  }
}

function tone(startFreq, endFreq, duration, type, volume, delay) {
  if (!enabled || audio === null) {
    return;
  }
  const time = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFreq, time);
  oscillator.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.05);
}

export function playClick() {
  tone(600, 400, 0.1, 'triangle', 0.15, 0);
}

export function playDoor() {
  tone(90, 180, 0.5, 'sawtooth', 0.05, 0);
  tone(160, 120, 0.4, 'sawtooth', 0.04, 0.45);
}

export function playFound() {
  tone(520, 1040, 0.25, 'triangle', 0.2, 0);
  tone(780, 1560, 0.3, 'sine', 0.12, 0.08);
}

export function playEscape() {
  tone(900, 200, 0.35, 'sine', 0.15, 0);
}

export function playBoo() {
  tone(260, 90, 0.7, 'sawtooth', 0.15, 0);
  tone(390, 130, 0.6, 'square', 0.05, 0);
}

export function playWin() {
  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i++) {
    tone(notes[i], notes[i], 0.25, 'triangle', 0.15, i * 0.12);
  }
}
