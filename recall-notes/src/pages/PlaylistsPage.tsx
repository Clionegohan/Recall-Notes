import { PlaylistList } from '../components/PlaylistList'
import type { Id } from '../../convex/_generated/dataModel'

interface PlaylistsPageProps {
  userId: Id<"users">
}

export const PlaylistsPage = ({ userId }: PlaylistsPageProps) => {
  return (
    <div className="playlists-page">
      <PlaylistList userId={userId} />
    </div>
  )
}