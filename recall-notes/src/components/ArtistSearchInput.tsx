import { useState, useRef, useEffect } from 'react'
import { useSpotifyArtistSearch } from '../hooks/useSpotifyArtistSearch'
import type { SpotifyArtist } from '../types/spotify'

interface ArtistSearchInputProps {
  id?: string
  placeholder?: string
  onArtistSelect: (artist: SpotifyArtist) => void
  disabled?: boolean
  className?: string
}

export const ArtistSearchInput = ({
  id,
  placeholder = "アーティスト名を入力してください",
  onArtistSelect,
  disabled = false,
  className = ""
}: ArtistSearchInputProps) => {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { artists, isLoading, error } = useSpotifyArtistSearch(query, {
    limit: 8,
    minQueryLength: 2
  })

  // クリック外を検出してサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    setShowSuggestions(value.length >= 2)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || artists.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < artists.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : artists.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < artists.length) {
          handleArtistSelect(artists[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleArtistSelect = (artist: SpotifyArtist) => {
    setQuery(artist.name)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onArtistSelect(artist)
  }

  const handleFocus = () => {
    if (query.length >= 2) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="search-loading">
            <div className="search-spinner" />
          </div>
        )}
      </div>

      {showSuggestions && (
        <div ref={suggestionsRef} className="search-suggestions">
          {error && (
            <div className="search-error">
              {error}
            </div>
          )}
          
          {!error && artists.length === 0 && !isLoading && (
            <div className="search-error">
              アーティストが見つかりませんでした
            </div>
          )}

          {!error && artists.map((artist, index) => (
            <div
              key={artist.id}
              className={`search-suggestion-item ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handleArtistSelect(artist)}
            >
              {artist.images && artist.images[0] && (
                <img
                  src={artist.images[0].url}
                  alt={`${artist.name}`}
                  className="suggestion-album-art"
                />
              )}
              <div className="suggestion-info">
                <div className="suggestion-track-name">{artist.name}</div>
                <div className="suggestion-artist-name">
                  {artist.followers ? `${artist.followers.toLocaleString()} フォロワー` : 'アーティスト'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}