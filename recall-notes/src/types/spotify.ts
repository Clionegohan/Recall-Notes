// Spotify API型定義
export interface SpotifyImage {
  height: number
  url: string
  width: number
}

export interface SpotifyArtist {
  id: string
  name: string
  type: 'artist'
  uri: string
  href: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  release_date: string
  type: 'album'
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  popularity: number
  preview_url: string | null
  uri: string
  href: string
  type: 'track'
}

export interface SpotifySearchResponse {
  tracks: {
    href: string
    items: SpotifyTrack[]
    limit: number
    offset: number
    total: number
    next: string | null
    previous: string | null
  }
}

// UI用の簡略化された楽曲情報
export interface TrackSuggestion {
  id: string
  name: string
  artist: string
  albumArt?: string
  previewUrl?: string
}

// 検索状態管理用
export interface SearchState {
  query: string
  suggestions: TrackSuggestion[]
  isLoading: boolean
  error: string | null
}

// API設定
export interface SpotifyConfig {
  clientId: string
  clientSecret: string
  accessToken?: string
}