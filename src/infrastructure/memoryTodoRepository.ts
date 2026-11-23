import type { TodoRepository } from '../application/TodoRepository'
import type { Task } from '../domain/todo'

function copyTask(task: Task): Task {
  return { ...task, tags: [...task.tags] }
}

export function createMemoryTodoRepository(): TodoRepository {
  const tasksByUser = new Map<string, Task[]>()
  return {
    load: (userId) => (tasksByUser.get(userId) ?? []).map(copyTask),
    save(userId, tasks) {
      tasksByUser.set(
        userId,
        tasks.filter((task) => task.userId === userId).map(copyTask)
      )
    },
    count() {
      let total = 0
      for (const tasks of tasksByUser.values()) total += tasks.length
      return total
    }
  }
}
