<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useTodoStore } from '../stores/todo'
import SearchBar from '../components/SearchBar.vue'
import TodoList from '../components/TodoList.vue'
import AddTodoModal from '../components/AddTodoModal.vue'

const todoStore = useTodoStore()
const searchText = ref('')
const editingId = ref<string | null>(null)
const modal = ref<InstanceType<typeof AddTodoModal> | null>(null)

const visibleTasks = computed(function () {
  return todoStore.search(searchText.value)
})

function focusById(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.focus()
  } else {
    document.getElementById('add-button')?.focus()
  }
}

function openAddModal() {
  editingId.value = null
  modal.value?.open('Новая задача', '')
}

function openEditModal(id: string) {
  const task = todoStore.findTask(id)
  if (task && modal.value) {
    editingId.value = id
    modal.value.open('Редактировать задачу', task.title)
  }
}

function saveTask(title: string) {
  if (editingId.value === null) {
    todoStore.add(title)
  } else {
    todoStore.edit(editingId.value, title)
  }
}

async function onModalClose() {
  await nextTick()
  if (editingId.value === null) {
    focusById('add-button')
  } else {
    focusById('task-edit-' + editingId.value)
  }
}

async function toggleTask(id: string) {
  todoStore.toggle(id)
  await nextTick()
  focusById('task-checkbox-' + id)
}

async function deleteTask(id: string) {
  const list = visibleTasks.value
  const index = list.findIndex((task) => task.id === id)
  const neighbour = index < 0 ? undefined : (list[index + 1] ?? list[index - 1])

  todoStore.remove(id)

  await nextTick()
  if (!neighbour) {
    focusById('add-button')
  } else {
    focusById('task-delete-' + neighbour.id)
  }
}
</script>

<template>
  <h1 class="page-title">Список задач</h1>

  <div class="toolbar">
    <SearchBar v-model="searchText" />

    <button
      id="add-button"
      type="button"
      class="button button--primary"
      @click="openAddModal"
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
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span>Добавить задачу</span>
    </button>
  </div>

  <p v-if="todoStore.currentTasks.length === 0">Задач пока нет</p>
  <p v-else-if="visibleTasks.length === 0">Ничего не найдено</p>
  <TodoList
    v-else
    :tasks="visibleTasks"
    @toggle="toggleTask"
    @edit="openEditModal"
    @delete="deleteTask"
  />

  <AddTodoModal ref="modal" @save="saveTask" @close="onModalClose" />
</template>
