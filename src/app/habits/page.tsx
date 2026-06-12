'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { loadData, saveData } from '../storage'

const NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/tareas', icon: '✅', label: 'Tareas' },
  { href: '/habitos', icon: '🔥', label: 'Hábitos' },
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/gastos', icon: '💰', label: 'Gastos' },
]

type Habito = { id: number; nombre: string; icono: string; racha: number; completadoHoy: boolean; meta: number; ultimaFecha: string }

const ICONOS = ['💪', '📚', '📱', '🏃', '🧘', '💧', '🎯', '✍️', '🎵', '🍎']
const STORAGE_KEY = 'focusflow_habitos'

export default function Habitos() {
  const router = useRouter()
  const [habitos, setHabitos] = useState<Habito[]>([])
  const [cargando, setCargando] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('⭐')

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadData<Habito[]>(STORAGE_KEY, []).then(data => {
      const actualizados = data.map(h => ({
        ...h,
        completadoHoy: h.ultimaFecha === hoy ? h.completadoHoy : false
      }))
      setHabitos(actualizados)
      setCargando(false)
    })
  }, [])

  useEffect(() => {
    if (!cargando) saveData(STORAGE_KEY, habitos)
  }, [habitos, cargando])

  const toggle = (id: number) => setHabitos(prev => prev.map(h => {
    if (h.id !== id) return h
    const completando = !h.completadoHoy
    return { ...h, completadoHoy: completando, ultimaFecha: hoy, racha: completando ? h.racha + 1 : Math.max(0, h.racha - 1) }
  }))

  const eliminar = (id: number) => setHabitos(prev => prev.filter(h => h.id !== id))

  const guardar = () => {
    if (!nombre.trim()) return
    setHabitos(prev => [...prev, { id: Date.now(), nombre, icono, racha: 0, completadoHoy: false, meta: 30, ultimaFecha: '' }])
    setNombre(''); setShowModal(false)
  }

  const completados = habitos.filter(h => h.completadoHoy).length
  const pct = habitos.length > 0 ? Math.round((completados / habitos.length) * 100) : 0

  return (
    <div style={{ background: '#f2f2f7', minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: 'linear-gradient(135deg, #ff9500, #ff6b35)', padding: '60px 24px 28px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Hábitos</h1>
            <p style={{ opacity: 0.9, fontSize: 14 }}>{completados}/{habitos.length} completados hoy</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ background: 'white', color: '#ff9500', border: 'none', borderRadius: 16, width: 48, height: 48, fontSize: 28, fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.3)', borderRadius: 8, height: 8 }}>
          <div style={{ width: `${pct}%`, background: 'white', borderRadius: 8, height: 8, transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>{pct}% del día completado</p>
      </div>

      <div style={{ padding: '20px' }}>
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8e93' }}><p>Cargando...</p></div>
        ) : habitos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8e93' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
            <p style={{ fontWeight: 600 }}>Agregá tu primer hábito</p>
          </div>
        ) : habitos.map(h => (
          <div key={h.id} style={{ background: 'white', borderRadius: 20, padding: '18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: h.completadoHoy ? '#ff950022' : '#f2f2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              {h.icono}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1c1c1e', marginBottom: 4 }}>{h.nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>🔥</span>
                <span style={{ fontSize: 13, color: '#ff9500', fontWeight: 600 }}>{h.racha} días</span>
                <span style={{ fontSize: 12, color: '#8e8e93' }}>· Meta: {h.meta} días</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => toggle(h.id)}
                style={{ width: 36, height: 36, borderRadius: 18, border: 'none', background: h.completadoHoy ? '#ff9500' : '#f2f2f7', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {h.completadoHoy ? '✓' : '○'}
              </button>
              <button onClick={() => eliminar(h.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 16, cursor: 'pointer' }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#1c1c2e', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nuevo hábito</h3>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del hábito"
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 16, marginBottom: 16, boxSizing: 'border-box' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 10 }}>Elegí un ícono:</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {ICONOS.map(i => (
                <button key={i} onClick={() => setIcono(i)}
                  style={{ width: 44, height: 44, borderRadius: 12, border: icono === i ? '2px solid #ff9500' : '2px solid transparent', background: 'rgba(255,255,255,0.1)', fontSize: 22, cursor: 'pointer' }}>
                  {i}
                </button>
              ))}
            </div>
            <button onClick={guardar} disabled={!nombre}
              style={{ width: '100%', background: '#ff9500', color: 'white', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, cursor: nombre ? 'pointer' : 'not-allowed', opacity: nombre ? 1 : 0.4 }}>
              Crear hábito
            </button>
          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.href} onClick={() => router.push(n.href)}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.href === '/habitos' ? '#ff9500' : '#8e8e93', fontWeight: n.href === '/habitos' ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}