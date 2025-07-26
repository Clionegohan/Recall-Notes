import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { searchSpotifyArtists } from '../services/spotify'
import { hasSpotifyCredentials } from '../services/mockSpotify'
import type { SpotifyArtist } from '../types/spotify'

interface ArtistSearchState {
  query: string
  artists: SpotifyArtist[]
  isLoading: boolean
  error: string | null
}

/**
 * Spotifyアーティスト検索のカスタムフック
 */
export const useSpotifyArtistSearch = (
  query: string,
  options: {
    debounceMs?: number
    limit?: number
    minQueryLength?: number
    enableCache?: boolean
  } = {}
) => {
  const {
    debounceMs = 300,
    limit = 10,
    minQueryLength = 2,
    enableCache = true
  } = options

  // 状態管理
  const [searchState, setSearchState] = useState<ArtistSearchState>({
    query: '',
    artists: [],
    isLoading: false,
    error: null
  })

  // 簡単なキャッシュ実装
  const [cache] = useState(() => new Map<string, SpotifyArtist[]>())

  // デバウンスされたクエリ
  const debouncedQuery = useDebounce(query.trim(), debounceMs)

  // 検索実行関数
  const executeSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setSearchState(prev => ({
        ...prev,
        artists: [],
        isLoading: false,
        error: null
      }))
      return
    }

    // キャッシュチェック
    if (enableCache && cache.has(searchQuery)) {
      const cachedResults = cache.get(searchQuery)!
      setSearchState(prev => ({
        ...prev,
        artists: cachedResults,
        isLoading: false,
        error: null
      }))
      return
    }

    // ローディング開始
    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      // 環境変数が設定されていない場合はモックデータを使用（今回はアーティストのみ）
      const results = hasSpotifyCredentials 
        ? await searchSpotifyArtists(searchQuery, limit)
        : [] // モックアーティストデータは別途実装が必要
      
      // キャッシュに保存
      if (enableCache) {
        cache.set(searchQuery, results)
      }

      setSearchState(prev => ({
        ...prev,
        artists: results,
        isLoading: false,
        error: null
      }))

    } catch (error) {
      console.error('Artist search error:', error)
      setSearchState(prev => ({
        ...prev,
        artists: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'アーティスト検索エラーが発生しました'
      }))
    }
  }, [cache, enableCache, limit, minQueryLength])

  // デバウンスされたクエリに基づいて検索実行
  useEffect(() => {
    if (debouncedQuery !== searchState.query) {
      setSearchState(prev => ({ ...prev, query: debouncedQuery }))
      executeSearch(debouncedQuery)
    }
  }, [debouncedQuery, executeSearch, searchState.query])

  return {
    // 検索結果と状態
    artists: searchState.artists,
    isLoading: searchState.isLoading,
    error: searchState.error
  }
}