<script setup>
const colors = ['#ff8a1f', '#c2410c', '#9b5de5', '#f59e0b', '#7c3aed'];
const leaves = [];
for (let i = 0; i < 14; i++) {
  leaves.push({
    id: i,
    left: Math.random() * 100,
    size: 16 + Math.random() * 18,
    delay: Math.random() * -14,
    duration: 9 + Math.random() * 8,
    color: colors[i % colors.length],
  });
}
</script>

<template>
  <div class="leaves" aria-hidden="true">
    <svg
      v-for="leaf in leaves"
      :key="leaf.id"
      class="leaves__leaf"
      viewBox="0 0 40 40"
      focusable="false"
      :style="{
        left: leaf.left + '%',
        width: leaf.size + 'px',
        height: leaf.size + 'px',
        color: leaf.color,
        animationDelay: leaf.delay + 's',
        animationDuration: leaf.duration + 's',
      }"
    >
      <path d="M20 2 L24 12 L34 8 L30 18 L38 22 L28 26 L30 36 L20 30 L10 36 L12 26 L2 22 L10 18 L6 8 L16 12 Z" fill="currentColor" />
      <path d="M20 12 L20 40" stroke="#2a160f" stroke-width="1.5" />
    </svg>
  </div>
</template>
