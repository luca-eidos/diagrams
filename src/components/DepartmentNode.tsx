import { memo, useState, type CSSProperties } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from 'reactflow'
import type { DepartmentData } from '../types'
import './DepartmentNode.css'

const DepartmentNode = ({ id, data }: NodeProps<DepartmentData>) => {
  const { setNodes } = useReactFlow<DepartmentData>()
  const [openEditors, setOpenEditors] = useState<Record<string, boolean>>({})
  const scale = data.size ?? 1

  const nodeStyle = {
    borderColor: data.color,
    '--node-scale': scale.toString(),
  } as CSSProperties

  const toggleEditor = (roleId: string, employeeId: string) => {
    const key = `${roleId}:${employeeId}`
    setOpenEditors((current) => ({ ...current, [key]: !current[key] }))
  }

  const handleDescriptionChange = (
    roleId: string,
    employeeId: string,
    description: string,
  ) => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== id) {
          return node
        }
        return {
          ...node,
          data: {
            ...node.data,
            roles: node.data.roles.map((role) => {
              if (role.id !== roleId) {
                return role
              }
              return {
                ...role,
                employees: role.employees.map((employee) =>
                  employee.id === employeeId
                    ? {
                        ...employee,
                        description,
                      }
                    : employee,
                ),
              }
            }),
          },
        }
      }),
    )
  }

  return (
    <div className="department-node" style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <div className="department-header" style={{ backgroundColor: data.color }}>
        <h3>{data.name}</h3>
      </div>
      <div className="department-body">
        {data.roles.length === 0 ? (
          <p className="empty-state">Nessuna mansione aggiunta</p>
        ) : (
          <ul>
            {data.roles.map((role) => (
              <li key={role.id}>
                <span className="role-name">{role.name}</span>
                {role.employees.length > 0 ? (
                  <ul className="employee-list">
                    {role.employees.map((employee) => (
                      <li key={employee.id} className="employee-item">
                        <div className="employee-header">
                          <span>{employee.name}</span>
                          <button
                            type="button"
                            className="employee-edit-button"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleEditor(role.id, employee.id)
                            }}
                            aria-label={`Modifica descrizione per ${employee.name}`}
                          >
                            mod
                          </button>
                        </div>
                        {employee.description && !openEditors[`${role.id}:${employee.id}`] && (
                          <p className="employee-description">{employee.description}</p>
                        )}
                        {openEditors[`${role.id}:${employee.id}`] && (
                          <textarea
                            className="employee-textarea"
                            value={employee.description ?? ''}
                            onMouseDown={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              handleDescriptionChange(role.id, employee.id, event.target.value)
                            }
                            placeholder="Descrivi la mansione in dettaglio"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">Nessun dipendente assegnato</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default memo(DepartmentNode)
