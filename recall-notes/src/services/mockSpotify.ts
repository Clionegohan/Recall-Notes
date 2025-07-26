import type { TrackSuggestion } from '../types/spotify'

// 除外キーワード（Spotify serviceと同じ）
const EXCLUDED_KEYWORDS = [
  'カラオケ', 'karaoke', 'オフボーカル', 'off vocal', 'instrumental', 'backing track',
  '歌ってみた', '歌ってみよう', 'sing along',
  'live', 'ライブ', 'concert', 'コンサート', 'tour', 'ツアー',
  'live version', 'live at', 'ライブバージョン',
  'remix', 'リミックス', 'edit', 'extended', 'radio edit',
  'acoustic', 'アコースティック', 'unplugged', 'アンプラグド',
  'cover', 'カバー', 'tribute', 'トリビュート',
  'demo', 'デモ', 'rough', 'ラフ'
]

const shouldExcludeTrack = (trackName: string, artistName: string): boolean => {
  const combinedText = `${trackName} ${artistName}`.toLowerCase()
  return EXCLUDED_KEYWORDS.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  )
}

// モック楽曲データ（日本の人気楽曲）
const MOCK_TRACKS: TrackSuggestion[] = [
  {
    id: 'mock-1',
    name: 'Lemon',
    artist: '米津玄師',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c5716278abba6a103ad24d8d'
  },
  {
    id: 'mock-2', 
    name: 'レモン',
    artist: '米津玄師',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c5716278abba6a103ad24d8d'
  },
  {
    id: 'mock-3',
    name: 'Pretender',
    artist: 'Official髭男dism',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f785ad745d162d8dd63e5c3c',
  },
  {
    id: 'mock-4',
    name: 'マリーゴールド',
    artist: 'あいみょん',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e5e2b6ac47e5b6b1a8c1f1a4',
  },
  {
    id: 'mock-5',
    name: 'White Love',
    artist: 'SPEED',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f8f9b9b9b9b9b9b9b9b9b9b9',
  },
  {
    id: 'mock-6',
    name: '紅蓮華',
    artist: 'LiSA',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e0e2b6ac47e5b6b1a8c1f1a5',
  },
  {
    id: 'mock-7',
    name: 'Dynamite',
    artist: 'BTS',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f6b9b9b9b9b9b9b9b9b9b9b9',
  },
  {
    id: 'mock-8',
    name: 'レイニーブルー',
    artist: '徳永英明',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273a1a1a1a1a1a1a1a1a1a1a1a1',
  },
  {
    id: 'mock-9',
    name: 'ランドマーク',
    artist: 'PEOPLE 1',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273b2b2b2b2b2b2b2b2b2b2b2b2',
  },
  {
    id: 'mock-10',
    name: 'ドライフラワー',
    artist: '優里',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c3c3c3c3c3c3c3c3c3c3c3c3',
  },
  // フィルタリングテスト用（これらは除外される）
  {
    id: 'mock-exclude-1',
    name: 'Lemon (カラオケ)',
    artist: '米津玄師',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c5716278abba6a103ad24d8d',
  },
  {
    id: 'mock-exclude-2',
    name: 'Pretender (Live at 東京ドーム)',
    artist: 'Official髭男dism',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f785ad745d162d8dd63e5c3c',
  },
  {
    id: 'mock-exclude-3',
    name: 'マリーゴールド (歌ってみた)',
    artist: 'あいみょん',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e5e2b6ac47e5b6b1a8c1f1a4',
  }
]

/**
 * モックSpotify検索サービス
 * 実際のAPIの動作をシミュレーション
 */
export class MockSpotifySearchService {
  /**
   * 楽曲検索（モック版）
   * 実際のAPIレスポンス時間をシミュレーション（200-500ms）
   */
  static async searchTracks(
    query: string, 
    limit: number = 10
  ): Promise<TrackSuggestion[]> {
    if (!query.trim()) {
      return []
    }

    // 実際のAPI呼び出し時間をシミュレーション
    const delay = Math.random() * 300 + 200 // 200-500ms
    await new Promise(resolve => setTimeout(resolve, delay))

    // クエリに基づく検索ロジック
    const lowerQuery = query.toLowerCase()
    const results = MOCK_TRACKS.filter(track => {
      const trackName = track.name.toLowerCase()
      const artistName = track.artist.toLowerCase()
      
      // 部分一致検索（楽曲名とアーティスト名両方）
      return trackName.includes(lowerQuery) || 
             artistName.includes(lowerQuery) ||
             // ひらがな→カタカナ→英語の変換例
             (lowerQuery === 'れも' && trackName.includes('lemon')) ||
             (lowerQuery === 'レモ' && trackName.includes('lemon')) ||
             (lowerQuery === 'lemo' && trackName.includes('lemon'))
    })

    // カラオケ・ライブ・リミックスなどを除外
    const filteredResults = results.filter(track => {
      const shouldExclude = shouldExcludeTrack(track.name, track.artist)
      
      
      return !shouldExclude
    })

    // 関連度順にソート（完全一致→前方一致→部分一致）
    filteredResults.sort((a, b) => {
      const aTrackExact = a.name.toLowerCase() === lowerQuery
      const bTrackExact = b.name.toLowerCase() === lowerQuery
      
      if (aTrackExact && !bTrackExact) return -1
      if (!aTrackExact && bTrackExact) return 1
      
      const aTrackStarts = a.name.toLowerCase().startsWith(lowerQuery)
      const bTrackStarts = b.name.toLowerCase().startsWith(lowerQuery)
      
      if (aTrackStarts && !bTrackStarts) return -1
      if (!aTrackStarts && bTrackStarts) return 1
      
      return 0
    })


    return filteredResults.slice(0, limit)
  }

}

// シンプルな検索関数（モック版）
export const searchMockSpotifyTracks = (query: string, limit?: number) => {
  return MockSpotifySearchService.searchTracks(query, limit)
}

// 開発環境判定
export const hasSpotifyCredentials = !!(
  import.meta.env.VITE_SPOTIFY_CLIENT_ID && 
  import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
)