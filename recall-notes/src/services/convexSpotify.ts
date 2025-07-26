import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { TrackSuggestion, SpotifyArtist } from '../types/spotify'
import { MockSpotifySearchService } from './mockSpotify'

// 既存のConvexクライアントを使用
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

/**
 * Convex経由でSpotify APIを呼び出すサービス
 */
export class ConvexSpotifyService {
  /**
   * 楽曲検索（Convex経由）
   */
  static async searchTracks(
    query: string, 
    limit: number = 10
  ): Promise<TrackSuggestion[]> {
    if (!query.trim()) {
      return []
    }

    try {
      console.log('Calling Convex Spotify search for tracks:', query, 'limit:', limit)
      console.log('Convex URL:', import.meta.env.VITE_CONVEX_URL)
      
      const tracks = await convex.action(api.functions.spotify.searchTracks, {
        query,
        limit
      })
      
      console.log('Received tracks from Convex:', tracks.length, 'results')
      return tracks as TrackSuggestion[]
    } catch (error) {
      console.error('Convex Spotify search error:', error)
      // エラー時はモックデータにフォールバック
      console.log('Falling back to mock data')
      return await MockSpotifySearchService.searchTracks(query, limit)
    }
  }

  /**
   * アーティスト検索（Convex経由）
   */
  static async searchArtists(
    query: string, 
    limit: number = 10
  ): Promise<SpotifyArtist[]> {
    if (!query.trim()) {
      return []
    }

    try {
      console.log('Calling Convex Spotify search for artists:', query, 'limit:', limit)
      console.log('Convex URL:', import.meta.env.VITE_CONVEX_URL)
      
      const artists = await convex.action(api.functions.spotify.searchArtists, {
        query,
        limit
      })
      
      console.log('Received artists from Convex:', artists.length, 'results')
      return artists as SpotifyArtist[]
    } catch (error) {
      console.error('Convex Spotify artist search error:', error)
      // エラー時はモックデータにフォールバック
      console.log('Falling back to mock data')
      return await MockSpotifySearchService.searchArtists(query, limit)
    }
  }
}

// 楽曲検索の便利な関数
export const searchSpotifyTracks = (query: string, limit?: number) => {
  return ConvexSpotifyService.searchTracks(query, limit)
}

// アーティスト検索の便利な関数
export const searchSpotifyArtists = (query: string, limit?: number) => {
  return ConvexSpotifyService.searchArtists(query, limit)
}