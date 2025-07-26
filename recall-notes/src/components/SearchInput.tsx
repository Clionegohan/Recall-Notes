import { useState, useRef, useEffect } from 'react'
import { useSimpleSpotifySearch } from '../hooks/useSpotifySearch'
import type { TrackSuggestion } from '../types/spotify'

interface SearchInputProps {
  placeholder?: string
  onTrackSelect: (track: TrackSuggestion) => void
  disabled?: boolean
  className?: string
  value?: string
  onChange?: (value: string) => void
  id?: string
  clearTrigger?: number
}

export const SearchInput = ({
  placeholder = "楽曲を検索...",
  onTrackSelect,
  disabled = false,
  className = "",
  value: controlledValue,
  onChange: onControlledChange,
  id,
  clearTrigger
}: SearchInputProps) => {
  // 内部状態（非制御時）
  const [internalValue, setInternalValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  // 制御コンポーネントかどうかの判定
  const isControlled = controlledValue !== undefined
  const inputValue = isControlled ? controlledValue : internalValue
  
  // refs
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Spotify検索フック
  const { suggestions, isLoading, error } = useSimpleSpotifySearch(inputValue)
  
  // 入力値変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    if (isControlled) {
      onControlledChange?.(newValue)
    } else {
      setInternalValue(newValue)
    }
    
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }
  
  // 楽曲選択ハンドラ
  const handleTrackSelect = (track: TrackSuggestion) => {
    onTrackSelect(track)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    // 入力欄に楽曲名 - アーティスト名を設定
    const displayValue = `${track.name} - ${track.artist}`
    if (isControlled) {
      onControlledChange?.(displayValue)
    } else {
      setInternalValue(displayValue)
    }
  }
  
  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
        
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleTrackSelect(suggestions[selectedIndex])
        }
        break
        
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }
  
  // clearTriggerが変更されたときに検索をクリア
  useEffect(() => {
    if (clearTrigger !== undefined && clearTrigger > 0) {
      if (isControlled) {
        onControlledChange?.('')
      } else {
        setInternalValue('')
      }
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }, [clearTrigger, isControlled, onControlledChange])
  
  // 外部クリックで候補を非表示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
          autoComplete="off"
        />
        
        {/* ローディングインジケーター */}
        {isLoading && (
          <div className="search-loading">
            <div className="search-spinner"></div>
          </div>
        )}
      </div>
      
      {/* 検索候補 */}
      {showSuggestions && (suggestions.length > 0 || error) && (
        <div ref={suggestionsRef} className="search-suggestions">
          {error ? (
            <div className="search-error">
              <span>🚫 {error}</span>
            </div>
          ) : (
            suggestions.map((track, index) => (
              <div
                key={track.id}
                className={`search-suggestion-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleTrackSelect(track)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* アルバムアート */}
                {track.albumArt && (
                  <img 
                    src={track.albumArt} 
                    alt={`${track.name} album art`}
                    className="suggestion-album-art"
                  />
                )}
                
                {/* 楽曲情報 */}
                <div className="suggestion-info">
                  <div className="suggestion-track-name">
                    {track.name}
                  </div>
                  <div className="suggestion-artist-name">
                    {track.artist}
                  </div>
                </div>
                
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
