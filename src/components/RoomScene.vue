<script setup>
defineProps({
  scene: String,
});

const colors = ['#5b2a86', '#8a3b12', '#2f4a3a', '#6b1f3a', '#3a3f7a'];
const books = [];
for (let shelf = 0; shelf < 4; shelf++) {
  let x = 0;
  let i = 0;
  while (x < 40) {
    const width = 3 + (i * 7) % 4;
    const height = 10 + (i * 5) % 5;
    books.push({ x: x, y: 26 + shelf * 15 - height, width: width, height: height, color: colors[(i + shelf) % colors.length] });
    x += width + 0.6;
    i++;
  }
}
</script>

<template>
  <svg class="room-scene" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g v-if="scene === 'hall'">
      <rect x="0" y="72" width="160" height="18" fill="#1a0e10" />
      <rect x="18" y="28" width="26" height="44" rx="2" fill="#2a160f" stroke="#4a2a18" stroke-width="1.5" />
      <rect x="22" y="32" width="18" height="16" fill="#331b12" />
      <rect x="22" y="52" width="18" height="16" fill="#331b12" />
      <circle cx="39" cy="51" r="1.4" fill="#d4a24c" />
      <rect x="62" y="22" width="22" height="16" fill="#241430" stroke="#6b4a2a" stroke-width="1.5" />
      <circle cx="73" cy="30" r="4" fill="#3a2350" />
      <rect x="104" y="12" width="34" height="36" fill="#1b2a4a" stroke="#3b2a4f" stroke-width="2" />
      <circle cx="126" cy="24" r="6" fill="#f5e7b8" />
      <line x1="121" y1="12" x2="121" y2="48" stroke="#3b2a4f" stroke-width="1.5" />
      <line x1="104" y1="30" x2="138" y2="30" stroke="#3b2a4f" stroke-width="1.5" />
      <rect x="96" y="66" width="50" height="6" rx="2" fill="#2a160f" />
    </g>

    <g v-else-if="scene === 'library'">
      <rect x="0" y="76" width="160" height="14" fill="#140c0a" />
      <g transform="translate(8 0)">
        <rect x="-2" y="8" width="46" height="66" fill="#2a160f" />
        <rect v-for="(book, index) in books" :key="'l' + index" :x="book.x" :y="book.y" :width="book.width" :height="book.height" :fill="book.color" />
        <rect v-for="shelf in 4" :key="'ls' + shelf" x="-2" :y="26 + (shelf - 1) * 15" width="46" height="2" fill="#4a2a18" />
      </g>
      <g transform="translate(110 0)">
        <rect x="-2" y="8" width="46" height="66" fill="#2a160f" />
        <rect v-for="(book, index) in books" :key="'r' + index" :x="book.x" :y="book.y" :width="book.width" :height="book.height" :fill="book.color" />
        <rect v-for="shelf in 4" :key="'rs' + shelf" x="-2" :y="26 + (shelf - 1) * 15" width="46" height="2" fill="#4a2a18" />
      </g>
      <rect x="66" y="58" width="28" height="4" fill="#3a2016" />
      <rect x="70" y="62" width="3" height="14" fill="#3a2016" />
      <rect x="87" y="62" width="3" height="14" fill="#3a2016" />
      <rect x="76" y="50" width="3" height="8" fill="#e8dcc0" />
      <path d="M77.5 46 Q76 48 77.5 50 Q79 48 77.5 46 Z" fill="#ffb347" />
    </g>

    <g v-else>
      <polygon points="0,0 80,0 0,60" fill="#120a0a" />
      <polygon points="160,0 80,0 160,60" fill="#120a0a" />
      <line x1="0" y1="20" x2="160" y2="20" stroke="#3a2016" stroke-width="3" />
      <line x1="40" y1="0" x2="40" y2="90" stroke="#2a160f" stroke-width="3" />
      <line x1="120" y1="0" x2="120" y2="90" stroke="#2a160f" stroke-width="3" />
      <circle cx="80" cy="34" r="10" fill="#1b2a4a" stroke="#3a2016" stroke-width="2" />
      <circle cx="83" cy="31" r="3.5" fill="#f5e7b8" />
      <rect x="0" y="74" width="160" height="16" fill="#1a1008" />
      <rect x="14" y="60" width="22" height="14" fill="#3a2016" stroke="#5a3520" stroke-width="1" />
      <rect x="128" y="56" width="20" height="18" fill="#2f1b10" stroke="#5a3520" stroke-width="1" />
      <rect x="132" y="48" width="12" height="8" fill="#3a2016" />
    </g>
  </svg>
</template>
