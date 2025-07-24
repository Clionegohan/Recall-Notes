import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ErrorMessage } from './components/ErrorMessage'
import { LoadingSpinner } from './components/LoadingSpinner'
import { HomePage } from './pages/HomePage'
import { PlaylistsPage } from './pages/PlaylistsPage'
import { AddPlaylistPage } from './pages/AddPlaylistPage'
import { useUser } from './hooks/useUser'
import './App.css'

function App() {
  const { currentUserId, error, isLoading } = useUser()

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (isLoading || !currentUserId) {
    return <LoadingSpinner message="ユーザーを初期化しています..." />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage userId={currentUserId} />} />
          <Route path="/playlists" element={<PlaylistsPage userId={currentUserId} />} />
          <Route path="/add" element={<AddPlaylistPage userId={currentUserId} />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
