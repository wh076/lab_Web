import type { Task } from '../domain/todo'

export interface TodoRepository {
  load(userId: string): Task[]
  save(userId: string, tasks: readonly Task[]): void
  count(): number
}
