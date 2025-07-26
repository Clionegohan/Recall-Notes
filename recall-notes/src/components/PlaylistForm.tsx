import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { TrackSuggestion, SpotifyArtist } from '../types/spotify'
import { SearchInput } from './SearchInput'
import { ArtistSearchInput } from './ArtistSearchInput'

interface PlaylistFormProps {
  userId: Id<"users">
  onError?: (message: string) => void
  onSuccess?: () => void
}

export const PlaylistForm = ({ userId, onError, onSuccess }: PlaylistFormProps) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackSuggestion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchMode, setSearchMode] = useState<'track' | 'artist'>('track')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const addPlaylist = useMutation(api["functions/playlists"].addPlaylist)

  const handleTrackSelect = (track: TrackSuggestion) => {
    setSelectedTrack(track)
  }

  const handleArtistSelect = (artist: SpotifyArtist) => {
    // アーティスト詳細ページに遷移
    navigate(`/artist/${artist.id}`)
  }

  const handleDirectAdd = async () => {
    if (!selectedTrack) return

    try {
      setIsSubmitting(true)
      setSuccessMessage(null) // 前の成功メッセージをクリア
      
      await addPlaylist({
        title: selectedTrack.name,
        artist: selectedTrack.artist,
        userId,
        albumArt: selectedTrack.albumArt,
        albumName: selectedTrack.albumName,
        albumId: selectedTrack.albumId,
        artistId: selectedTrack.artistId,
        spotifyId: selectedTrack.id
      })
      
      // 成功時の処理
      const successMsg = `「${selectedTrack.name}」をプレイリストに追加しました！`
      setSuccessMessage(successMsg)
      setSelectedTrack(null)
      
      // 3秒後に成功メッセージをクリア
      setTimeout(() => setSuccessMessage(null), 3000)
      
      onSuccess?.()
    } catch (err) {
      console.error('Failed to add playlist:', err)
      const errorMessage = err instanceof Error ? err.message : 'プレイリストの追加に失敗しました'
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="add-playlist-section">
      <h2>楽曲検索・アーティスト検索</h2>
      
      {successMessage && (
        <div className="notification success">
          {successMessage}
        </div>
      )}
      
      <div className="search-mode-tabs">
        <button
          className={`tab-button ${searchMode === 'track' ? 'active' : ''}`}
          onClick={() => setSearchMode('track')}
        >
          🎵 楽曲検索
        </button>
        <button
          className={`tab-button ${searchMode === 'artist' ? 'active' : ''}`}
          onClick={() => setSearchMode('artist')}
        >
          🎤 アーティスト検索
        </button>
      </div>

      {searchMode === 'track' ? (
        <div className="form-group">
          <SearchInput
            id="track-search"
            placeholder="楽曲名を入力してください"
            onTrackSelect={handleTrackSelect}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <div className="form-group">
          <ArtistSearchInput
            id="artist-search"
            placeholder="アーティスト名を入力してください"
            onArtistSelect={handleArtistSelect}
            disabled={isSubmitting}
          />
        </div>
      )}
      
      {searchMode === 'track' && selectedTrack && (
        <div className="selected-track">
          <h4>選択された楽曲:</h4>
          <div className="track-info">
            {selectedTrack.albumArt && (
              <img 
                src={selectedTrack.albumArt} 
                alt={`${selectedTrack.name} album art`}
                className="selected-track-art"
              />
            )}
            <div>
              <div className="track-name">{selectedTrack.name}</div>
              <div className="track-artist">{selectedTrack.artist}</div>
            </div>
          </div>
          
          <button 
            onClick={handleDirectAdd}
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '追加中...' : 'プレイリストに追加'}
          </button>
        </div>
      )}

      {searchMode === 'artist' && (
        <div className="search-hint">
          <p>アーティストを選択すると、そのアーティストの楽曲一覧ページに移動します</p>
        </div>
      )}
    </section>
  )
}