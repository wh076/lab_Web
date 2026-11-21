<script setup lang="ts">
import type { Task } from '../types'
const props = defineProps<{ task: Task }>()

const emit = defineEmits<{
  toggle: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

const checkboxId = 'task-checkbox-' + props.task.id
const titleId = 'task-title-' + props.task.id
const editId = 'task-edit-' + props.task.id
const deleteId = 'task-delete-' + props.task.id
</script>

<template>
  <li class="task" :class="{ 'task--done': task.done }">
    <input
      :id="checkboxId"
      type="checkbox"
      class="task__checkbox"
      :checked="task.done"
      @change="emit('toggle', task.id)"
    />
    <label :id="titleId" class="task__title" :for="checkboxId">{{
      task.title
    }}</label>

    <div class="task__actions">
      <button
        :id="editId"
        type="button"
        class="button button--icon"
        :aria-labelledby="editId + ' ' + titleId"
        @click="emit('edit', task.id)"
      >
        <svg
          class="button__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4z" />
          <path d="M13.5 6.5l4 4" />
        </svg>
        <span class="visually-hidden">Редактировать задачу</span>
      </button>

      <button
        :id="deleteId"
        type="button"
        class="button button--icon button--danger"
        :aria-labelledby="deleteId + ' ' + titleId"
        @click="emit('delete', task.id)"
      >
        <svg
          class="button__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4h6v3" />
        </svg>
        <span class="visually-hidden">Удалить задачу</span>
      </button>
    </div>
  </li>
</template>
