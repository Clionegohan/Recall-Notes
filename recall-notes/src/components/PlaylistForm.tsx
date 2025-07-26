import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { PlaylistFormData } from '../types'
import type { TrackSuggestion } from '../types/spotify'
import { SearchInput } from './SearchInput'

interface PlaylistFormProps {
  userId: Id<"users">
  onError: (error: string) => void
  onSuccess?: () => void
}

export const PlaylistForm = ({ userId, onError, onSuccess }: PlaylistFormProps) => {
  const [formData, setFormData] = useState<PlaylistFormData>({
    title: '',
    artist: ''
  })
  const [selectedTrack, setSelectedTrack] = useState<TrackSuggestion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const addPlaylist = useMutation(api.playlists.addPlaylist)

  const handleInputChange = (field: keyof PlaylistFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleTrackSelect = (track: TrackSuggestion) => {
    setSelectedTrack(track)
    setFormData({
      title: track.name,
      artist: track.artist
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.artist) {
      onError("曲名とアーティスト名を入力してください")
      return
    }

    setIsSubmitting(true)
    try {
      await addPlaylist({
        title: formData.title,
        artist: formData.artist,
        userId,
        albumArt: selectedTrack?.albumArt,
        albumName: selectedTrack?.albumName,
        albumId: selectedTrack?.albumId,
        artistId: selectedTrack?.artistId,
        spotifyId: selectedTrack?.id
      })
      
      setFormData({
        title: '',
        artist: ''
      })
      setSelectedTrack(null)
      
      onSuccess?.()
    } catch (err) {
      console.error("プレイリスト追加エラー:", err)
      onError("プレイリストの追加に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="add-playlist-section">
      <h2>新しいプレイリストを追加</h2>
      <form onSubmit={handleSubmit} className="playlist-form">
        <div className="form-group">
          <label htmlFor="search">楽曲を検索</label>
          <SearchInput
            id="search"
            placeholder="楽曲名またはアーティスト名を入力してください"
            onTrackSelect={handleTrackSelect}
            disabled={isSubmitting}
          />
        </div>
        
        {selectedTrack && (
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
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="title">曲名 (手動入力も可能)</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange('title')}
            placeholder="曲名を入力してください"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="artist">アーティスト (手動入力も可能)</label>
          <input
            id="artist"
            type="text"
            value={formData.artist}
            onChange={handleInputChange('artist')}
            placeholder="アーティスト名を入力してください"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? '追加中...' : 'プレイリストに追加'}
        </button>
      </form>
    </section>
  )
}