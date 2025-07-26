import type { SpotifySearchResponse, TrackSuggestion, SpotifyArtist } from '../types/spotify'

// 除外したいキーワード（カラオケ、ライブ、リミックスなど）
const EXCLUDED_KEYWORDS = [
  // カラオケ関連
  'カラオケ', 'karaoke', 'オフボーカル', 'off vocal', 'instrumental', 'backing track'
  , '歌ってみよう', 'sing along',
  
  // ライブ・コンサート関連  
  'live', 'ライブ', 'concert', 'コンサート', 'tour', 'ツアー',
  'live version', 'live at', 'ライブバージョン',
  
  // リミックス・アレンジ関連
  'remix', 'リミックス', 'edit', 'extended', 'radio edit',
  'acoustic', 'アコースティック', 'unplugged', 'アンプラグド',
  
  // その他の派生版
  'cover', 'カバー', 'tribute', 'トリビュート',
  'demo', 'デモ', 'rough', 'ラフ', '.Ver', '.ver'
]

/**
 * 楽曲名にカラオケやライブなどの除外キーワードが含まれているかチェック
 */
const shouldExcludeTrack = (trackName: string, artistName: string): boolean => {
  const combinedText = `${trackName} ${artistName}`.toLowerCase()
  
  return EXCLUDED_KEYWORDS.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  )
}

// Spotify API Base URL
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// 環境変数（後で設定）
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''

/**
 * Spotify Client Credentials トークン取得
 * バックエンドなしでの基本的な検索機能用
 */
class SpotifyTokenManager {
  private static token: string | null = null
  private static tokenExpiry: number = 0

  static async getAccessToken(): Promise<string> {
    // トークンが有効な場合は再利用
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error('Failed to get Spotify access token')
      }

      const data = await response.json()
      const accessToken = data.access_token
      if (!accessToken) {
        throw new Error('No access token received from Spotify')
      }
      
      this.token = accessToken
      // 有効期限を少し早めに設定（安全マージン）
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

      return accessToken
    } catch (error) {
      console.error('Spotify token error:', error)
      throw error
    }
  }
}

/**
 * Spotify楽曲検索サービス
 */
export class SpotifySearchService {
  /**
   * 楽曲検索（リアルタイム検索用）
   * 
   * @param query - 検索クエリ
   * @param limit - 結果の上限数（デフォルト: 10）
   * @param market - 市場（デフォルト: JP）
   * @returns 楽曲検索結果
   */
  static async searchTracks(
    query: string, 
    limit: number = 10
  ): Promise<TrackSuggestion[]> {
    if (!query.trim()) {
      return []
    }

    try {
      const token = await SpotifyTokenManager.getAccessToken()
      
      const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString(),
        market: 'US' // プレビューが多く提供されるUSマーケットを試用
      })

      const response = await fetch(
        `${SPOTIFY_API_BASE}/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`)
      }

      const data: SpotifySearchResponse = await response.json()
      
      
      // UI用の簡略化されたデータに変換とフィルタリング
      const allTracks = data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        albumArt: track.album.images[0]?.url,
        albumName: track.album.name,
        albumId: track.album.id,
        artistId: track.artists[0]?.id // 主アーティストのIDを使用
      }))
      
      // カラオケ・ライブ・リミックスなどを除外
      const filteredTracks = allTracks.filter(track => {
        const shouldExclude = shouldExcludeTrack(track.name, track.artist)
        
        
        return !shouldExclude
      })
      
      
      return filteredTracks

    } catch (error) {
      console.error('Spotify search error:', error)
      throw error
    }
  }

}

/**
 * アーティストの楽曲一覧を取得（人気順、内部ソートのみ）
 */
export const getArtistTracks = async (artistId: string, offset: number = 0, limit: number = 20) => {
  try {
    const token = await SpotifyTokenManager.getAccessToken()
    
    // アーティストの人気楽曲を取得（最も効率的）
    const topTracksResponse = await fetch(
      `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!topTracksResponse.ok) {
      throw new Error(`Spotify API error: ${topTracksResponse.status}`)
    }

    const topTracksData = await topTracksResponse.json()
    
    // シンプルな変換とフィルタリング
    const tracks: TrackSuggestion[] = topTracksData.tracks
      .filter((track: any) => !shouldExcludeTrack(track.name, track.artists.map((a: any) => a.name).join(', ')))
      .map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist: SpotifyArtist) => artist.name).join(', '),
        albumArt: track.album.images[0]?.url,
        albumName: track.album.name,
        albumId: track.album.id,
        artistId: track.artists[0]?.id,
        popularity: track.popularity || 0 // 内部ソート用のみ
      }))

    // 人気度で既にソート済み（Spotify APIが返す順序）
    
    // ページネーション適用
    const paginatedTracks = tracks.slice(offset, offset + limit)
    
    return {
      tracks: paginatedTracks,
      total: tracks.length,
      hasMore: offset + limit < tracks.length
    }

  } catch (error) {
    console.error('Artist tracks fetch error:', error)
    throw error
  }
}

/**
 * アルバムの楽曲一覧を取得
 */
export const getAlbumTracks = async (albumId: string) => {
  try {
    const token = await SpotifyTokenManager.getAccessToken()
    
    const response = await fetch(
      `${SPOTIFY_API_BASE}/albums/${albumId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const data = await response.json()
    
    // アルバム情報も取得
    const albumResponse = await fetch(
      `${SPOTIFY_API_BASE}/albums/${albumId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const albumData = await albumResponse.json()
    
    // フィルタリングして返す
    const allTracks = data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist: SpotifyArtist) => artist.name).join(', '),
      albumArt: albumData.images[0]?.url,
      albumName: albumData.name,
      albumId: albumData.id,
      artistId: track.artists[0]?.id
    }))

    const filteredTracks = allTracks.filter((track: TrackSuggestion) => 
      !shouldExcludeTrack(track.name, track.artist)
    )

    
    return { tracks: filteredTracks, album: albumData }

  } catch (error) {
    console.error('Album tracks fetch error:', error)
    throw error
  }
}

// シンプルな検索関数（外部から使いやすく）
export const searchSpotifyTracks = (query: string, limit?: number) => {
  return SpotifySearchService.searchTracks(query, limit)
}
