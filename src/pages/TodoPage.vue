<script setup>
import { ref, computed, nextTick } from 'vue';
import { useTodoStore } from '../stores/todo';
import SearchBar from '../components/SearchBar.vue';
import TodoList from '../components/TodoList.vue';
import AddTodoModal from '../components/AddTodoModal.vue';

const todoStore = useTodoStore();
const searchText = ref('');
const editingId = ref(null);
const modal = ref(null);

const visibleTasks = computed(function () {
  return todoStore.search(searchText.value);
});

function focusById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.focus();
  } else {
    document.getElementById('add-button').focus();
  }
}

function openAddModal() {
  editingId.value = null;
  modal.value.open('Новая задача', '');
}

function openEditModal(id) {
  editingId.value = id;
  modal.value.open('Редактировать задачу', todoStore.findTask(id).title);
}

function saveTask(title) {
  if (editingId.value === null) {
    todoStore.add(title);
  } else {
    todoStore.edit(editingId.value, title);
  }
}

async function onModalClose() {
  await nextTick();
  if (editingId.value === null) {
    focusById('add-button');
  } else {
    focusById('task-edit-' + editingId.value);
  }
}

async function toggleTask(id) {
  todoStore.toggle(id);
  await nextTick();
  focusById('task-checkbox-' + id);
}

async function deleteTask(id) {
  const list = visibleTasks.value;
  let neighbourId = null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      if (i + 1 < list.length) {
        neighbourId = list[i + 1].id;
      } else if (i > 0) {
        neighbourId = list[i - 1].id;
      }
    }
  }

  todoStore.remove(id);

  await nextTick();
  if (neighbourId === null) {
    focusById('add-button');
  } else {
    focusById('task-delete-' + neighbourId);
  }
}
</script>

<template>
  <h1 class="page-title">Список задач</h1>

  <div class="toolbar">
    <SearchBar v-model="searchText" />

    <button type="button" id="add-button" class="button button--primary" @click="openAddModal">
      <svg class="button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
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
