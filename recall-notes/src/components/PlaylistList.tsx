import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Playlist } from '../types'

interface PlaylistListProps {
  userId: Id<"users">
  searchQuery?: string
  sortBy?: 'recent' | 'title' | 'artist'
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

export const PlaylistList = ({ userId, searchQuery = '', sortBy = 'recent' }: PlaylistListProps) => {
  const playlists = useQuery(api.functions.playlists.getPlaylistsByUser, { userId })

  if (playlists === undefined) {
    return <div className="loading">読み込み中...</div>
  }

  // 検索フィルタリング
  const filteredPlaylists = playlists.filter(playlist => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      playlist.title.toLowerCase().includes(query) ||
      playlist.artist.toLowerCase().includes(query)
    )
  })

  // ソート
  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title, 'ja')
      case 'artist':
        return a.artist.localeCompare(b.artist, 'ja')
      case 'recent':
      default:
        return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
    }
  })

  if (playlists.length === 0) {
    return (
      <div className="empty-state">
        <p>まだプレイリストがありません。</p>
        <p>楽曲を検索して最初の曲を追加してみましょう！</p>
      </div>
    )
  }

  if (filteredPlaylists.length === 0) {
    return (
      <div className="empty-state">
        <p>「{searchQuery}」に一致するプレイリストが見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <>
      <p className="playlist-count">{sortedPlaylists.length}曲のプレイリスト</p>
      <div className="playlists-grid">
        {sortedPlaylists.map((playlist) => (
          <PlaylistCard key={playlist._id} playlist={playlist} />
        ))}
      </div>
    </>
  )
}