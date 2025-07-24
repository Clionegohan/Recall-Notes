# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a **Recall-Notes** music application with the following architecture:

- **Frontend**: React 19 + TypeScript + Vite + React Router in the `recall-notes/` directory
- **Backend**: Convex serverless backend for real-time data synchronization
- **Database**: Convex database with predefined schema for users and playlists
- **Deployment**: Configured for Vercel deployment

The main application code is located in `recall-notes/` subdirectory, not the root.

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── SimpleLayout.tsx # Simplified layout for errors/loading
│   ├── PlaylistForm.tsx # Add playlist form
│   ├── PlaylistList.tsx # Display playlists
│   ├── ErrorMessage.tsx # Error handling
│   └── LoadingSpinner.tsx # Loading states
├── pages/              # Route-based page components
│   ├── HomePage.tsx    # Dashboard with recent playlists
│   ├── PlaylistsPage.tsx # Full playlist management
│   └── AddPlaylistPage.tsx # Add new playlist
├── hooks/              # Custom React hooks
│   └── useUser.ts      # User management logic
└── types/              # TypeScript type definitions
    └── index.ts        # Shared types
```

## Key Commands

All commands should be run from the `recall-notes/` directory:

```bash
cd recall-notes
```

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

### Convex Backend
- `npx convex dev` - Start Convex development server
- `npx convex deploy` - Deploy Convex functions to production
- `npx convex docs` - Open Convex documentation

## Architecture Overview

### Database Schema (convex/schema.ts)
- **users table**: name, email, optional avatar/age/sex, favoriteArtist array
- **playlists table**: title, artist, userId, optional spotifyId with indexes on userId and artist

### Convex Functions
- **convex/users.ts**: User management (createUser, getUser)
- **convex/playlists.ts**: Playlist operations
  - `getPlaylistsByUser(userId)` - Query to fetch user's playlists
  - `addPlaylist(title, artist, userId, spotifyId?)` - Mutation to add new playlist

### Spotify Integration Strategy

**Phase 1 (Current)**: Basic functionality without Spotify API
- Simple form with title + artist only
- Optional spotifyId field in database (prepared for future)
- Focus on core playlist management

**Phase 2 (Future)**: Spotify API integration
- Automatic Spotify ID lookup using Spotify Web API Search
- Rich track information (album art, preview URLs)
- Enhanced user experience

**Phase 3 (Future)**: Advanced features
- 30-second preview playback
- Related track recommendations
- Playlist synchronization with Spotify

## Environment Configuration

### Local Development
- `.env.local` with `VITE_CONVEX_URL` for Convex backend connection
- Environment file exists but content is not tracked in git

### Vercel Deployment
Required environment variables:
- `VITE_CONVEX_URL` - Convex deployment URL
- Additional Convex production deployment setup required

## Development Notes

- TypeScript configuration includes both `tsconfig.app.json` and `tsconfig.node.json`
- ESLint configured with React hooks and React refresh plugins
- Project uses ES modules (`"type": "module"` in package.json)
- Convex generates TypeScript definitions in `convex/_generated/`
- React Router v7 for client-side routing
- Modern CSS with responsive design

## Current Implementation Status

✅ **Completed**:
- Full component architecture with proper separation of concerns
- React Router setup with multiple pages
- User management with automatic test user creation
- Playlist CRUD operations (Create, Read)
- Responsive design with modern CSS
- TypeScript type safety throughout
- Build and deployment ready

🚧 **Phase 1 Focus**:
- Simple playlist management (title + artist)
- Clean, intuitive user interface
- Stable foundation for future Spotify integration

📋 **Future Enhancements** (Phase 2+):
- Spotify Web API integration
- Automatic track ID resolution
- Rich media features (album art, previews)
- Playlist export/import functionality