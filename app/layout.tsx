import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FocusFlow',
  description: 'Tu agenda personal inteligente',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FocusFlow',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6057f1" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body style={{ background: '#f2f2f7', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}