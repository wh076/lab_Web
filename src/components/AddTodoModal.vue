<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { Task, TaskDraft } from '../domain/todo'
import { toLocalDateTime } from '../domain/todoRules'

defineProps<{ error: string }>()
const emit = defineEmits<{ save: [draft: TaskDraft]; close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const heading = ref('Новая задача')
const title = ref('')
const startDate = ref('')
const dueDate = ref('')
const priority = ref(0)
const tags = ref('')

async function open(task?: Task) {
  heading.value = task ? 'Редактировать задачу' : 'Новая задача'
  title.value = task?.title ?? ''
  startDate.value = toLocalDateTime(task?.startDate)
  dueDate.value = toLocalDateTime(task?.dueDate)
  priority.value = task?.priority ?? 0
  tags.value = task?.tags.join(', ') ?? ''
  dialog.value?.showModal()
  await nextTick()
  input.value?.focus()
}

function onSubmit() {
  emit('save', {
    title: title.value,
    startDate: startDate.value,
    dueDate: dueDate.value,
    priority: priority.value,
    tags: tags.value.split(',')
  })
}

function close() {
  dialog.value?.close()
}

defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    aria-labelledby="modal-title"
    @close="emit('close')"
  >
    <form @submit.prevent="onSubmit">
      <h2 id="modal-title" class="modal__title">{{ heading }}</h2>

      <label for="modal-input" class="modal__label">Название задачи</label>
      <input
        id="modal-input"
        ref="input"
        v-model="title"
        type="text"
        class="modal__input"
        required
        autofocus
        autocomplete="off"
      />

      <div class="modal__fields">
        <div>
          <label for="todo-start" class="modal__label"
            >Дата и время начала</label
          >
          <input
            id="todo-start"
            v-model="startDate"
            class="modal__input"
            type="datetime-local"
            step="1"
          />
        </div>
        <div>
          <label for="todo-due" class="modal__label">Дедлайн</label>
          <input
            id="todo-due"
            v-model="dueDate"
            class="modal__input"
            type="datetime-local"
            step="1"
          />
        </div>
        <div>
          <label for="todo-priority" class="modal__label">Приоритет</label>
          <select id="todo-priority" v-model="priority" class="modal__input">
            <option :value="0">Низкий</option>
            <option :value="1">Обычный</option>
            <option :value="2">Высокий</option>
            <option :value="3">Очень высокий</option>
          </select>
        </div>
        <div>
          <label for="todo-tags" class="modal__label"
            >Метки через запятую</label
          >
          <input
            id="todo-tags"
            v-model="tags"
            class="modal__input"
            type="text"
          />
        </div>
      </div>

      <p v-if="error" class="form__error modal__error" role="alert">
        {{ error }}
      </p>
      <div class="modal__actions">
        <button type="submit" class="button button--primary">Сохранить</button>
        <button type="button" class="button" @click="close">Отмена</button>
      </div>
    </form>
  </dialog>
</template>
