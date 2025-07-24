import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { PlaylistFormData } from '../types'

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
        userId
      })
      
      setFormData({
        title: '',
        artist: ''
      })
      
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
          <label htmlFor="title">曲名</label>
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
          <label htmlFor="artist">アーティスト</label>
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