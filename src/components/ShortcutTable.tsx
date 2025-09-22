import type { Shortcut } from '../types'
import './ShortcutTable.css'

type ShortcutTableProps = {
  shortcuts: Shortcut[]
  show: boolean
  onToggle: () => void
  onUpdate: (id: string, updates: Partial<Shortcut>) => void
}

const ShortcutTable = ({ shortcuts, show, onToggle, onUpdate }: ShortcutTableProps) => {
  return (
    <section className="shortcuts">
      <div className="shortcuts-header">
        <h3>Scorciatoie</h3>
        <button type="button" className="shortcuts-toggle" onClick={onToggle}>
          {show ? 'Nascondi' : 'Mostra'}
        </button>
      </div>
      {show && (
        <div className="shortcuts-wrapper">
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th>Azione</th>
                <th>Shortcut</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut) => (
                <tr key={shortcut.id}>
                  <td>
                    <input
                      value={shortcut.action}
                      onChange={(event) =>
                        onUpdate(shortcut.id, { action: event.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={shortcut.keys}
                      onChange={(event) => onUpdate(shortcut.id, { keys: event.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ShortcutTable
