import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { searchSpotifyTracks } from '../services/spotify'
import { searchMockSpotifyTracks, hasSpotifyCredentials } from '../services/mockSpotify'
import type { TrackSuggestion, SearchState } from '../types/spotify'

/**
 * Spotify楽曲検索のカスタムフック
 * デバウンス機能とキャッシュ機能を内蔵
 */
export const useSpotifySearch = (
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
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    suggestions: [],
    isLoading: false,
    error: null
  })

  // 簡単なキャッシュ実装
  const [cache] = useState(() => new Map<string, TrackSuggestion[]>())

  // デバウンスされたクエリ
  const debouncedQuery = useDebounce(query.trim(), debounceMs)

  // 検索実行関数
  const executeSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setSearchState(prev => ({
        ...prev,
        suggestions: [],
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
        suggestions: cachedResults,
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
      // 環境変数が設定されていない場合はモックデータを使用
      const results = hasSpotifyCredentials 
        ? await searchSpotifyTracks(searchQuery, limit)
        : await searchMockSpotifyTracks(searchQuery, limit)
      
      // キャッシュに保存
      if (enableCache) {
        cache.set(searchQuery, results)
      }

      setSearchState(prev => ({
        ...prev,
        suggestions: results,
        isLoading: false,
        error: null
      }))

    } catch (error) {
      console.error('Search error:', error)
      setSearchState(prev => ({
        ...prev,
        suggestions: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '検索エラーが発生しました'
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
    suggestions: searchState.suggestions,
    isLoading: searchState.isLoading,
    error: searchState.error
  }
}

/**
 * より簡単な検索フック（基本機能のみ）
 */
export const useSimpleSpotifySearch = (query: string) => {
  return useSpotifySearch(query, {
    debounceMs: 300,
    limit: 8,
    minQueryLength: 2
  })
}