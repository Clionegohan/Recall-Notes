import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface HomePageProps {
  userId: Id<"users">
}

export const HomePage = ({ userId }: HomePageProps) => {
  const playlists = useQuery(api["functions/playlists"].getPlaylistsByUser, { userId })
  const playlistCount = playlists?.length ?? 0

  return (
    <div className="home-page">
      <section className="section welcome-section">
        <h2>ようこそ Recall Notes へ！</h2>
        <p>あなたの音楽体験をより豊かにするプレイリスト管理アプリです。</p>
      </section>

      <section className="section actions-section">
        <h3>今すぐ始めよう</h3>
        <div className="action-buttons">
          <Link to="/add" className="action-btn primary">
            🎵 新しい楽曲を追加
          </Link>
          <Link to="/playlists" className="action-btn secondary">
            📋 プレイリストを見る
          </Link>
        </div>
      </section>

      {playlistCount > 0 && (
        <section className="section recent-section">
          <h3>最近追加した楽曲</h3>
          <div className="recent-playlists">
            {playlists?.slice(0, 3).map((playlist) => (
              <div key={playlist._id} className="recent-item">
                {playlist.albumArt && (
                  <img 
                    src={playlist.albumArt} 
                    alt={`${playlist.title} album art`}
                    className="recent-album-art"
                  />
                )}
                <div className="recent-info">
                  <h4>{playlist.title}</h4>
                  <p>{playlist.artist}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/playlists" className="view-all-link">
            すべて見る →
          </Link>
        </section>
      )}
    </div>
  )
}