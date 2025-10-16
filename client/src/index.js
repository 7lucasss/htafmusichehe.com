import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/App.css';
import App from './App';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { PlaylistManagerProvider } from './context/PlaylistManagerContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AudioPlayerProvider>
      <PlaylistManagerProvider>
        <App />
      </PlaylistManagerProvider>
    </AudioPlayerProvider>
  </React.StrictMode>
); 