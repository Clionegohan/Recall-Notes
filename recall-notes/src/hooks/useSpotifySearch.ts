import { useState, useEffect, useCallback } from 'react'
import { useAction } from 'convex/react'
import { useDebounce } from './useDebounce'
import { searchMockSpotifyTracks } from '../services/mockSpotify'
import { api } from '../../convex/_generated/api'
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

  // Convex action for Spotify search
  const searchTracks = useAction(api.spotify.searchTracks)

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
      console.log('Starting Spotify search for:', searchQuery)
      // Convex action経由でSpotify APIを呼び出し
      const results = await searchTracks({ query: searchQuery, limit }) as TrackSuggestion[]
      console.log('Spotify search results:', results.length, 'tracks')
      
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
      console.error('Spotify search error:', error)
      // エラー時はモックデータにフォールバック
      console.log('Falling back to mock data')
      try {
        const mockResults = await searchMockSpotifyTracks(searchQuery, limit)
        console.log('Mock search results:', mockResults.length, 'tracks')
        
        if (enableCache) {
          cache.set(searchQuery, mockResults)
        }

        setSearchState(prev => ({
          ...prev,
          suggestions: mockResults,
          isLoading: false,
          error: null
        }))
      } catch (mockError) {
        console.error('Mock search also failed:', mockError)
        setSearchState(prev => ({
          ...prev,
          suggestions: [],
          isLoading: false,
          error: '検索エラーが発生しました'
        }))
      }
    }
  }, [cache, enableCache, limit, minQueryLength, searchTracks])

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