/**
 * Spotify API関連の型定義
 */

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  albumName: string;
  albumId: string;
  artistId: string;
  popularity?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  image?: string;
  genres?: string[];
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  image?: string;
  releaseDate?: string;
}

export interface SpotifySearchResponse {
  tracks?: {
    items: any[];
  };
  artists?: {
    items: any[];
  };
  albums?: {
    items: any[];
  };
}