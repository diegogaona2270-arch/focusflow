'use client'
import { useState, useEffect } from 'react'
import { loadData, saveData } from '../storage'

const NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/tareas', icon: '✅', label: 'Tareas' },
  { href: '/habitos', icon: '🔥', label: 'Hábitos' },
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/gastos', icon: '💰', label: 'Gastos' },
]

type Gasto = { id: number; amount: number; categoryId: string; description: string; date: string }
const CATS = [
  { id: 'gym', icon: '💪', name: 'Gym' },
  { id: 'food', icon: '🍔', name: 'Comida' },
  { id: 'transport', icon: '🚗', name: 'Transporte' },
  { id: 'work', icon: '💼', name: 'Trabajo' },
  { id: 'health', icon: '🏥', name: 'Salud' },
  { id: 'family', icon: '👨‍👩‍👧', name: 'Familia' },
  { id: 'other', icon: '📦', name: 'Otros' },
]
const fmt = (n: number) => '$' + n.toLocaleString('es-AR')
const today = () => new Date().toISOString().split('T')[0]

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [listo, setListo] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState('food')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState(today())
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes' | 'año'>('mes')
  const [tab, setTab] = useState<'resumen' | 'movimientos' | 'graficos'>('resumen')

  useEffect(() => {
    loadData<Gasto[]>('focusflow_gastos', []).then(data => { setGastos(data); setListo(true) })
  }, [])

  useEffect(() => {
    if (listo) saveData('focusflow_gastos', gastos)
  }, [gastos, listo])

  const now = new Date()
  const filtrar = (g: Gasto) => {
    const d = new Date(g.date)
    if (periodo === 'hoy') return g.date === today()
    if (periodo === 'semana') { const s = new Date(now); s.setDate(now.getDate() - 7); return d >= s }
    if (periodo === 'mes') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear()
  }

  const filtrados = gastos.filter(filtrar)
  const total = filtrados.reduce((s, g) => s + g.amount, 0)
  const totalHoy = gastos.filter(g => g.date === today()).reduce((s, g) => s + g.amount, 0)
  const totalSemana = gastos.filter(g => { const d = new Date(g.date); const s = new Date(now); s.setDate(now.getDate() - 7); return d >= s }).reduce((s, g) => s + g.amount, 0)
  const totalMes = gastos.filter(g => { const d = new Date(g.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).reduce((s, g) => s + g.amount, 0)
  const totalAnio = gastos.filter(g => new Date(g.date).getFullYear() === now.getFullYear()).reduce((s, g) => s + g.amount, 0)
  const mayorCat = CATS.map(c => ({ ...c, total: gastos.filter(g => g.categoryId === c.id).reduce((s, g) => s + g.amount, 0) })).sort((a, b) => b.total - a.total)[0]

  const guardar = () => {
    const n = parseFloat(amount.replace(',', '.'))
    if (!n || n <= 0) return
    setGastos(prev => [...prev, { id: Date.now(), amount: n, categoryId: catId, description: desc, date }])
    setAmount(''); setDesc(''); setDate(today()); setShowModal(false)
  }

  const eliminar = (id: number) => setGastos(prev => prev.filter(g => g.id !== id))
  const cat = (id: string) => CATS.find(c => c.id === id) || CATS[6]

  if (!listo) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f2f2f7' }}><p style={{ color: '#6057f1', fontWeight: 600 }}>Cargando...</p></div>

  return (
    <div style={{ background: '#f2f2f7', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', paddingTop: 'env(safe-area-inset-top)', zIndex: 100 }}>
        {NAV.map(n => (
          <a key={n.href} href={n.href} style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.href === '/gastos' ? '#6057f1' : '#8e8e93', fontWeight: n.href === '/gastos' ? 700 : 400 }}>{n.label}</span>
          </a>
        ))}
      </nav>

      <div style={{ paddingTop: 80 }}>
        <div style={{ background: '#f2f2f7', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1c1c1e' }}>Gastos</h1>
              <p style={{ color: '#8e8e93', fontSize: 14 }}>Control financiero</p>
            </div>
            <button onClick={() => setShowModal(true)} style={{ background: '#6057f1', color: 'white', border: 'none', borderRadius: 16, width: 48, height: 48, fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['hoy','semana','mes','año'] as const).map(p => (
              <button key={p} onClick={() => setPeriodo(p)} style={{ flex: 1, padding: '8px 0', borderRadius: 20, border: 'none', background: periodo === p ? '#6057f1' : 'white', color: periodo === p ? 'white' : '#1c1c1e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ margin: '0 20px 20px', background: 'linear-gradient(135deg, #6057f1, #4c46d6)', borderRadius: 24, padding: '24px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 }}>{periodo.charAt(0).toUpperCase() + periodo.slice(1)}</p>
          <p style={{ color: 'white', fontSize: 42, fontWeight: 700 }}>{fmt(total)}</p>
        </div>

        <div style={{ margin: '0 20px 20px', display: 'flex', background: 'white', borderRadius: 16, padding: 4 }}>
          {(['resumen','movimientos','graficos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: tab === t ? '#f2f2f7' : 'none', color: '#1c1c1e', fontSize: 13, fontWeight: tab === t ? 700 : 400, cursor: 'pointer' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ padding: '0 20px 40px' }}>
          {tab === 'resumen' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[['Hoy', totalHoy, '#6057f1'], ['Semana', totalSemana, '#00c7be'], ['Mes', totalMes, '#ff9500'], ['Año', totalAnio, '#34c759']].map(([l, v, c]) => (
                  <div key={l as string} style={{ background: 'white', borderRadius: 16, padding: '16px' }}>
                    <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 4 }}>{l}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: c as string }}>{fmt(v as number)}</p>
                  </div>
                ))}
              </div>
              {mayorCat && mayorCat.total > 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{mayorCat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: '#8e8e93' }}>Mayor gasto este mes</p>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{mayorCat.name}</p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{fmt(mayorCat.total)}</p>
                </div>
              )}
              {gastos.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#8e8e93' }}><div style={{ fontSize: 48, marginBottom: 8 }}>💸</div><p>Sin gastos registrados</p></div>}
              {gastos.slice(-5).reverse().map(g => (
                <div key={g.id} style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{cat(g.categoryId).icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{g.description || cat(g.categoryId).name}</p>
                    <p style={{ fontSize: 12, color: '#8e8e93' }}>{cat(g.categoryId).name} · {g.date}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{fmt(g.amount)}</p>
                    <button onClick={() => eliminar(g.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 14, cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </>
          )}
          {tab === 'movimientos' && (
            filtrados.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8e93' }}><div style={{ fontSize: 48, marginBottom: 12 }}>💸</div><p>Sin movimientos en este período</p></div>
              : filtrados.slice().reverse().map(g => (
                <div key={g.id} style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{cat(g.categoryId).icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{g.description || cat(g.categoryId).name}</p>
                    <p style={{ fontSize: 12, color: '#8e8e93' }}>{cat(g.categoryId).name} · {g.date}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#ff3b30' }}>-{fmt(g.amount)}</p>
                    <button onClick={() => eliminar(g.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 14, cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
              ))
          )}
          {tab === 'graficos' && (
            <div style={{ background: 'white', borderRadius: 20, padding: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Por categoría</h3>
              {CATS.map(c => {
                const t = gastos.filter(g => g.categoryId === c.id).reduce((s, g) => s + g.amount, 0)
                if (!t) return null
                const pct = totalAnio > 0 ? (t / totalAnio) * 100 : 0
                return (
                  <div key={c.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>{c.icon} {c.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(t)}</span>
                    </div>
                    <div style={{ background: '#f2f2f7', borderRadius: 6, height: 8 }}>
                      <div style={{ width: `${pct}%`, background: '#6057f1', borderRadius: 6, height: 8 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1c1c2e', borderRadius: '24px 24px 0 0', padding: '24px 20px 50px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Registrar gasto</h3>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto" type="number" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '14px 16px', color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
              {CATS.map(c => (
                <button key={c.id} onClick={() => setCatId(c.id)} style={{ padding: '10px 4px', borderRadius: 12, border: catId === c.id ? '2px solid #6057f1' : '2px solid transparent', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <span style={{ fontSize: 10, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{c.name}</span>
                </button>
              ))}
            </div>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción (opcional)" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px', color: 'white', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px', color: 'white', fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }} />
            <button onClick={guardar} disabled={!amount} style={{ width: '100%', background: '#6057f1', color: 'white', border: 'none', borderRadius: 14, padding: 18, fontSize: 16, fontWeight: 700, cursor: amount ? 'pointer' : 'not-allowed', opacity: amount ? 1 : 0.4 }}>
              Registrar gasto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}