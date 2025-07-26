import type { TrackSuggestion, SpotifyArtist } from '../types/spotify'
import { MockSpotifySearchService } from './mockSpotify'
import { ConvexSpotifyService } from './convexSpotify'

// 将来のバックエンド実装で使用予定（現在は無効化）
/*
const EXCLUDED_KEYWORDS = [
  'カラオケ', 'karaoke', 'オフボーカル', 'off vocal', 'instrumental', 'backing track',
  '歌ってみよう', 'sing along', 'live', 'ライブ', 'concert', 'コンサート', 'tour', 'ツアー',
  'live version', 'live at', 'ライブバージョン', 'remix', 'リミックス', 'edit', 'extended',
  'radio edit', 'acoustic', 'アコースティック', 'unplugged', 'アンプラグド',
  'cover', 'カバー', 'tribute', 'トリビュート', 'demo', 'デモ', 'rough', 'ラフ', '.Ver', '.ver'
]
*/

/*
const JAPANESE_PATTERNS = [
  /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  /avex|johnny|akb|乃木坂|欅坂|櫻坂|日向坂/i,
  /\s(ft\.|feat\.|featuring)\s.*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/i
]

const isJapaneseContent = (trackName: string, artistName: string): boolean => {
  const combinedText = `${trackName} ${artistName}`
  return JAPANESE_PATTERNS.some(pattern => pattern.test(combinedText))
}

const calculateTrackPriorityScore = (track: any, query: string): number => {
  let score = 0
  const trackName = track.name.toLowerCase()
  const queryLower = query.toLowerCase()
  
  if (trackName === queryLower) score += 1000
  else if (trackName.startsWith(queryLower)) score += 500
  else if (trackName.includes(queryLower)) score += 200
  
  if (isJapaneseContent(track.name, track.artist)) score += 300
  return score
}

const calculateArtistPriorityScore = (artist: any, query: string): number => {
  let score = 0
  const artistName = artist.name.toLowerCase()
  const queryLower = query.toLowerCase()
  
  if (artistName === queryLower) score += 1000
  else if (artistName.startsWith(queryLower)) score += 500
  else if (artistName.includes(queryLower)) score += 200
  
  if (isJapaneseContent('', artist.name)) score += 300
  return score
}
*/

// 注意: セキュリティ上の理由により、実際のSpotify APIの呼び出しは無効化済み
// 全ての機能はモックデータを使用して動作します

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
      // Convex経由で実際のSpotify APIを呼び出し（エラー時はモックにフォールバック）
      return await ConvexSpotifyService.searchTracks(query, limit)
    } catch (error) {
      console.error('Spotify search error:', error)
      throw error
    }
  }

  /**
   * アーティスト検索（アーティスト名のみ）
   * 
   * @param query - 検索クエリ
   * @param limit - 結果の上限数（デフォルト: 10）
   * @returns アーティスト検索結果
   */
  static async searchArtists(
    query: string, 
    limit: number = 10
  ): Promise<SpotifyArtist[]> {
    if (!query.trim()) {
      return []
    }

    try {
      // Convex経由で実際のSpotify APIを呼び出し（エラー時はモックにフォールバック）
      return await ConvexSpotifyService.searchArtists(query, limit)
    } catch (error) {
      console.error('Spotify artist search error:', error)
      throw error
    }
  }

}

/**
 * アーティストの楽曲一覧を取得（アルバム経由で豊富な楽曲を取得）
 */
export const getArtistTracks = async (artistId: string, offset: number = 0, limit: number = 20) => {
  try {
    // 現在はモックデータを使用（今後Convex関数を追加予定）
    console.log('Using mock data for artist tracks - Convex function coming soon')
    return await MockSpotifySearchService.getArtistTracks(artistId, offset, limit)
  } catch (error) {
    console.error('Artist tracks error:', error)
    throw error
  }
}

/**
 * アルバムの楽曲一覧を取得
 */
export const getAlbumTracks = async (albumId: string) => {
  try {
    // 現在はモックデータを使用（今後Convex関数を追加予定）
    console.log('Using mock data for album tracks - Convex function coming soon')
    return await MockSpotifySearchService.getAlbumTracks(albumId)
  } catch (error) {
    console.error('Album tracks error:', error)
    throw error
  }
}

// シンプルな検索関数（外部から使いやすく）
export const searchSpotifyTracks = (query: string, limit?: number) => {
  return SpotifySearchService.searchTracks(query, limit)
}

export const searchSpotifyArtists = (query: string, limit?: number) => {
  return SpotifySearchService.searchArtists(query, limit)
}
