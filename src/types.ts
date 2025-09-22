export type Employee = {
  id: string
  name: string
  description?: string
}

export type Role = {
  id: string
  name: string
  employees: Employee[]
}

export type DepartmentData = {
  departmentId: string
  name: string
  color: string
  roles: Role[]
  size: number
}

export type Shortcut = {
  id: string
  action: string
  keys: string
}
