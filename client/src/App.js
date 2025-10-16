import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlaylistManagerProvider } from './context/PlaylistManagerContext';
import { usePlaylistManager } from './context/PlaylistManagerContext';
import { useAuth } from './context/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AudioPlayer from './components/audio/AudioPlayer';

// Routing Components
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import AdminRedirectWrapper from './components/routing/AdminRedirectWrapper';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Home from './pages/Home';
import MusicList from './pages/MusicList';
import MusicDetail from './pages/MusicDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import LiveStreams from './pages/LiveStreams';
import Rankings from './pages/Rankings';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import MusicDemo from './pages/MusicDemo';
import NotFound from './pages/NotFound';
import AdminRegister from './pages/AdminRegister';
import RoleSelection from './pages/RoleSelection';
import AvatarSelection from './pages/AvatarSelection'; // Import AvatarSelection

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SongManagement from './pages/admin/SongManagement';
import ArtistManagement from './pages/admin/ArtistManagement';
import AlbumManagement from './pages/admin/AlbumManagement';
import GenreManagement from './pages/admin/GenreManagement';
import PlaylistManagement from './pages/admin/PlaylistManagement';
import AddPlaylist from './pages/admin/AddPlaylist';
import AddSong from './pages/admin/AddSong';
import JobManagement from './pages/admin/JobManagement';
import CreateAdmin from './pages/admin/CreateAdmin';
import AdminSettings from './pages/admin/AdminSettings';

import { getAudioService } from './services/audioService';

import './assets/styles/App.css';

function App() {
  // No need for useEffect here to initialize AudioService, as it's a singleton
  // and its context will be initialized when first accessed via getAudioService().
  // This avoids potential issues with AudioContext suspension on initial load.

  return (
    <Router>
      <AuthProvider>
        <PlaylistManagerProvider>
          <div className="App flex flex-col min-h-screen">
            <Header /> {/* Header always visible unless it's an admin route */}

            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RoleSelection />} /> {/* Set RoleSelection as default home */}
                <Route path="/home" element={<Home />} /> {/* Move original Home to /home */}
                <Route path="/music" element={<MusicList />} />
                <Route path="/music/:id" element={<MusicDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Removed /select-role route as it's now the default / route */}
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/live-streams" element={<LiveStreams />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/music-demo" element={<MusicDemo />} />
                <Route path="/admin-register" element={<AdminRegister />} />

                {/* User Private Routes */}
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/avatar-selection" element={<PrivateRoute><AvatarSelection /></PrivateRoute>} /> {/* New route for avatar selection */}
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />

                {/* Admin Routes - Nested under AdminLayout */}
                <Route path="/admin/*" element={
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                      <Route path="users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                      <Route path="songs" element={<AdminRoute><SongManagement /></AdminRoute>} />
                      <Route path="artists" element={<AdminRoute><ArtistManagement /></AdminRoute>} />
                      <Route path="albums" element={<AdminRoute><AlbumManagement /></AdminRoute>} />
                      <Route path="genres" element={<AdminRoute><GenreManagement /></AdminRoute>} />
                      <Route path="playlists" element={<AdminRoute><PlaylistManagement /></AdminRoute>} />
                      <Route path="playlists/add" element={<AdminRoute><AddPlaylist /></AdminRoute>} />
                      <Route path="songs/add" element={<AdminRoute><AddSong /></AdminRoute>} />
                      <Route path="jobs" element={<AdminRoute><JobManagement /></AdminRoute>} />
                      <Route path="create-admin" element={<AdminRoute><CreateAdmin /></AdminRoute>} />
                      <Route path="settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                      <Route index element={<AdminRoute><Dashboard /></AdminRoute>} /> {/* Default admin route */}
                    </Routes>
                  </AdminLayout>
                } />

                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
          {/* Fixed Audio Player at bottom, now also handles pop-out state */}
          <AudioPlayer className="fixed bottom-0 left-0 right-0 z-50" />
        </PlaylistManagerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 