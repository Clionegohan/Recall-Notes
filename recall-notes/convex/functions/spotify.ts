import { action } from "../_generated/server";
import { v } from "convex/values";
import { getSpotifyAccessToken, calculateJapanesePreferenceScore } from "../lib/spotify";
import type { SpotifyTrack, SpotifyArtist } from "../types/spotify";

/**
 * 楽曲検索（Convex Action）
 */
export const searchTracks = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (_ctx, args) => {
    const { query, limit = 10 } = args;
    
    console.log("Convex: searchTracks called with", { query, limit });

    if (!query.trim()) {
      console.log("Convex: Empty query, returning empty array");
      return [];
    }

    try {
      console.log("Convex: Getting Spotify access token...");
      const accessToken = await getSpotifyAccessToken();
      console.log("Convex: Got access token, making API call...");
      
      const searchParams = new URLSearchParams({
        q: query,
        type: "track",
        limit: limit.toString(),
        market: "US"
      });

      const response = await fetch(
        `https://api.spotify.com/v1/search?${searchParams}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // フロントエンド用の形式に変換（日本語優先ソート付き）
      const tracks = data.tracks.items
        .map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists.map((artist: any) => artist.name).join(", "),
          albumArt: track.album.images[0]?.url,
          albumName: track.album.name,
          albumId: track.album.id,
          artistId: track.artists[0]?.id,
          popularity: track.popularity
        }))
        .sort((a: any, b: any) => {
          const scoreA = calculateJapanesePreferenceScore(a);
          const scoreB = calculateJapanesePreferenceScore(b);
          return scoreB - scoreA;
        });

      return tracks;
    } catch (error) {
      console.error("Spotify search error:", error);
      throw new Error("楽曲の検索に失敗しました");
    }
  }
});

/**
 * アーティスト検索（Convex Action）
 */
export const searchArtists = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (_ctx, args) => {
    const { query, limit = 10 } = args;

    if (!query.trim()) {
      return [];
    }

    try {
      const accessToken = await getSpotifyAccessToken();
      
      const searchParams = new URLSearchParams({
        q: query,
        type: "artist",
        limit: limit.toString(),
        market: "US"
      });

      const response = await fetch(
        `https://api.spotify.com/v1/search?${searchParams}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify artist search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // フロントエンド用の形式に変換
      const artists = data.artists.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        type: "artist" as const,
        uri: artist.uri,
        href: artist.href,
        images: artist.images || [],
        followers: artist.followers?.total || 0,
        genres: artist.genres || []
      }));

      return artists;
    } catch (error) {
      console.error("Spotify artist search error:", error);
      throw new Error("アーティストの検索に失敗しました");
    }
  }
});