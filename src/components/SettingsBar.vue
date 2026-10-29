<script setup>
defineProps({
  soundOn: Boolean,
  scareOn: Boolean,
});

const emit = defineEmits(['toggle-sound', 'toggle-scare']);
</script>

<template>
  <div class="settings">
    <button
      type="button"
      class="button button--outline button--icon"
      aria-label="Звук"
      :aria-pressed="soundOn ? 'true' : 'false'"
      @click="emit('toggle-sound')"
    >
      <svg class="button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        <path v-if="soundOn" d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
        <path v-else d="M16 9l6 6M22 9l-6 6" />
      </svg>
    </button>

    <button
      type="button"
      class="button button--outline button--icon"
      aria-label="Скример"
      :aria-pressed="scareOn ? 'true' : 'false'"
      @click="emit('toggle-scare')"
    >
      <svg class="button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <ellipse cx="12" cy="14" rx="9" ry="7" />
        <path d="M12 7V4l2-1M9 12l1 1M15 12l-1 1M9 17h6" />
        <path v-if="!scareOn" d="M3 3l18 18" />
      </svg>
    </button>
  </div>
</template>
