# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a **Recall-Notes** music application with the following architecture:

- **Frontend**: React 19 + TypeScript + Vite in the `recall-notes/` directory
- **Backend**: Convex serverless backend for real-time data synchronization
- **Database**: Convex database with predefined schema for users and playlists

The main application code is located in `recall-notes/` subdirectory, not the root.

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
- **playlists table**: title, artist, userId, spotifyId with indexes on userId and artist

### Convex Functions (convex/playlists.ts)
- `getPlaylistsByUser(userId)` - Query to fetch user's playlists
- `addPlaylist(title, artist, userId, spotifyId)` - Mutation to add new playlist

### Frontend Setup
- **main.tsx**: Convex provider setup with environment variable `VITE_CONVEX_URL`
- **App.tsx**: Currently basic Vite + React template (needs implementation)

## Environment Configuration

- Requires `.env.local` with `VITE_CONVEX_URL` for Convex backend connection
- Environment file exists but content is not tracked in git

## Development Notes

- TypeScript configuration includes both `tsconfig.app.json` and `tsconfig.node.json`
- ESLint configured with React hooks and React refresh plugins
- Project uses ES modules (`"type": "module"` in package.json)
- Convex generates TypeScript definitions in `convex/_generated/`

## Current State

The application has backend infrastructure (Convex schema and functions) but the frontend is still the default Vite template. The core music playlist functionality is ready to be implemented in React components.