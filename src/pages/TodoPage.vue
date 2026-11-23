<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useTodoStore } from '../stores/todo'
import type { TaskDraft } from '../domain/todo'
import {
  calendarTasks,
  searchTasks,
  sortTasks,
  taskTags
} from '../domain/todoRules'
import SearchBar from '../components/SearchBar.vue'
import TodoList from '../components/TodoList.vue'
import AddTodoModal from '../components/AddTodoModal.vue'

const tabs = [
  { id: 'search', label: 'Поиск' },
  { id: 'all', label: 'Все' },
  { id: 'today', label: 'На сегодня' },
  { id: 'week', label: 'Грядущие' },
  { id: 'done', label: 'Выполненные' }
] as const
type Tab = (typeof tabs)[number]['id']

const todoStore = useTodoStore()
const activeTab = ref<Tab>('all')
const searchText = ref('')
const selectedTag = ref('')
const showDoneToday = ref(false)
const showDoneWeek = ref(false)
const now = ref(new Date())
const editingId = ref<string | null>(null)
const modal = ref<InstanceType<typeof AddTodoModal> | null>(null)
const formError = ref('')
const actionError = ref('')
let clock: number | undefined

onMounted(() => {
  clock = window.setInterval(() => {
    now.value = new Date()
  }, 30_000)
})
onUnmounted(() => window.clearInterval(clock))

const tags = computed(() => taskTags(todoStore.currentTasks))
watch(tags, (options) => {
  if (!options.includes(selectedTag.value)) selectedTag.value = ''
})

const visibleTasks = computed(() => {
  const tasks = todoStore.currentTasks
  switch (activeTab.value) {
    case 'search':
      return sortTasks(searchTasks(tasks, searchText.value, selectedTag.value))
    case 'today':
      return sortTasks(
        calendarTasks(tasks, 'today', now.value, showDoneToday.value)
      )
    case 'week':
      return sortTasks(
        calendarTasks(tasks, 'week', now.value, showDoneWeek.value)
      )
    case 'done':
      return sortTasks(tasks.filter((task) => task.done))
    default:
      return sortTasks(tasks)
  }
})

function selectTab(tab: Tab) {
  now.value = new Date()
  activeTab.value = tab
  actionError.value = ''
}

function onTabKey(event: KeyboardEvent, index: number) {
  let next: number
  switch (event.key) {
    case 'ArrowRight':
      next = (index + 1) % tabs.length
      break
    case 'ArrowLeft':
      next = (index + tabs.length - 1) % tabs.length
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = tabs.length - 1
      break
    default:
      return
  }
  const tab = tabs[next]
  if (tab) {
    event.preventDefault()
    selectTab(tab.id)
    document.getElementById('todo-tab-' + tab.id)?.focus()
  }
}

function focusById(id: string) {
  ;(
    document.getElementById(id) ?? document.getElementById('add-button')
  )?.focus()
}

function openAddModal() {
  editingId.value = null
  formError.value = ''
  modal.value?.open()
}

function openEditModal(id: string) {
  const task = todoStore.currentTasks.find((task) => task.id === id)
  if (task && modal.value) {
    editingId.value = id
    formError.value = ''
    modal.value.open(task)
  }
}

function saveTask(draft: TaskDraft) {
  try {
    if (editingId.value === null) {
      todoStore.add(draft)
    } else {
      todoStore.edit(editingId.value, draft)
    }
    actionError.value = ''
    modal.value?.close()
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : 'Не удалось сохранить задачу'
  }
}

async function onModalClose() {
  await nextTick()
  focusById(
    editingId.value === null ? 'add-button' : 'task-edit-' + editingId.value
  )
}

async function changeTask(id: string, action: 'toggle' | 'remove') {
  const list = visibleTasks.value
  const index = list.findIndex((task) => task.id === id)
  const neighbour = index < 0 ? undefined : (list[index + 1] ?? list[index - 1])
  const prefix = action === 'toggle' ? 'task-checkbox-' : 'task-delete-'
  actionError.value = ''
  try {
    todoStore[action](id)
    await nextTick()
    if (visibleTasks.value.some((task) => task.id === id)) {
      focusById(prefix + id)
    } else {
      focusById(neighbour ? prefix + neighbour.id : 'add-button')
    }
  } catch (error) {
    actionError.value =
      error instanceof Error ? error.message : 'Не удалось изменить задачу'
  }
}
</script>

<template>
  <h1 class="page-title">Список задач</h1>

  <div class="todo-tabs" role="tablist" aria-label="Представления задач">
    <button
      v-for="(tab, index) in tabs"
      :id="'todo-tab-' + tab.id"
      :key="tab.id"
      type="button"
      class="button"
      role="tab"
      :aria-selected="activeTab === tab.id"
      :tabindex="activeTab === tab.id ? 0 : -1"
      :aria-controls="'todo-panel-' + tab.id"
      @click="selectTab(tab.id)"
      @keydown="onTabKey($event, index)"
    >
      {{ tab.label }}
    </button>
  </div>

  <section
    v-for="tab in tabs"
    v-show="activeTab === tab.id"
    :id="'todo-panel-' + tab.id"
    :key="tab.id"
    role="tabpanel"
    :aria-labelledby="'todo-tab-' + tab.id"
  >
    <template v-if="activeTab === tab.id">
      <div class="toolbar">
        <SearchBar v-if="activeTab === 'search'" v-model="searchText" />
        <div v-if="activeTab === 'search'">
          <label class="visually-hidden" for="todo-tag-filter"
            >Фильтр по метке</label
          >
          <select
            id="todo-tag-filter"
            v-model="selectedTag"
            class="todo-filter"
          >
            <option value="">Все метки</option>
            <option v-for="tag in tags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
        </div>
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

      <label v-if="activeTab === 'today'" class="todo-option">
        <input v-model="showDoneToday" type="checkbox" />
        Показать выполненные
      </label>
      <label v-if="activeTab === 'week'" class="todo-option">
        <input v-model="showDoneWeek" type="checkbox" />
        Показать выполненные
      </label>

      <p
        v-if="todoStore.loadError || actionError"
        class="form__error"
        role="alert"
      >
        {{ todoStore.loadError || actionError }}
      </p>
      <p v-if="!todoStore.loadError && !todoStore.currentTasks.length">
        Задач пока нет
      </p>
      <p v-else-if="!todoStore.loadError && !visibleTasks.length">
        Ничего не найдено
      </p>
      <TodoList
        v-if="visibleTasks.length"
        :tasks="visibleTasks"
        @toggle="changeTask($event, 'toggle')"
        @edit="openEditModal"
        @delete="changeTask($event, 'remove')"
      />
    </template>
  </section>

  <AddTodoModal
    ref="modal"
    :error="formError"
    @save="saveTask"
    @close="onModalClose"
  />
</template>
