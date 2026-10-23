<script setup>
defineProps({
  modelValue: String,
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="search">
    <label for="search-input" class="visually-hidden">Поиск задач</label>
    <input
      type="search"
      id="search-input"
      class="search__input"
      placeholder="Поиск по названию"
      autocomplete="off"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>
