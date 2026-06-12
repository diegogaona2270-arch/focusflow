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

type Evento = { id: number; titulo: string; hora: string; color: string; descripcion: string }

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const COLORES = ['#6057f1', '#ff9500', '#34c759', '#00c7be', '#ff3b30', '#ff6b35']
const STORAGE_KEY = 'focusflow_agenda'

export default function Agenda() {
  const router = useRouter()
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(hoy.getMonth())
  const [anioActual, setAnioActual] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate())
  const [showModal, setShowModal] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [hora, setHora] = useState('09:00')
  const [color, setColor] = useState('#6057f1')
  const [descripcion, setDescripcion] = useState('')
  const [eventos, setEventos] = useState<Record<string, Evento[]>>({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    loadData<Record<string, Evento[]>>(STORAGE_KEY, {}).then(data => {
      setEventos(data)
      setCargando(false)
    })
  }, [])

  useEffect(() => {
    if (!cargando) saveData(STORAGE_KEY, eventos)
  }, [eventos, cargando])

  const keyDia = `${anioActual}-${mesActual}-${diaSeleccionado}`
  const eventosDelDia = eventos[keyDia] || []

  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate()
  const primerDia = new Date(anioActual, mesActual, 1).getDay()

  const guardar = () => {
    if (!titulo.trim()) return
    const nuevo = { id: Date.now(), titulo, hora, color, descripcion }
    setEventos(prev => ({ ...prev, [keyDia]: [...(prev[keyDia] || []), nuevo] }))
    setTitulo(''); setHora('09:00'); setColor('#6057f1'); setDescripcion(''); setShowModal(false)
  }

  const eliminarEvento = (id: number) => {
    setEventos(prev => ({ ...prev, [keyDia]: (prev[keyDia] || []).filter(ev => ev.id !== id) }))
  }

  const mesAnterior = () => {
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1) }
    else setMesActual(m => m - 1)
  }
  const mesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1) }
    else setMesActual(m => m + 1)
  }

  return (
    <div style={{ background: '#f2f2f7', minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: 'linear-gradient(135deg, #34c759, #2da44e)', padding: '60px 24px 28px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Agenda</h1>
            <p style={{ opacity: 0.9, fontSize: 14 }}>{eventosDelDia.length} eventos hoy</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ background: 'white', color: '#34c759', border: 'none', borderRadius: 16, width: 48, height: 48, fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={mesAnterior} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6057f1' }}>‹</button>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>{MESES[mesActual]} {anioActual}</h3>
            <button onClick={mesSiguiente} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6057f1' }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#8e8e93', fontWeight: 600, padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array(primerDia).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(diasEnMes).fill(null).map((_, i) => {
              const dia = i + 1
              const key = `${anioActual}-${mesActual}-${dia}`
              const tieneEventos = (eventos[key] || []).length > 0
              const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear()
              const seleccionado = dia === diaSeleccionado
              return (
                <button key={dia} onClick={() => setDiaSeleccionado(dia)}
                  style={{ aspectRatio: '1', borderRadius: '50%', border: 'none', background: seleccionado ? '#34c759' : esHoy ? '#34c75922' : 'none', color: seleccionado ? 'white' : esHoy ? '#34c759' : '#1c1c1e', fontWeight: esHoy || seleccionado ? 700 : 400, fontSize: 14, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {dia}
                  {tieneEventos && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: seleccionado ? 'white' : '#34c759' }} />}
                </button>
              )
            })}
          </div>
        </div>

        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12, color: '#1c1c1e' }}>
          {diaSeleccionado} de {MESES[mesActual]}
        </h3>
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8e8e93' }}><p>Cargando...</p></div>
        ) : eventosDelDia.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8e8e93' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
            <p>Sin eventos este día</p>
          </div>
        ) : eventosDelDia.map(ev => (
          <div key={ev.id} style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1c1c1e', marginBottom: 2 }}>{ev.titulo}</p>
              <p style={{ fontSize: 13, color: '#8e8e93' }}>🕐 {ev.hora}</p>
            </div>
            <button onClick={() => eliminarEvento(ev.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 18, cursor: 'pointer' }}>🗑</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#1c1c2e', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nuevo evento</h3>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del evento"
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }} />
            <input type="time" value={hora} onChange={e => setHora(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 10 }}>Color:</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {COLORES.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
            <button onClick={guardar} disabled={!titulo}
              style={{ width: '100%', background: '#34c759', color: 'white', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, cursor: titulo ? 'pointer' : 'not-allowed', opacity: titulo ? 1 : 0.4 }}>
              Crear evento
            </button>
          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.href} onClick={() => router.push(n.href)}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.href === '/agenda' ? '#34c759' : '#8e8e93', fontWeight: n.href === '/agenda' ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}