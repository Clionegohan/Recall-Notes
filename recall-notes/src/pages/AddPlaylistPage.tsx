import { useState } from 'react'
import { PlaylistForm } from '../components/PlaylistForm'
import type { Id } from '../../convex/_generated/dataModel'

interface AddPlaylistPageProps {
  userId: Id<"users">
}

export const AddPlaylistPage = ({ userId }: AddPlaylistPageProps) => {
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = () => {
    // 成功メッセージを表示するのみ（リダイレクトなし）
    // PlaylistFormで成功時の処理は完結
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