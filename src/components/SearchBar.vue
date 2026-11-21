<script setup lang="ts">
defineProps<{ modelValue: string }>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    emit('update:modelValue', event.target.value)
  }
}
</script>

<template>
  <div class="search">
    <label for="search-input" class="visually-hidden">Поиск задач</label>
    <input
      id="search-input"
      type="search"
      class="search__input"
      placeholder="Поиск по названию"
      autocomplete="off"
      :value="modelValue"
      @input="onInput"
    />
  </div>
</template>
