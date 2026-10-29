<script setup>
import FallingLeaves from './FallingLeaves.vue';
import CobwebSvg from './CobwebSvg.vue';

const emit = defineEmits(['start']);
</script>

<template>
  <section class="screen" aria-labelledby="start-title">
    <FallingLeaves />
    <CobwebSvg class="screen__web screen__web--left" />
    <CobwebSvg class="screen__web screen__web--right" />

    <div class="screen__content">
      <h1 id="start-title" class="screen__title">Тёмный дом</h1>

      <button type="button" class="button button--primary button--big" aria-label="Войти в дом" @click="emit('start')">
        Войти в дом
      </button>

      <slot />
    </div>
  </section>
</template>
