import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import type { Connection, Edge, Node, OnSelectionChangeParams } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import DepartmentNode from './components/DepartmentNode'
import Sidebar from './components/Sidebar'
import type { DepartmentData, Shortcut } from './types'

import 'reactflow/dist/style.css'
import './App.css'

type DepartmentNodeType = Node<DepartmentData>

type DepartmentEdge = Edge

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const adjustHexColor = (hex: string, amount: number) => {
  const sanitized = hex.replace('#', '')
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((char) => char + char)
          .join('')
      : sanitized.padEnd(6, '0')

  const numeric = parseInt(normalized, 16)
  const clampChannel = (channel: number) => clamp(channel, 0, 255)

  const r = clampChannel((numeric >> 16) + amount)
  const g = clampChannel(((numeric >> 8) & 0xff) + amount)
  const b = clampChannel((numeric & 0xff) + amount)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const createBackgroundGradient = (baseColor: string) => {
  const brighter = adjustHexColor(baseColor, 25)
  const darker = adjustHexColor(baseColor, -35)
  return `radial-gradient(circle at top, #f8fafc 0, ${brighter} 45%, ${darker} 100%)`
}

const initialShortcuts: Shortcut[] = [
  {
    id: 'add-department',
    action: 'Aggiungi nuovo reparto',
    keys: 'Ctrl + Shift + N',
  },
  {
    id: 'add-role',
    action: 'Aggiungi mansione',
    keys: 'Ctrl + Shift + M',
  },
  {
    id: 'assign-employee',
    action: 'Assegna dipendente',
    keys: 'Ctrl + Shift + D',
  },
  {
    id: 'toggle-shortcuts',
    action: 'Mostra/Nascondi scorciatoie',
    keys: 'Ctrl + /',
  },
]

const initialNodes: DepartmentNodeType[] = [
  {
    id: 'direzione',
    type: 'department',
    position: { x: 100, y: 0 },
    data: {
      departmentId: 'direzione',
      name: 'Direzione Generale',
      color: '#6366f1',
      size: 1,
      roles: [
        {
          id: 'direzione-role-strategia',
          name: 'Strategia e Governance',
          employees: [
            {
              id: 'emp-anna',
              name: 'Anna Bianchi',
              description: 'Coordina i progetti strategici e monitora gli OKR aziendali.',
            },
            {
              id: 'emp-paolo',
              name: 'Paolo Verdi',
              description: 'Supporta la definizione dei piani operativi con i responsabili di reparto.',
            },
          ],
        },
        {
          id: 'direzione-role-finanza',
          name: 'Controllo di Gestione',
          employees: [
            {
              id: 'emp-luca',
              name: 'Luca Neri',
              description: 'Redige i report finanziari mensili e cura i forecast di budget.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'vendite',
    type: 'department',
    position: { x: -220, y: 250 },
    data: {
      departmentId: 'vendite',
      name: 'Vendite',
      color: '#0ea5e9',
      size: 1,
      roles: [
        {
          id: 'vendite-role-b2b',
          name: 'Account B2B',
          employees: [
            {
              id: 'emp-chiara',
              name: 'Chiara Moretti',
              description: 'Gestisce il portafoglio clienti corporate e le negoziazioni complesse.',
            },
            {
              id: 'emp-dario',
              name: 'Dario Gallo',
              description: 'Sviluppa nuove opportunità commerciali e mantiene relazioni post-vendita.',
            },
          ],
        },
        {
          id: 'vendite-role-support',
          name: 'Customer Support',
          employees: [
            {
              id: 'emp-sara',
              name: 'Sara Fontana',
              description: 'Coordina la gestione ticket e monitora la soddisfazione del cliente.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'produzione',
    type: 'department',
    position: { x: 420, y: 250 },
    data: {
      departmentId: 'produzione',
      name: 'Produzione',
      color: '#f97316',
      size: 1,
      roles: [
        {
          id: 'produzione-role-linea',
          name: 'Gestione Linea',
          employees: [
            {
              id: 'emp-matteo',
              name: 'Matteo Conti',
              description: 'Organizza i turni di produzione e ottimizza i carichi di lavoro.',
            },
            {
              id: 'emp-alessia',
              name: 'Alessia Pini',
              description: 'Supervisiona la logistica interna e coordina le squadre operative.',
            },
          ],
        },
        {
          id: 'produzione-role-qualita',
          name: 'Controllo Qualità',
          employees: [
            {
              id: 'emp-francesca',
              name: 'Francesca Costa',
              description: 'Guida i piani di test e le certificazioni per gli standard ISO.',
            },
          ],
        },
      ],
    },
  },
]

const edgeStyle = {
  stroke: '#0f172a',
  strokeWidth: 3,
}

const initialEdges: DepartmentEdge[] = [
  {
    id: 'direzione-vendite',
    source: 'direzione',
    target: 'vendite',
    animated: true,
    style: edgeStyle,
    markerEnd: { type: MarkerType.ArrowClosed, width: 28, height: 28, color: edgeStyle.stroke },
  },
  {
    id: 'direzione-produzione',
    source: 'direzione',
    target: 'produzione',
    animated: true,
    style: edgeStyle,
    markerEnd: { type: MarkerType.ArrowClosed, width: 28, height: 28, color: edgeStyle.stroke },
  },
]

const nodeTypes = { department: DepartmentNode }

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DepartmentData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(true)
  const [shortcuts, setShortcuts] = useState(initialShortcuts)
  const [backgroundColor, setBackgroundColor] = useState('#cbd5f5')

  const backgroundStyle = useMemo(() => createBackgroundGradient(backgroundColor), [backgroundColor])
  const backgroundGridColor = useMemo(() => adjustHexColor(backgroundColor, -80), [backgroundColor])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((connections) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: edgeStyle,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 28,
              height: 28,
              color: edgeStyle.stroke,
            },
          },
          connections,
        ),
      )
    },
    [setEdges],
  )

  const handleAddDepartment = useCallback(
    ({ name, color }: { name: string; color: string }) => {
      setNodes((current) => {
        const id = uuidv4()
        const column = current.length % 3
        const row = Math.floor(current.length / 3)

        const newNode: DepartmentNodeType = {
          id,
          type: 'department',
          position: { x: column * 280 - 220, y: row * 230 + 250 },
          data: {
            departmentId: id,
            name,
            color,
            size: 1,
            roles: [],
          },
        }
        return [...current, newNode]
      })
    },
    [setNodes],
  )

  const handleAddRole = useCallback(
    (departmentId: string, roleName: string) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== departmentId) {
            return node
          }
          return {
            ...node,
            data: {
              ...node.data,
              roles: [
                ...node.data.roles,
                {
                  id: uuidv4(),
                  name: roleName,
                  employees: [],
                },
              ],
            },
          }
        }),
      )
    },
    [setNodes],
  )

  const handleAddEmployee = useCallback(
    (departmentId: string, roleId: string, employeeName: string) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== departmentId) {
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
                  employees: [
                    ...role.employees,
                    {
                      id: uuidv4(),
                      name: employeeName,
                      description: '',
                    },
                  ],
                }
              }),
            },
          }
        }),
      )
    },
    [setNodes],
  )

  const handleUpdateDepartment = useCallback(
    (departmentId: string, updates: { name?: string; color?: string; size?: number }) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== departmentId) {
            return node
          }
          return {
            ...node,
            data: {
              ...node.data,
              name: updates.name ?? node.data.name,
              color: updates.color ?? node.data.color,
              size: updates.size ?? node.data.size,
            },
          }
        }),
      )
    },
    [setNodes],
  )

  const handleResizeDepartment = useCallback(
    (departmentId: string, delta: number) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== departmentId) {
            return node
          }
          const nextSize = clamp(parseFloat((node.data.size ?? 1).toString()) + delta, 0.6, 1.6)
          return {
            ...node,
            data: {
              ...node.data,
              size: parseFloat(nextSize.toFixed(2)),
            },
          }
        }),
      )
    },
    [setNodes],
  )

  const handleUpdateRole = useCallback(
    (departmentId: string, roleId: string, roleName: string) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== departmentId) {
            return node
          }
          return {
            ...node,
            data: {
              ...node.data,
              roles: node.data.roles.map((role) =>
                role.id === roleId
                  ? {
                      ...role,
                      name: roleName,
                    }
                  : role,
              ),
            },
          }
        }),
      )
    },
    [setNodes],
  )

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const nextSelected = selectedNodes[0]?.id ?? null
      setSelectedDepartmentId(nextSelected)
    },
    [],
  )

  const handleSelectRole = useCallback((roleId: string | null) => {
    setSelectedRoleId(roleId)
  }, [])

  const handleToggleShortcuts = useCallback(() => {
    setShowShortcuts((current) => !current)
  }, [])

  const handleShortcutChange = useCallback((id: string, updates: Partial<Shortcut>) => {
    setShortcuts((current) =>
      current.map((shortcut) =>
        shortcut.id === id
          ? {
              ...shortcut,
              ...updates,
            }
          : shortcut,
      ),
    )
  }, [])

  const handleBackgroundColorChange = useCallback((color: string) => {
    setBackgroundColor(color)
  }, [])

  useEffect(() => {
    setSelectedRoleId(null)
  }, [selectedDepartmentId])

  useEffect(() => {
    if (!selectedDepartmentId) {
      return
    }
    const departmentExists = nodes.some((node) => node.id === selectedDepartmentId)
    if (!departmentExists) {
      setSelectedDepartmentId(null)
      setSelectedRoleId(null)
      return
    }
    if (!selectedRoleId) {
      return
    }
    const roleExists = nodes
      .find((node) => node.id === selectedDepartmentId)
      ?.data.roles.some((role) => role.id === selectedRoleId)
    if (!roleExists) {
      setSelectedRoleId(null)
    }
  }, [nodes, selectedDepartmentId, selectedRoleId])

  const departments = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        name: node.data.name,
        color: node.data.color,
        roles: node.data.roles,
        size: node.data.size,
      })),
    [nodes],
  )

  return (
    <div className="app">
      <Sidebar
        onAddDepartment={handleAddDepartment}
        onAddRole={handleAddRole}
        onAddEmployee={handleAddEmployee}
        departments={departments}
        selectedDepartmentId={selectedDepartmentId}
        selectedRoleId={selectedRoleId}
        onUpdateDepartment={handleUpdateDepartment}
        onResizeDepartment={handleResizeDepartment}
        onSelectRole={handleSelectRole}
        onUpdateRole={handleUpdateRole}
        shortcuts={shortcuts}
        showShortcuts={showShortcuts}
        onToggleShortcuts={handleToggleShortcuts}
        onShortcutChange={handleShortcutChange}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={handleBackgroundColorChange}
      />
      <main className="canvas" style={{ background: backgroundStyle }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onSelectionChange={handleSelectionChange}
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={backgroundGridColor}
            size={1}
            gap={16}
          />
          <Controls
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#f8fafc',
              border: 'none',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.45)',
            }}
          />
        </ReactFlow>
      </main>
    </div>
  )
}

export default App
