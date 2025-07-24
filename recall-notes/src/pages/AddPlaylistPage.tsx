import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlaylistForm } from '../components/PlaylistForm'
import type { Id } from '../../convex/_generated/dataModel'

interface AddPlaylistPageProps {
  userId: Id<"users">
}

export const AddPlaylistPage = ({ userId }: AddPlaylistPageProps) => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSuccess = () => {
    // 成功時にプレイリストページに遷移
    navigate('/playlists')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    // 3秒後にエラーメッセージをクリア
    setTimeout(() => setError(null), 3000)
  }

  return (
    <div className="add-playlist-page">
      {error && (
        <div className="notification error">
          {error}
        </div>
      )}
      <PlaylistForm 
        userId={userId} 
        onError={handleError}
        onSuccess={handleSuccess}
      />
    </div>
  )
}