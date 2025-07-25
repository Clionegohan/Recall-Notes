import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useAction } from 'convex/react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Pagination } from '../components/Pagination'
import { api } from '../../convex/_generated/api'
import { useUser } from '../hooks/useUser'
import type { TrackSuggestion, SpotifyArtist } from '../types/spotify'

export const ArtistDetailPage = () => {
  const { artistId } = useParams<{ artistId: string }>()
  const navigate = useNavigate()
  const { currentUserId } = useUser()
  
  const [tracks, setTracks] = useState<TrackSuggestion[]>([])
  const [artist, setArtist] = useState<SpotifyArtist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTracks, setTotalTracks] = useState(0)
  const [hasMoreTracks, setHasMoreTracks] = useState(false)
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null)
  
  const tracksPerPage = 20
  const addPlaylist = useMutation(api["functions/playlists"].addPlaylist)
  const getArtistDetails = useAction(api["functions/spotify"].getArtistDetails)
  const getArtistTracks = useAction(api["functions/spotify"].getArtistTracks)

  const fetchArtistData = async () => {
    if (!artistId) return

    try {
      setIsLoading(true)
      setError(null)
      
      // アーティスト詳細と楽曲を並行して取得
      const [artistDetails, tracksResult] = await Promise.all([
        getArtistDetails({ artistId }),
        getArtistTracks({ artistId, offset: (currentPage - 1) * tracksPerPage, limit: tracksPerPage })
      ])
      
      setArtist(artistDetails as SpotifyArtist)
      setTracks(tracksResult.tracks)
      setTotalTracks(tracksResult.total)
      setHasMoreTracks(tracksResult.hasMore)
      
    } catch (err) {
      console.error('Failed to fetch artist data:', err)
      setError('アーティストの情報を取得できませんでした')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArtistData()
  }, [artistId, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // スクロールを上部に戻す
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  const handleAlbumClick = (albumId: string) => {
    navigate(`/album/${albumId}`)
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
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
        
        {artist && (
          <>
            <h1 className="page-title">🎤 {artist.name}</h1>
            {artist.genres && artist.genres.length > 0 && (
              <p className="artist-genres">ジャンル: {artist.genres.join(', ')}</p>
            )}
            <p className="page-subtitle">楽曲一覧 ({totalTracks}曲)</p>
          </>
        )}
      </div>

      <div className="artist-tracks-grid">
        {tracks.map((track, index) => (
          <div key={track.id} className="track-card">
            <div className="track-number">{index + 1}</div>
            
            {track.albumArt && (
              <div 
                className="track-album-art"
                onClick={() => handleAlbumClick(track.albumId!)}
                title={`アルバム「${track.albumName}」を見る`}
              >
                <img 
                  src={track.albumArt} 
                  alt={`${track.name} album art`}
                  className="track-album-image"
                />
              </div>
            )}
            
            <div className="track-info">
              <h3 className="track-name">{track.name}</h3>
              <p className="track-album">from {track.albumName}</p>
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

      <Pagination
        currentPage={currentPage}
        totalItems={totalTracks}
        itemsPerPage={tracksPerPage}
        onPageChange={handlePageChange}
        hasMore={hasMoreTracks}
        isLoading={isLoading}
      />

      {tracks.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>楽曲が見つかりませんでした</p>
        </div>
      )}
    </div>
  )
}