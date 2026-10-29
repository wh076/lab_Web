<script setup>
import { ref, onMounted } from 'vue';
import FallingLeaves from './FallingLeaves.vue';
import CobwebSvg from './CobwebSvg.vue';
import ResultStats from './ResultStats.vue';

const props = defineProps({
  levels: Array,
  total: Number,
  bestTotal: Number,
  newRecord: Boolean,
});

const emit = defineEmits(['again']);

const againButton = ref(null);

let ghostCount = 0;
for (let i = 0; i < props.levels.length; i++) {
  ghostCount += props.levels[i].ghosts;
}

onMounted(function () {
  againButton.value.focus();
});
</script>

<template>
  <section class="screen" aria-label="Результат">
    <FallingLeaves />
    <CobwebSvg class="screen__web screen__web--left" />
    <CobwebSvg class="screen__web screen__web--right" />

    <div class="screen__content">
      <ResultStats
        :found="ghostCount"
        :count="ghostCount"
        :time="total"
        :best="bestTotal"
        :record="newRecord"
      />

      <button ref="againButton" type="button" class="button button--primary button--big" aria-label="Ещё раз" @click="emit('again')">
        Ещё раз
      </button>
    </div>
  </section>
</template>
