<script setup lang="ts">
import type { Task } from '../types'
import TodoItem from './TodoItem.vue'

defineProps<{ tasks: Task[] }>()

const emit = defineEmits<{
  toggle: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()
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
