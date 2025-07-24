import type { ReactNode } from 'react'

interface SimpleLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export const SimpleLayout = ({ title, subtitle, children }: SimpleLayoutProps) => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 {title}</h1>
        <p>{subtitle}</p>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}