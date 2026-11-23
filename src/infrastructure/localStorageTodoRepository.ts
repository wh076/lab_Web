import type { TodoRepository } from '../application/TodoRepository'
import type { Task } from '../domain/todo'
import { isLegacyTask, isTask } from '../domain/todoRules'

const tasksKey = 'lab10-tasks'
const legacyKey = 'lab7-tasks'

function readEntries(raw: string | null): unknown[] {
  if (raw === null) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (
      value !== null &&
      typeof value === 'object' &&
      'tasks' in value &&
      Array.isArray(value.tasks)
    ) {
      return value.tasks
    }
  } catch {
    return []
  }
  return []
}

export function createLocalStorageTodoRepository(
  storage: Pick<Storage, 'getItem' | 'setItem'>
): TodoRepository {
  function write(tasks: readonly Task[]) {
    storage.setItem(tasksKey, JSON.stringify({ tasks }))
  }

  function read() {
    const saved = storage.getItem(tasksKey)
    const tasks: Task[] =
      saved === null
        ? readEntries(storage.getItem(legacyKey))
            .filter(isLegacyTask)
            .map(({ id, userId, title, done }) => ({
              id,
              userId,
              title,
              done,
              priority: 0,
              tags: []
            }))
        : readEntries(saved).filter(isTask)

    const idsByUser = new Map<string, Set<string>>()
    const uniqueTasks = tasks.filter((task) => {
      const ids = idsByUser.get(task.userId) ?? new Set<string>()
      if (ids.has(task.id)) return false
      ids.add(task.id)
      idsByUser.set(task.userId, ids)
      return true
    })
    if (saved === null) write(uniqueTasks)
    return uniqueTasks
  }

  return {
    load: (userId) => read().filter((task) => task.userId === userId),
    save(userId, tasks) {
      const otherTasks = read().filter((task) => task.userId !== userId)
      write([...otherTasks, ...tasks.filter((task) => task.userId === userId)])
    },
    count: () => read().length
  }
}
