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
          const trackA = { name: a.name, artists: [{ name: a.artist }], album: { name: a.albumName }, popularity: a.popularity };
          const trackB = { name: b.name, artists: [{ name: b.artist }], album: { name: b.albumName }, popularity: b.popularity };
          const scoreA = calculateJapanesePreferenceScore(trackA);
          const scoreB = calculateJapanesePreferenceScore(trackB);
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

/**
 * アーティスト詳細取得（Convex Action）
 */
export const getArtistDetails = action({
  args: {
    artistId: v.string()
  },
  handler: async (_ctx, args) => {
    const { artistId } = args;
    
    console.log("Convex: getArtistDetails called with", { artistId });

    if (!artistId.trim()) {
      throw new Error("アーティストIDが指定されていません");
    }

    try {
      console.log("Convex: Getting Spotify access token...");
      const accessToken = await getSpotifyAccessToken();
      console.log("Convex: Got access token, making API call...");
      
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify artist details failed: ${response.status}`);
      }

      const artist = await response.json();
      
      // フロントエンド用の形式に変換
      const artistDetails = {
        id: artist.id,
        name: artist.name,
        type: "artist" as const,
        uri: artist.uri,
        href: artist.href,
        images: artist.images || [],
        followers: artist.followers?.total || 0,
        genres: artist.genres || [],
        popularity: artist.popularity || 0
      };

      return artistDetails;
    } catch (error) {
      console.error("Spotify artist details error:", error);
      throw new Error("アーティスト詳細の取得に失敗しました");
    }
  }
});

/**
 * アーティスト楽曲取得（Convex Action）
 */
export const getArtistTracks = action({
  args: {
    artistId: v.string(),
    offset: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (_ctx, args) => {
    const { artistId, offset = 0, limit = 20 } = args;
    
    console.log("Convex: getArtistTracks called with", { artistId, offset, limit });

    if (!artistId.trim()) {
      throw new Error("アーティストIDが指定されていません");
    }

    try {
      console.log("Convex: Getting Spotify access token...");
      const accessToken = await getSpotifyAccessToken();
      
      // トップトラックを取得
      const topTracksResponse = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=JP`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!topTracksResponse.ok) {
        throw new Error(`Spotify top tracks failed: ${topTracksResponse.status}`);
      }

      const topTracksData = await topTracksResponse.json();
      
      // アルバムも取得してより多くの楽曲を収集
      const albumsResponse = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=JP&limit=50`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      let allTracks = [...topTracksData.tracks];

      if (albumsResponse.ok) {
        const albumsData = await albumsResponse.json();
        
        // 各アルバムから楽曲を取得（最初の3アルバムのみ）
        for (const album of albumsData.items.slice(0, 3)) {
          const albumTracksResponse = await fetch(
            `https://api.spotify.com/v1/albums/${album.id}/tracks?market=JP`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (albumTracksResponse.ok) {
            const albumTracksData = await albumTracksResponse.json();
            // アルバム情報を追加してトラックリストに含める
            const albumTracks = albumTracksData.items.map((track: any) => ({
              ...track,
              album: album,
              popularity: album.popularity || 50 // アルバムの人気度を楽曲に適用
            }));
            allTracks.push(...albumTracks);
          }
        }
      }

      // 重複除去（楽曲IDベース）
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id)
      );

      // 日本語優先ソート適用
      const sortedTracks = uniqueTracks
        .map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists?.map((artist: any) => artist.name).join(", ") || "Unknown Artist",
          albumArt: track.album?.images?.[0]?.url,
          albumName: track.album?.name || "Unknown Album",
          albumId: track.album?.id,
          artistId: track.artists?.[0]?.id || artistId,
          popularity: track.popularity || 0,
          previewUrl: track.preview_url
        }))
        .sort((a: any, b: any) => {
          const trackA = { name: a.name, artists: [{ name: a.artist }], album: { name: a.albumName }, popularity: a.popularity };
          const trackB = { name: b.name, artists: [{ name: b.artist }], album: { name: b.albumName }, popularity: b.popularity };
          const scoreA = calculateJapanesePreferenceScore(trackA);
          const scoreB = calculateJapanesePreferenceScore(trackB);
          return scoreB - scoreA;
        });

      // ページネーション適用
      const paginatedTracks = sortedTracks.slice(offset, offset + limit);

      return {
        tracks: paginatedTracks,
        total: sortedTracks.length,
        hasMore: offset + limit < sortedTracks.length
      };
    } catch (error) {
      console.error("Spotify artist tracks error:", error);
      throw new Error("アーティスト楽曲の取得に失敗しました");
    }
  }
});

