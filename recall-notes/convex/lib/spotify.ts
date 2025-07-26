/**
 * Spotify API認証とユーティリティ関数
 */

/**
 * Spotify APIアクセストークンを取得
 */
export async function getSpotifyAccessToken(): Promise<string> {
  // @ts-expect-error process.env is available in Convex
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  // @ts-expect-error process.env is available in Convex  
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 日本語楽曲を優先的にスコア付けする関数
 */
export function calculateJapanesePreferenceScore(track: any): number {
  const trackName = track.name.toLowerCase();
  const artistName = track.artists.map((artist: any) => artist.name).join(" ").toLowerCase();
  const albumName = track.album.name.toLowerCase();
  
  let score = track.popularity || 0;
  
  const japanesePatterns = [
    /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/,
    /\b(jp|japan|japanese|jpn)\b/i,
    /\b(tokyo|osaka|kyoto|nagoya)\b/i
  ];
  
  const internationalPatterns = [
    /\b(feat\.|ft\.|featuring)\b/i,
    /\b(remix|mix|edit)\b/i,
    /\b(us|uk|usa|america|britain)\b/i
  ];
  
  for (const pattern of japanesePatterns) {
    if (pattern.test(trackName) || pattern.test(artistName) || pattern.test(albumName)) {
      score += 50;
      break;
    }
  }
  
  for (const pattern of internationalPatterns) {
    if (pattern.test(trackName) || pattern.test(artistName) || pattern.test(albumName)) {
      score -= 20;
      break;
    }
  }
  
  return score;
}