export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0e0e16',
      color: 'white',
      fontFamily: 'system-ui',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: 64,
        height: 64,
        backgroundColor: '#6057f1',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32
      }}>
        ⚡
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
        FocusFlow
      </h1>
      <p style={{ color: '#9898af', margin: 0 }}>
        Tu agenda personal inteligente
      </p>
      <p style={{ color: '#6057f1', fontSize: 14 }}>
        ✓ App funcionando correctamente
      </p>
    </div>
  )
}