<script setup>
defineProps({
  scream: Boolean,
});
</script>

<template>
  <svg class="pumpkin-svg" viewBox="0 0 100 90" aria-hidden="true" focusable="false">
    <path d="M50 18 Q48 8 56 2" stroke="#4d7c0f" stroke-width="6" fill="none" stroke-linecap="round" />
    <path d="M54 12 Q66 4 72 12 Q62 14 54 16 Z" fill="#65a30d" />
    <ellipse cx="30" cy="54" rx="24" ry="32" fill="#e8590c" />
    <ellipse cx="70" cy="54" rx="24" ry="32" fill="#e8590c" />
    <ellipse cx="50" cy="54" rx="22" ry="34" fill="#ff7a1a" />
    <path d="M38 24 Q30 54 38 86 M62 24 Q70 54 62 86" stroke="#c2410c" stroke-width="2" fill="none" />
    <path d="M28 44 L38 32 L44 46 Z" fill="#fde047" />
    <path d="M72 44 L62 32 L56 46 Z" fill="#fde047" />
    <path d="M47 52 L50 46 L53 52 Z" fill="#fde047" />
    <ellipse v-if="scream" cx="50" cy="68" rx="16" ry="12" fill="#fde047" />
    <path
      v-else
      d="M26 62 Q50 82 74 62 L68 64 L64 70 L58 66 L50 72 L42 66 L36 70 L32 64 Z"
      fill="#fde047"
    />
  </svg>
</template>
