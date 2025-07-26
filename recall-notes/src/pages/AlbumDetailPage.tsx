import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useAction } from 'convex/react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { api } from '../../convex/_generated/api'
import { useUser } from '../hooks/useUser'
import type { TrackSuggestion } from '../types/spotify'

interface AlbumInfo {
  id: string
  name: string
  artists: { name: string; id: string }[]
  images: { url: string }[]
  release_date: string
  total_tracks: number
}

export const AlbumDetailPage = () => {
  const { albumId } = useParams<{ albumId: string }>()
  const navigate = useNavigate()
  const { currentUserId } = useUser()
  
  const [tracks, setTracks] = useState<TrackSuggestion[]>([])
  const [album, setAlbum] = useState<AlbumInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null)
  
  const addPlaylist = useMutation(api["functions/playlists"].addPlaylist)
  const getAlbumDetails = useAction(api["functions/spotify"].getAlbumDetails)
  const getAlbumTracks = useAction(api["functions/spotify"].getAlbumTracks)

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!albumId) return

      try {
        setIsLoading(true)
        setError(null)
        
        // アルバム詳細と楽曲を並行して取得
        const [albumDetails, tracksResult] = await Promise.all([
          getAlbumDetails({ albumId }),
          getAlbumTracks({ albumId })
        ])
        
        setAlbum(tracksResult.album)
        setTracks(tracksResult.tracks)
        
      } catch (err) {
        console.error('Failed to fetch album data:', err)
        setError('アルバムの情報を取得できませんでした')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlbumData()
  }, [albumId])

  const handleTrackSelect = async (track: TrackSuggestion) => {
    if (!currentUserId) {
      alert('プレイリストに追加するにはログインが必要です')
      return
    }

    try {
      setAddingTrackId(track.id)
      
      await addPlaylist({
        title: track.name,
        artist: track.artist,
        userId: currentUserId,
        albumArt: track.albumArt,
        albumName: track.albumName,
        albumId: track.albumId,
        artistId: track.artistId,
        spotifyId: track.id
      })

      alert(`「${track.name}」をプレイリストに追加しました！`)
    } catch (error) {
      console.error('Failed to add track to playlist:', error)
      const errorMessage = error instanceof Error ? error.message : 'プレイリストへの追加に失敗しました'
      alert(errorMessage)
    } finally {
      setAddingTrackId(null)
    }
  }

  const handleArtistClick = (artistId: string) => {
    navigate(`/artist/${artistId}`)
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="page-container">
        <ErrorMessage message={error || 'アルバム情報が見つかりません'} />
        <button onClick={() => navigate(-1)} className="back-button">
          戻る
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← 戻る
        </button>
      </div>

      <div className="album-header">
        <h1 className="album-title">💿 {album.name}</h1>
        <p className="album-artist">
          <span 
            className="clickable-artist"
            onClick={() => handleArtistClick(album.artistId)}
            title={`${album.artist}の楽曲一覧を見る`}
            >
              {album.artist}
            </span>
          </p>
          <p className="album-details">
            {new Date(album.release_date).getFullYear()}年 • {album.total_tracks}曲
          </p>
        </div>

      <div className="album-tracks-list">
        <h2 className="tracks-title">収録楽曲</h2>
        
        {tracks.map((track, index) => (
          <div key={track.id} className="album-track-card">
            <div className="track-number">{index + 1}</div>
            
            <div className="track-info">
              <h3 className="track-name">{track.name}</h3>
              <p className="track-artist">{track.artist}</p>
            </div>
            
            <button
              className="add-track-button"
              onClick={() => handleTrackSelect(track)}
              title="プレイリストに追加"
              disabled={addingTrackId === track.id}
            >
              {addingTrackId === track.id ? '...' : '➕'}
            </button>
          </div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="empty-state">
          <p>楽曲が見つかりませんでした</p>
        </div>
      )}
    </div>
  )
}