import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Playlist } from '../types'

interface PlaylistListProps {
  userId: Id<"users">
}

interface PlaylistCardProps {
  playlist: Playlist
}

const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const navigate = useNavigate()

  const handleArtistClick = () => {
    if (playlist.artistId) {
      navigate(`/artist/${playlist.artistId}`)
    }
  }

  const handleAlbumClick = () => {
    if (playlist.albumId) {
      navigate(`/album/${playlist.albumId}`)
    }
  }

  return (
    <div className="playlist-card">
      <div className="playlist-info">
        <h3 className="playlist-title">{playlist.title}</h3>
        <p className="playlist-artist">
          by{' '}
          {playlist.artistId ? (
            <span 
              className="clickable-artist"
              onClick={handleArtistClick}
              title={`${playlist.artist}の楽曲一覧を見る`}
            >
              {playlist.artist}
            </span>
          ) : (
            playlist.artist
          )}
        </p>
        {playlist.spotifyId && (
          <p className="playlist-spotify">Spotify: {playlist.spotifyId}</p>
        )}
      </div>
      {playlist.albumArt && (
        <div 
          className="playlist-album-art"
          onClick={handleAlbumClick}
          title={playlist.albumName ? `アルバム「${playlist.albumName}」の楽曲一覧を見る` : undefined}
        >
          <img 
            src={playlist.albumArt} 
            alt={`${playlist.title} album art`}
            className="album-art-image"
          />
        </div>
      )}
    </div>
  )
}

export const PlaylistList = ({ userId }: PlaylistListProps) => {
  const playlists = useQuery(api.playlists.getPlaylistsByUser, { userId })

  if (playlists === undefined) {
    return (
      <section className="playlists-section">
        <h2>あなたのプレイリスト</h2>
        <div className="loading">読み込み中...</div>
      </section>
    )
  }

  if (playlists.length === 0) {
    return (
      <section className="playlists-section">
        <h2>あなたのプレイリスト</h2>
        <div className="empty-state">
          <p>まだプレイリストがありません。</p>
          <p>上のフォームから最初の曲を追加してみましょう！</p>
        </div>
      </section>
    )
  }

  return (
    <section className="playlists-section">
      <h2>あなたのプレイリスト ({playlists.length}曲)</h2>
      <div className="playlists-grid">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist._id} playlist={playlist} />
        ))}
      </div>
    </section>
  )
}