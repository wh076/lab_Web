<script setup>
import PumpkinSvg from './creatures/PumpkinSvg.vue';
</script>

<template>
  <div class="scare" aria-hidden="true">
    <p class="scare__text">Бу!</p>
    <div class="scare__pumpkin">
      <PumpkinSvg scream />
    </div>
  </div>
</template>
