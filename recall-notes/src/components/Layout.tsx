import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎵 Recall Notes</h1>
          <p>あなたの音楽プレイリストを管理しよう</p>
        </div>
        
        <nav className="navigation">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            ホーム
          </Link>
          <Link 
            to="/playlists" 
            className={`nav-link ${isActive('/playlists') ? 'active' : ''}`}
          >
            プレイリスト
          </Link>
          <Link 
            to="/add" 
            className={`nav-link ${isActive('/add') ? 'active' : ''}`}
          >
            追加
          </Link>
        </nav>
      </header>

      <main className="app-main">
        {children}
      </main>
    </div>
  )
}