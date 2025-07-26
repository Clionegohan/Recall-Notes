import type { TrackSuggestion, SpotifyArtist } from '../types/spotify'

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

    // 関連度順にソート（完全一致→前方一致→部分一致、日本コンテンツ優先）
    filteredResults.sort((a, b) => {
      // 基本的な一致度スコア
      const getMatchScore = (track: TrackSuggestion, query: string) => {
        const trackName = track.name.toLowerCase()
        const artistName = track.artist.toLowerCase()
        const queryLower = query.toLowerCase()
        
        let score = 0
        if (trackName === queryLower) score += 1000
        else if (trackName.startsWith(queryLower)) score += 500
        else if (trackName.includes(queryLower)) score += 200
        
        if (artistName === queryLower) score += 800
        else if (artistName.startsWith(queryLower)) score += 400
        else if (artistName.includes(queryLower)) score += 100
        
        // モックデータは全て日本コンテンツなので一律ボーナス
        score += 300
        
        return score
      }
      
      const scoreA = getMatchScore(a, lowerQuery)
      const scoreB = getMatchScore(b, lowerQuery)
      
      return scoreB - scoreA
    })


    return filteredResults.slice(0, limit)
  }

  /**
   * アーティスト検索（モック版）
   */
  static async searchArtists(
    query: string,
    limit: number = 10
  ): Promise<SpotifyArtist[]> {
    if (!query.trim()) {
      return []
    }

    // 実際のAPI呼び出し時間をシミュレーション
    const delay = Math.random() * 300 + 200
    await new Promise(resolve => setTimeout(resolve, delay))

    // モックアーティストデータ
    const mockArtists: SpotifyArtist[] = [
      {
        id: 'artist-1',
        name: '米津玄師',
        type: 'artist',
        uri: 'spotify:artist:mock1',
        href: 'https://api.spotify.com/v1/artists/mock1',
        images: [{ url: 'https://i.scdn.co/image/artist1.jpg', height: 640, width: 640 }],
        followers: 5000000,
        genres: ['j-pop']
      },
      {
        id: 'artist-2', 
        name: 'Official髭男dism',
        type: 'artist',
        uri: 'spotify:artist:mock2',
        href: 'https://api.spotify.com/v1/artists/mock2',
        images: [{ url: 'https://i.scdn.co/image/artist2.jpg', height: 640, width: 640 }],
        followers: 3000000,
        genres: ['j-pop', 'rock']
      },
      {
        id: 'artist-3',
        name: 'あいみょん',
        type: 'artist',
        uri: 'spotify:artist:mock3', 
        href: 'https://api.spotify.com/v1/artists/mock3',
        images: [{ url: 'https://i.scdn.co/image/artist3.jpg', height: 640, width: 640 }],
        followers: 2500000,
        genres: ['j-pop', 'folk']
      }
    ]

    const lowerQuery = query.toLowerCase()
    return mockArtists.filter(artist => 
      artist.name.toLowerCase().includes(lowerQuery)
    ).slice(0, limit)
  }

  /**
   * アーティストの楽曲一覧取得（モック版）
   */
  static async getArtistTracks(
    _artistId: string,
    offset: number = 0,
    limit: number = 20
  ) {
    // 実際のAPI呼び出し時間をシミュレーション
    const delay = Math.random() * 500 + 300
    await new Promise(resolve => setTimeout(resolve, delay))

    // アーティストIDに基づいて楽曲をフィルタリング
    const artistTracks = MOCK_TRACKS.filter(track => 
      track.artist === '米津玄師' || track.artist === 'Official髭男dism' || track.artist === 'あいみょん'
    )

    const paginatedTracks = artistTracks.slice(offset, offset + limit)
    
    return {
      tracks: paginatedTracks,
      total: artistTracks.length,
      hasMore: offset + limit < artistTracks.length
    }
  }

  /**
   * アルバムの楽曲一覧取得（モック版）
   */
  static async getAlbumTracks(albumId: string) {
    // 実際のAPI呼び出し時間をシミュレーション
    const delay = Math.random() * 400 + 200
    await new Promise(resolve => setTimeout(resolve, delay))

    // アルバムの楽曲（サンプル）
    const albumTracks = MOCK_TRACKS.slice(0, 5)
    
    // モックアルバム情報
    const album = {
      id: albumId,
      name: 'Sample Album',
      artists: [{ name: '米津玄師', id: 'artist-1' }],
      images: [{ url: 'https://i.scdn.co/image/album.jpg' }],
      release_date: '2023-01-01',
      total_tracks: albumTracks.length
    }

    return { tracks: albumTracks, album }
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