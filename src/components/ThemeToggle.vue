<script setup>
defineProps({
  theme: String,
});

const emit = defineEmits(['toggle']);
</script>

<template>
  <button
    type="button"
    class="button theme-switcher"
    :aria-pressed="theme === 'dark' ? 'true' : 'false'"
    @click="emit('toggle')"
  >
    <svg class="button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
    <span>Тёмная тема</span>
  </button>
</template>
