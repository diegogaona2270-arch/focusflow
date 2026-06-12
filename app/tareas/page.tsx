'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { loadData, saveData } from '@/storage'

const NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/tareas', icon: '✅', label: 'Tareas' },
  { href: '/habitos', icon: '🔥', label: 'Hábitos' },
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/gastos', icon: '💰', label: 'Gastos' },
]

type Tarea = { id: number; titulo: string; prioridad: string; categoria: string; completada: boolean; fecha: string }

const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica']
const COLORES_PRIORIDAD: Record<string, string> = { Baja: '#34c759', Media: '#ff9500', Alta: '#ff6b35', Crítica: '#ff3b30' }
const CATEGORIAS = ['Personal', 'Trabajo', 'Inmobiliaria', 'Campo', 'Finanzas', 'Salud', 'Familia']
const STORAGE_KEY = 'focusflow_tareas'

export default function Tareas() {
  const router = useRouter()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [prioridad, setPrioridad] = useState('Media')
  const [categoria, setCategoria] = useState('Personal')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'completadas'>('pendientes')

  useEffect(() => {
    loadData<Tarea[]>(STORAGE_KEY, []).then(data => {
      setTareas(data)
      setCargando(false)
    })
  }, [])

  useEffect(() => {
    if (!cargando) saveData(STORAGE_KEY, tareas)
  }, [tareas, cargando])

  const guardar = () => {
    if (!titulo.trim()) return
    setTareas(prev => [...prev, { id: Date.now(), titulo, prioridad, categoria, completada: false, fecha }])
    setTitulo(''); setShowModal(false)
  }

  const toggle = (id: number) => setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: !t.completada } : t))
  const eliminar = (id: number) => setTareas(prev => prev.filter(t => t.id !== id))

  const filtradas = tareas.filter(t =>
    filtro === 'todas' ? true : filtro === 'pendientes' ? !t.completada : t.completada
  )

  return (
    <div style={{ background: '#f2f2f7', minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: 'linear-gradient(135deg, #6057f1, #4c46d6)', padding: '60px 24px 28px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Tareas</h1>
            <p style={{ opacity: 0.8, fontSize: 14 }}>{tareas.filter(t => !t.completada).length} pendientes</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ background: 'white', color: '#6057f1', border: 'none', borderRadius: 16, width: 48, height: 48, fontSize: 28, fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['pendientes', 'todas', 'completadas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ padding: '8px 16px', borderRadius: 20, border: filtro === f ? 'none' : '1px solid #e0e0e0', background: filtro === f ? '#6057f1' : 'white', color: filtro === f ? 'white' : '#8e8e93', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8e93' }}><p>Cargando...</p></div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8e93' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 600 }}>Sin tareas aquí</p>
          </div>
        ) : filtradas.map(t => (
          <div key={t.id} style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <button onClick={() => toggle(t.id)}
              style={{ width: 26, height: 26, borderRadius: 13, border: `2px solid ${t.completada ? '#6057f1' : '#ddd'}`, background: t.completada ? '#6057f1' : 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>
              {t.completada ? '✓' : ''}
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 15, color: t.completada ? '#8e8e93' : '#1c1c1e', textDecoration: t.completada ? 'line-through' : 'none', marginBottom: 4 }}>{t.titulo}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: `${COLORES_PRIORIDAD[t.prioridad]}22`, color: COLORES_PRIORIDAD[t.prioridad], fontWeight: 600 }}>{t.prioridad}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: '#f2f2f7', color: '#8e8e93' }}>{t.categoria}</span>
              </div>
            </div>
            <button onClick={() => eliminar(t.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 18, cursor: 'pointer' }}>🗑</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#1c1c2e', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nueva tarea</h3>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la tarea"
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <select value={prioridad} onChange={e => setPrioridad(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px', color: 'white', fontSize: 14 }}>
                {PRIORIDADES.map(p => <option key={p} value={p} style={{ background: '#1c1c2e' }}>{p}</option>)}
              </select>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px', color: 'white', fontSize: 14 }}>
                {CATEGORIAS.map(c => <option key={c} value={c} style={{ background: '#1c1c2e' }}>{c}</option>)}
              </select>
            </div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
            <button onClick={guardar} disabled={!titulo}
              style={{ width: '100%', background: '#6057f1', color: 'white', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, cursor: titulo ? 'pointer' : 'not-allowed', opacity: titulo ? 1 : 0.4 }}>
              Crear tarea
            </button>
          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.href} onClick={() => router.push(n.href)}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.href === '/tareas' ? '#6057f1' : '#8e8e93', fontWeight: n.href === '/tareas' ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}