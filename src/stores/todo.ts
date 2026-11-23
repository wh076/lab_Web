import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Task, TaskDraft } from '../domain/todo'
import { todoService } from '../setup/todo'
import { useUserStore } from './user'

export const useTodoStore = defineStore('todo', () => {
  const userStore = useUserStore()
  const currentTasks = ref<Task[]>([])
  const totalTasks = ref(0)
  const loadError = ref('')

  function refresh() {
    currentTasks.value = []
    totalTasks.value = 0
    loadError.value = ''
    try {
      const userId = userStore.currentUser?.id
      if (userId !== undefined) currentTasks.value = todoService.load(userId)
      totalTasks.value = todoService.count()
    } catch {
      loadError.value =
        'Не удалось загрузить задачи. Проверьте доступ к хранилищу браузера.'
    }
  }

  watch(() => userStore.currentUser?.id, refresh, {
    immediate: true,
    flush: 'sync'
  })

  function update(action: (userId: string) => Task[]) {
    const userId = userStore.currentUser?.id
    if (userId === undefined) throw new Error('Войдите, чтобы изменить задачи')
    const tasks = action(userId)
    totalTasks.value += tasks.length - currentTasks.value.length
    currentTasks.value = tasks
    loadError.value = ''
  }

  return {
    currentTasks,
    totalTasks,
    loadError,
    refresh,
    add: (draft: TaskDraft) =>
      update((userId) => todoService.add(userId, draft)),
    edit: (id: string, draft: TaskDraft) =>
      update((userId) => todoService.edit(userId, id, draft)),
    toggle: (id: string) => update((userId) => todoService.toggle(userId, id)),
    remove: (id: string) => update((userId) => todoService.remove(userId, id))
  }
})
