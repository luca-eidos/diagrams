import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Role, Shortcut } from '../types'
import ShortcutTable from './ShortcutTable'
import './Sidebar.css'

type DepartmentOption = {
  id: string
  name: string
  color: string
  roles: Role[]
  size: number
}

type SidebarProps = {
  onAddDepartment: (payload: { name: string; color: string }) => void
  onAddRole: (departmentId: string, roleName: string) => void
  onAddEmployee: (departmentId: string, roleId: string, employeeName: string) => void
  departments: DepartmentOption[]
  selectedDepartmentId: string | null
  selectedRoleId: string | null
  onUpdateDepartment: (departmentId: string, updates: { name?: string; color?: string; size?: number }) => void
  onResizeDepartment: (departmentId: string, delta: number) => void
  onSelectRole: (roleId: string | null) => void
  onUpdateRole: (departmentId: string, roleId: string, roleName: string) => void
  shortcuts: Shortcut[]
  showShortcuts: boolean
  onToggleShortcuts: () => void
  onShortcutChange: (id: string, updates: Partial<Shortcut>) => void
  backgroundColor: string
  onBackgroundColorChange: (color: string) => void
}

const COLORS = ['#0ea5e9', '#7c3aed', '#f97316', '#10b981', '#ef4444', '#6366f1']
const NODE_MIN_SCALE = 0.6
const NODE_MAX_SCALE = 1.6

