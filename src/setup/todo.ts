import { createTodoService } from '../application/todoService'
import { createLocalStorageTodoRepository } from '../infrastructure/localStorageTodoRepository'

const repository = createLocalStorageTodoRepository({
  getItem(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      throw new Error('Не удалось прочитать задачи из хранилища браузера')
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      throw new Error('Не удалось сохранить задачи в хранилище браузера')
    }
  }
})

export const todoService = createTodoService(repository, () =>
  crypto.randomUUID()
)
