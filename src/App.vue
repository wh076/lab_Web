<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import ThemeToggle from './components/ThemeToggle.vue';
import SearchBar from './components/SearchBar.vue';
import TodoList from './components/TodoList.vue';
import AddTodoModal from './components/AddTodoModal.vue';

function loadTheme() {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      return 'dark';
    }
  } catch (error) {
    return 'light';
  }
  return 'light';
}

function isTask(item, ids) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.title === 'string' &&
    typeof item.done === 'boolean' &&
    !ids.includes(item.id)
  );
}

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem('tasks'));
    if (!Array.isArray(data)) {
      return [];
    }
    const result = [];
    const ids = [];
    for (let i = 0; i < data.length; i++) {
      if (isTask(data[i], ids)) {
        result.push({ id: data[i].id, title: data[i].title, done: data[i].done });
        ids.push(data[i].id);
      }
    }
    return result;
  } catch (error) {
    return [];
  }
}

const theme = ref(loadTheme());
const tasks = ref(loadTasks());
const searchText = ref('');
const editingId = ref(null);
const modal = ref(null);

let nextId = 1;
for (let i = 0; i < tasks.value.length; i++) {
  if (tasks.value[i].id >= nextId) {
    nextId = tasks.value[i].id + 1;
  }
}

const visibleTasks = computed(function () {
  const text = searchText.value.trim().toLowerCase();
  const found = tasks.value.filter(function (task) {
    return task.title.toLowerCase().includes(text);
  });
  const notDone = found.filter(function (task) {
    return !task.done;
  });
  const done = found.filter(function (task) {
    return task.done;
  });
  return notDone.concat(done);
});

watch(
  theme,
  function (value) {
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem('theme', value);
  },
  { immediate: true }
);

watch(
  tasks,
  function (value) {
    localStorage.setItem('tasks', JSON.stringify(value));
  },
  { deep: true }
);

function findTask(id) {
  return tasks.value.find(function (task) {
    return task.id === id;
  });
}

function focusById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.focus();
  } else {
    document.getElementById('add-button').focus();
  }
}

function toggleTheme() {
  if (theme.value === 'dark') {
    theme.value = 'light';
  } else {
    theme.value = 'dark';
  }
}

function openAddModal() {
  editingId.value = null;
  modal.value.open('Новая задача', '');
}

function openEditModal(id) {
  editingId.value = id;
  modal.value.open('Редактировать задачу', findTask(id).title);
}

function saveTask(title) {
  if (editingId.value === null) {
    tasks.value.push({ id: nextId, title: title, done: false });
    nextId++;
  } else {
    findTask(editingId.value).title = title;
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
  const task = findTask(id);
  task.done = !task.done;
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

  tasks.value = tasks.value.filter(function (task) {
    return task.id !== id;
  });

  await nextTick();
  if (neighbourId === null) {
    focusById('add-button');
  } else {
    focusById('task-delete-' + neighbourId);
  }
}
</script>

<template>
  <header class="header">
    <div class="header__inner container">
      <h1 class="header__title">Список задач</h1>
      <ThemeToggle :theme="theme" @toggle="toggleTheme" />
    </div>
  </header>

  <main class="main container">
    <div class="toolbar">
      <SearchBar v-model="searchText" />

      <button type="button" id="add-button" class="button button--primary" @click="openAddModal">
        <svg class="button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Добавить задачу</span>
      </button>
    </div>

    <p v-if="tasks.length === 0">Задач пока нет</p>
    <p v-else-if="visibleTasks.length === 0">Ничего не найдено</p>
    <TodoList
      v-else
      :tasks="visibleTasks"
      @toggle="toggleTask"
      @edit="openEditModal"
      @delete="deleteTask"
    />
  </main>

  <AddTodoModal ref="modal" @save="saveTask" @close="onModalClose" />
</template>
