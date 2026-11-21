export interface Task {
  id: string
  userId: string
  title: string
  done: boolean
}

export interface User {
  id: string
  email: string
  password: string
}
