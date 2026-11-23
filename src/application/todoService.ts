import type { Task, TaskDraft } from '../domain/todo'
import { validateDraft } from '../domain/todoRules'
import type { TodoRepository } from './TodoRepository'

export function createTodoService(
  repository: TodoRepository,
  createId: () => string
) {
  function change(
    userId: string,
    id: string,
    update: (task: Task) => Task | undefined
  ) {
    const tasks = repository.load(userId)
    const index = tasks.findIndex((task) => task.id === id)
    const task = tasks[index]
    if (task === undefined) throw new Error('Задача не найдена')
    const updated = update(task)
    if (updated === undefined) {
      tasks.splice(index, 1)
    } else {
      tasks[index] = updated
    }
    repository.save(userId, tasks)
    return tasks
  }

  return {
    load(userId: string) {
      return repository.load(userId)
    },
    count() {
      return repository.count()
    },
    add(userId: string, draft: TaskDraft) {
      const fields = validateDraft(draft)
      const tasks = repository.load(userId)
      tasks.push({ id: createId(), userId, done: false, ...fields })
      repository.save(userId, tasks)
      return tasks
    },
    edit(userId: string, id: string, draft: TaskDraft) {
      const fields = validateDraft(draft)
      return change(userId, id, (task) => ({ ...task, ...fields }))
    },
    toggle(userId: string, id: string) {
      return change(userId, id, (task) => ({ ...task, done: !task.done }))
    },
    remove(userId: string, id: string) {
      return change(userId, id, () => undefined)
    }
  }
}
