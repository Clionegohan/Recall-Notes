import { useState, useEffect, useCallback } from 'react'
import { useAction } from 'convex/react'
import { useDebounce } from './useDebounce'
import { searchMockSpotifyArtists } from '../services/mockSpotify'
import { api } from '../../convex/_generated/api'
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

  // Convex action for Spotify artist search
  const searchArtists = useAction(api["functions/spotify"].searchArtists)

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
      console.log('Starting Spotify artist search for:', searchQuery)
      // Convex action経由でSpotify APIを呼び出し
      const results = await searchArtists({ query: searchQuery, limit }) as SpotifyArtist[]
      console.log('Spotify artist search results:', results.length, 'artists')
      
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
      console.error('Spotify artist search error:', error)
      // エラー時はモックデータにフォールバック
      console.log('Falling back to mock data')
      try {
        const mockResults = await searchMockSpotifyArtists(searchQuery, limit)
        console.log('Mock artist search results:', mockResults.length, 'artists')
        
        if (enableCache) {
          cache.set(searchQuery, mockResults)
        }

        setSearchState(prev => ({
          ...prev,
          artists: mockResults,
          isLoading: false,
          error: null
        }))
      } catch (mockError) {
        console.error('Mock artist search also failed:', mockError)
        setSearchState(prev => ({
          ...prev,
          artists: [],
          isLoading: false,
          error: 'アーティスト検索エラーが発生しました'
        }))
      }
    }
  }, [cache, enableCache, limit, minQueryLength, searchArtists])

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