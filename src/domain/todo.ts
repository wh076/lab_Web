export interface Task {
  id: string
  userId: string
  title: string
  done: boolean
  startDate?: string
  dueDate?: string
  priority: 0 | 1 | 2 | 3
  tags: string[]
}

export interface TaskDraft {
  title: string
  startDate?: string
  dueDate?: string
  priority?: number
  tags?: string[]
}
