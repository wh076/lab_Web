import type { Task, TaskDraft } from './todo'

function isPriority(value: unknown): value is Task['priority'] {
  return value === 0 || value === 1 || value === 2 || value === 3
}

export function toLocalDateTime(value?: string): string {
  if (value === undefined) return ''
  const date = new Date(value)
  const pad = (number: number) => String(number).padStart(2, '0')
  const day = [
    String(date.getFullYear()).padStart(4, '0'),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ]
  const time = [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ]
  return day.join('-') + 'T' + time.join(':')
}

function parseLocalDateTime(
  value: string | undefined,
  field: string
): string | undefined {
  if (value === undefined || value === '') return undefined
  const date = new Date(value)
  const fullValue = value.length === 16 ? value + ':00' : value
  if (
    !Number.isFinite(date.getTime()) ||
    toLocalDateTime(date.toISOString()) !== fullValue
  ) {
    throw new Error('Укажите корректные дату и время: ' + field)
  }
  return date.toISOString()
}

export function validateDraft(draft: TaskDraft) {
  const title = draft.title.trim()
  if (!title) throw new Error('Введите название задачи')
  const priority = draft.priority === undefined ? 0 : draft.priority
  if (!isPriority(priority))
    throw new Error('Приоритет должен быть целым числом от 0 до 3')

  const startDate = parseLocalDateTime(draft.startDate, 'начало')
  const dueDate = parseLocalDateTime(draft.dueDate, 'дедлайн')
  if (startDate !== undefined && dueDate !== undefined && dueDate < startDate) {
    throw new Error('Дедлайн не может быть раньше начала')
  }
  const tags = [
    ...new Set((draft.tags ?? []).map((tag) => tag.trim()).filter(Boolean))
  ]
  return { title, startDate, dueDate, priority, tags }
}

function isSavedDate(value: unknown): value is string | undefined {
  if (value === undefined) return true
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return (
    value.length === 24 &&
    Number.isFinite(date.getTime()) &&
    date.toISOString() === value
  )
}

export function isLegacyTask(
  value: unknown
): value is Pick<Task, 'id' | 'userId' | 'title' | 'done'> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    'userId' in value &&
    typeof value.userId === 'string' &&
    value.userId !== '' &&
    'title' in value &&
    typeof value.title === 'string' &&
    value.title.trim() !== '' &&
    'done' in value &&
    typeof value.done === 'boolean'
  )
}

export function isTask(value: unknown): value is Task {
  if (
    !isLegacyTask(value) ||
    !('priority' in value) ||
    !isPriority(value.priority) ||
    !('tags' in value) ||
    !Array.isArray(value.tags) ||
    !value.tags.every(
      (tag: unknown) => typeof tag === 'string' && tag.trim() !== ''
    )
  )
    return false
  const startDate = 'startDate' in value ? value.startDate : undefined
  const dueDate = 'dueDate' in value ? value.dueDate : undefined
  return (
    isSavedDate(startDate) &&
    isSavedDate(dueDate) &&
    (startDate === undefined || dueDate === undefined || startDate <= dueDate)
  )
}

function compareDates(first?: string, second?: string) {
  if (first === second) return 0
  if (first === undefined) return 1
  if (second === undefined) return -1
  return first < second ? -1 : 1
}

export function sortTasks(tasks: readonly Task[]) {
  return [...tasks].sort(
    (first, second) =>
      Number(first.done) - Number(second.done) ||
      second.priority - first.priority ||
      compareDates(first.dueDate, second.dueDate) ||
      compareDates(first.startDate, second.startDate)
  )
}

export function searchTasks(
  tasks: readonly Task[],
  title: string,
  tag: string
) {
  const query = title.trim().toLowerCase()
  return tasks.filter(
    (task) =>
      !task.done &&
      task.title.toLowerCase().includes(query) &&
      (tag === '' || task.tags.includes(tag))
  )
}

export function taskTags(tasks: readonly Task[]) {
  return [...new Set(tasks.flatMap((task) => task.tags))].sort(
    (first, second) => first.localeCompare(second, 'ru')
  )
}

export function calendarTasks(
  tasks: readonly Task[],
  period: 'today' | 'week',
  now: Date,
  showDone: boolean
) {
  const start = new Date(now)
  if (period === 'week')
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + (period === 'week' ? 7 : 1))
  end.setHours(0, 0, 0, 0)
  return tasks.filter((task) => {
    if (task.dueDate === undefined || (!showDone && task.done)) return false
    const dueDate = new Date(task.dueDate)
    return dueDate >= start && dueDate < end
  })
}
