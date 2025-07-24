import type { Id } from '../../convex/_generated/dataModel'

export type User = {
  _id: Id<"users">
  _creationTime: number
  name: string
  email: string
  avatar?: string
  age?: number
  sex?: string
  favoriteArtist?: string[]
}

export type Playlist = {
  _id: Id<"playlists">
  _creationTime: number
  title: string
  artist: string
  userId: string
  spotifyId?: string
}

export type PlaylistFormData = {
  title: string
  artist: string
}