const Sidebar = ({
  onAddDepartment,
  onAddRole,
  onAddEmployee,
  departments,
  selectedDepartmentId,
  selectedRoleId,
  onUpdateDepartment,
  onResizeDepartment,
  onSelectRole,
  onUpdateRole,
  shortcuts,
  showShortcuts,
  onToggleShortcuts,
  onShortcutChange,
  backgroundColor,
  onBackgroundColorChange,
}: SidebarProps) => {
  const [departmentName, setDepartmentName] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [roleName, setRoleName] = useState('')
  const [roleDepartmentId, setRoleDepartmentId] = useState<string>('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeDepartmentId, setEmployeeDepartmentId] = useState<string>('')
  const [employeeRoleId, setEmployeeRoleId] = useState<string>('')
  const [editDepartmentName, setEditDepartmentName] = useState('')
  const [editDepartmentColor, setEditDepartmentColor] = useState(COLORS[0])
  const [editRoleName, setEditRoleName] = useState('')

  const availableRoles = useMemo(() => {
    return departments.find((dept) => dept.id === employeeDepartmentId)?.roles ?? []
  }, [departments, employeeDepartmentId])

  const selectedDepartment = useMemo(
    () => departments.find((dept) => dept.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId],
  )

  const selectedRole = useMemo(() => {
    if (!selectedDepartment) {
      return null
    }
    return selectedDepartment.roles.find((role) => role.id === selectedRoleId) ?? null
  }, [selectedDepartment, selectedRoleId])

  useEffect(() => {
    if (selectedDepartment) {
      setEditDepartmentName(selectedDepartment.name)
      setEditDepartmentColor(selectedDepartment.color)
    } else {
      setEditDepartmentName('')
      setEditDepartmentColor(COLORS[0])
    }
  }, [selectedDepartment])

  useEffect(() => {
    if (selectedRole) {
      setEditRoleName(selectedRole.name)
    } else {
      setEditRoleName('')
    }
  }, [selectedRole])

  const handleAddDepartment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!departmentName.trim()) {
      return
    }
    onAddDepartment({ name: departmentName.trim(), color: selectedColor })
    setDepartmentName('')
  }

  const handleAddRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roleName.trim() || !roleDepartmentId) {
      return
    }
    onAddRole(roleDepartmentId, roleName.trim())
    setRoleName('')
  }

  const handleAddEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!employeeName.trim() || !employeeDepartmentId || !employeeRoleId) {
      return
    }
    onAddEmployee(employeeDepartmentId, employeeRoleId, employeeName.trim())
    setEmployeeName('')
  }

  const handleEditDepartment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDepartment || !editDepartmentName.trim()) {
      return
    }
    onUpdateDepartment(selectedDepartment.id, {
      name: editDepartmentName.trim(),
      color: editDepartmentColor,
    })
  }

  const handleEditRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDepartment || !selectedRole || !editRoleName.trim()) {
      return
    }
    onUpdateRole(selectedDepartment.id, selectedRole.id, editRoleName.trim())
  }

  return (
    <aside className="sidebar">
      <h2>Gestione Reparti</h2>

      <section>
        <h3>Crea nuovo reparto</h3>
        <form onSubmit={handleAddDepartment} className="sidebar-form">
          <label>
            Nome
            <input
              type="text"
              value={departmentName}
              onChange={(event) => setDepartmentName(event.target.value)}
              placeholder="Es. Produzione"
            />
          </label>
          <div className="color-picker">
            <span>Colore</span>
            <div className="color-options">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={color === selectedColor ? 'active' : ''}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Seleziona colore ${color}`}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="primary">
            Aggiungi reparto
          </button>
        </form>
      </section>

      <section>
        <h3>Aggiungi mansione</h3>
        <form onSubmit={handleAddRole} className="sidebar-form">
          <label>
            Reparto
            <select
              value={roleDepartmentId}
              onChange={(event) => setRoleDepartmentId(event.target.value)}
            >
              <option value="">Seleziona reparto</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mansione
            <input
              type="text"
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              placeholder="Es. Responsabile di linea"
            />
          </label>
          <button type="submit" disabled={!departments.length}>
            Aggiungi mansione
          </button>
        </form>
      </section>

      <section>
        <h3>Assegna dipendente</h3>
        <form onSubmit={handleAddEmployee} className="sidebar-form">
          <label>
            Reparto
            <select
              value={employeeDepartmentId}
              onChange={(event) => {
                setEmployeeDepartmentId(event.target.value)
                setEmployeeRoleId('')
              }}
            >
              <option value="">Seleziona reparto</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mansione
            <select
              value={employeeRoleId}
              onChange={(event) => setEmployeeRoleId(event.target.value)}
              disabled={!employeeDepartmentId}
            >
              <option value="">Seleziona mansione</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Dipendente
            <input
              type="text"
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              placeholder="Es. Mario Rossi"
            />
          </label>
          <button type="submit" disabled={!departments.length}>
            Aggiungi dipendente
          </button>
        </form>
      </section>

      {selectedDepartment && (
        <section>
          <h3>Modifica reparto selezionato</h3>
          <form onSubmit={handleEditDepartment} className="sidebar-form">
          <label>
            Nome
            <input
              type="text"
              value={editDepartmentName}
              onChange={(event) => setEditDepartmentName(event.target.value)}
            />
          </label>
          <div className="color-picker">
            <span>Colore</span>
            <div className="color-options">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={color === editDepartmentColor ? 'active' : ''}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditDepartmentColor(color)}
                  aria-label={`Seleziona colore ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="size-controls">
            <span>Dimensione nodo</span>
            <div className="size-controls-buttons">
              <button
                type="button"
                onClick={() => onResizeDepartment(selectedDepartment.id, -0.1)}
                disabled={selectedDepartment.size <= NODE_MIN_SCALE + 0.01}
                aria-label="Riduci nodo"
              >
                -
              </button>
              <span className="size-display">
                {Math.round(selectedDepartment.size * 100)}%
              </span>
              <button
                type="button"
                onClick={() => onResizeDepartment(selectedDepartment.id, 0.1)}
                disabled={selectedDepartment.size >= NODE_MAX_SCALE - 0.01}
                aria-label="Ingrandisci nodo"
              >
                +
              </button>
            </div>
          </div>
          <button type="submit" className="primary">
            Aggiorna reparto
          </button>
        </form>

          <div className="role-editor">
            <p className="role-editor-title">Mansioni del reparto</p>
            <div className="role-select-list">
              {selectedDepartment.roles.length === 0 ? (
                <p className="empty-state">Nessuna mansione disponibile</p>
              ) : (
                selectedDepartment.roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-select-button${
                      role.id === selectedRoleId ? ' active' : ''
                    }`}
                    onClick={() =>
                      onSelectRole(role.id === selectedRoleId ? null : role.id)
                    }
                  >
                    {role.name}
                  </button>
                ))
              )}
            </div>

            {selectedRole && (
              <form onSubmit={handleEditRole} className="sidebar-form role-edit-form">
                <label>
                  Nome mansione
                  <input
                    type="text"
                    value={editRoleName}
                    onChange={(event) => setEditRoleName(event.target.value)}
                  />
                </label>
                <button type="submit" className="primary">
                  Aggiorna mansione
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      <section>
        <h3>Personalizza sfondo</h3>
        <div className="sidebar-form background-form">
          <label className="background-color-field">
            Colore base
            <input
              type="color"
              value={backgroundColor}
              onChange={(event) => onBackgroundColorChange(event.target.value)}
              aria-label="Seleziona colore di sfondo"
            />
          </label>
        </div>
      </section>

      <ShortcutTable
        shortcuts={shortcuts}
        show={showShortcuts}
        onToggle={onToggleShortcuts}
        onUpdate={onShortcutChange}
      />
    </aside>
  )
}

export default Sidebar
