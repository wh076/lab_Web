<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ save: [title: string]; close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const heading = ref('Новая задача')
const title = ref('')

function open(newHeading: string, newTitle: string) {
  heading.value = newHeading
  title.value = newTitle
  dialog.value?.showModal()
}

function onSubmit(event: SubmitEvent) {
  const text = title.value.trim()
  if (text === '') {
    event.preventDefault()
    title.value = ''
    input.value?.focus()
    return
  }
  emit('save', text)
}

function cancel() {
  dialog.value?.close()
}

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    aria-labelledby="modal-title"
    @close="emit('close')"
  >
    <form method="dialog" @submit="onSubmit">
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

      <div class="modal__actions">
        <button type="submit" class="button button--primary">Сохранить</button>
        <button type="button" class="button" @click="cancel">Отмена</button>
      </div>
    </form>
  </dialog>
</template>
