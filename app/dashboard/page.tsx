'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/tareas', icon: '✅', label: 'Tareas' },
  { href: '/habitos', icon: '🔥', label: 'Hábitos' },
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/gastos', icon: '💰', label: 'Gastos' },
]

export default function Dashboard() {
  const router = useRouter()
  const [hora, setHora] = useState('')
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setHora(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
      setFecha(now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  const modules = [
    { href: '/tareas', icon: '✅', label: 'Tareas', desc: 'Gestión de tareas', color: '#6057f1' },
    { href: '/habitos', icon: '🔥', label: 'Hábitos', desc: 'Rachas y seguimiento', color: '#ff9500' },
    { href: '/agenda', icon: '📅', label: 'Agenda', desc: 'Calendario personal', color: '#34c759' },
    { href: '/gastos', icon: '💰', label: 'Gastos', desc: 'Control financiero', color: '#00c7be' },
  ]

  return (
    <div style={{ background: '#f2f2f7', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #6057f1 0%, #4c46d6 100%)', padding: '60px 24px 32px', color: 'white' }}>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 4, textTransform: 'capitalize' }}>{fecha}</p>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1, marginBottom: 4 }}>{hora}</h1>
        <p style={{ fontSize: 16, opacity: 0.9 }}>Bienvenido a FocusFlow ⚡</p>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Cards de módulos */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1c1c1e' }}>Módulos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {modules.map(m => (
            <button key={m.href} onClick={() => router.push(m.href)}
              style={{ background: 'white', borderRadius: 20, padding: '20px 16px', border: 'none', textAlign: 'left', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{m.icon}</div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1c1c1e', marginBottom: 2 }}>{m.label}</p>
              <p style={{ fontSize: 12, color: '#8e8e93' }}>{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Banner motivacional */}
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #1c1c2e, #2d2d44)', borderRadius: 20, padding: '20px 24px', color: 'white' }}>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>💡 Tip del día</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Organizá tu día en los primeros 10 minutos de la mañana.</p>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.href} onClick={() => router.push(n.href)}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.href === '/dashboard' ? '#6057f1' : '#8e8e93', fontWeight: n.href === '/dashboard' ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