/**
 * アルバム詳細取得（Convex Action）
 */
export const getAlbumDetails = action({
  args: {
    albumId: v.string()
  },
  handler: async (_ctx, args) => {
    const { albumId } = args;
    
    console.log("Convex: getAlbumDetails called with", { albumId });

    if (!albumId.trim()) {
      throw new Error("アルバムIDが指定されていません");
    }

    try {
      console.log("Convex: Getting Spotify access token...");
      const accessToken = await getSpotifyAccessToken();
      console.log("Convex: Got access token, making API call...");
      
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}?market=JP`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify album details failed: ${response.status}`);
      }

      const album = await response.json();
      
      // フロントエンド用の形式に変換
      const albumDetails = {
        id: album.id,
        name: album.name,
        type: "album" as const,
        uri: album.uri,
        href: album.href,
        images: album.images || [],
        artists: album.artists || [],
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        genres: album.genres || [],
        popularity: album.popularity || 0,
        albumType: album.album_type,
        label: album.label
      };

      return albumDetails;
    } catch (error) {
      console.error("Spotify album details error:", error);
      throw new Error("アルバム詳細の取得に失敗しました");
    }
  }
});

/**
 * アルバム楽曲取得（Convex Action）
 */
export const getAlbumTracks = action({
  args: {
    albumId: v.string(),
    offset: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (_ctx, args) => {
    const { albumId, offset = 0, limit = 50 } = args;
    
    console.log("Convex: getAlbumTracks called with", { albumId, offset, limit });

    if (!albumId.trim()) {
      throw new Error("アルバムIDが指定されていません");
    }

    try {
      console.log("Convex: Getting Spotify access token...");
      const accessToken = await getSpotifyAccessToken();
      
      // アルバム詳細も取得してアルバム情報を含める
      const [albumResponse, tracksResponse] = await Promise.all([
        fetch(`https://api.spotify.com/v1/albums/${albumId}?market=JP`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }),
        fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?market=JP&offset=${offset}&limit=${limit}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        })
      ]);

      if (!albumResponse.ok || !tracksResponse.ok) {
        throw new Error(`Spotify album tracks failed: ${albumResponse.status || tracksResponse.status}`);
      }

      const albumData = await albumResponse.json();
      const tracksData = await tracksResponse.json();
      
      // フロントエンド用の形式に変換
      const tracks = tracksData.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists?.map((artist: any) => artist.name).join(", ") || "Unknown Artist",
        albumArt: albumData.images?.[0]?.url,
        albumName: albumData.name,
        albumId: albumData.id,
        artistId: track.artists?.[0]?.id,
        trackNumber: track.track_number,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        popularity: albumData.popularity || 50 // アルバムの人気度を楽曲に適用
      }));

      return {
        tracks,
        album: {
          id: albumData.id,
          name: albumData.name,
          artist: albumData.artists?.map((artist: any) => artist.name).join(", "),
          artistId: albumData.artists?.[0]?.id,
          image: albumData.images?.[0]?.url,
          releaseDate: albumData.release_date,
          totalTracks: albumData.total_tracks
        },
        total: tracksData.total,
        hasMore: tracksData.next !== null
      };
    } catch (error) {
      console.error("Spotify album tracks error:", error);
      throw new Error("アルバム楽曲の取得に失敗しました");
    }
  }
});