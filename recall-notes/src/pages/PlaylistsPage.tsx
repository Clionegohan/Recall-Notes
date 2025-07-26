import { useState } from 'react'
import { PlaylistList } from '../components/PlaylistList'
import type { Id } from '../../convex/_generated/dataModel'

interface PlaylistsPageProps {
  userId: Id<"users">
}

export const PlaylistsPage = ({ userId }: PlaylistsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'artist'>('recent')

  return (
    <div className="playlists-page">
      <div className="section">
        <h2>プレイリスト</h2>
        
        <div className="playlist-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="楽曲名またはアーティスト名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-container">
            <label htmlFor="sort-select">並び順:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'artist')}
              className="sort-select"
            >
              <option value="recent">追加順（新しい順）</option>
              <option value="title">楽曲名順</option>
              <option value="artist">アーティスト名順</option>
            </select>
          </div>
        </div>
        
        <PlaylistList 
          userId={userId} 
          searchQuery={searchQuery}
          sortBy={sortBy}
        />
      </div>
    </div>
  )
}