<script setup>
import TodoItem from './TodoItem.vue';

defineProps({
  tasks: Array,
});

const emit = defineEmits(['toggle', 'edit', 'delete']);
</script>

<template>
  <ul class="task-list">
    <TodoItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="emit('toggle', $event)"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </ul>
</template>
