import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer } from './AudioPlayerContext'; // Import new AudioPlayerContext
import API from '../services/api';
import { getAudioService } from '../services/audioService'; // Re-add this import

// Initial state for the playlist manager
const initialState = {
  playlist: [],      // The entire playlist array
  queue: [],         // Songs in the queue to be played next
  history: [],       // Recently played songs
  currentIndex: -1,  // Index of the current song in the playlist
  isRepeat: false,   // Repeat current song
  isShuffle: false,  // Shuffle playlist
};

// Action types for the reducer
const ActionTypes = {
  SET_CURRENT_SONG: 'SET_CURRENT_SONG',
  SET_PLAYLIST: 'SET_PLAYLIST',
  ADD_TO_QUEUE: 'ADD_TO_QUEUE',
  REMOVE_FROM_QUEUE: 'REMOVE_FROM_QUEUE',
  CLEAR_QUEUE: 'CLEAR_QUEUE',
  TOGGLE_REPEAT: 'TOGGLE_REPEAT',
  TOGGLE_SHUFFLE: 'TOGGLE_SHUFFLE',
  PLAY_NEXT: 'PLAY_NEXT',
  PLAY_PREVIOUS: 'PLAY_PREVIOUS',
  RESET_PLAYLIST_MANAGER: 'RESET_PLAYLIST_MANAGER', // Resets only playlist manager states
};

// Reducer function to manage state changes
const playlistManagerReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_SONG:
      // In PlaylistManager, currentSong will primarily be managed by AudioPlayerContext.
      // We still keep it here to track which song is conceptually "current" within the playlist flow.
      return { ...state, currentIndex: action.payload.index, history: [...state.history, action.payload.song].slice(-50) };
    case ActionTypes.SET_PLAYLIST:
      return { ...state, playlist: action.payload, currentIndex: -1, queue: [], history: [] };
    case ActionTypes.ADD_TO_QUEUE:
      return { ...state, queue: [...state.queue, action.payload] };
    case ActionTypes.REMOVE_FROM_QUEUE:
      return { ...state, queue: state.queue.filter((_, index) => index !== action.payload) };
    case ActionTypes.CLEAR_QUEUE:
      return { ...state, queue: [] };
    case ActionTypes.TOGGLE_REPEAT:
      return { ...state, isRepeat: !state.isRepeat };
    case ActionTypes.TOGGLE_SHUFFLE:
      return { ...state, isShuffle: !state.isShuffle };
    case ActionTypes.PLAY_NEXT:
      // The logic for playing the next song is now handled by the playNext useCallback
      return { ...state };
    case ActionTypes.PLAY_PREVIOUS:
      // The logic for playing the previous song is now handled by the playPrevious useCallback
      return { ...state };
    case ActionTypes.RESET_PLAYLIST_MANAGER:
      return initialState; // Reset to initial state for playlist manager
    default:
      return state;
  }
};

// Helper functions for next/previous song logic
// These helpers are pure and only take state and currentSongId as input
const getNextSongInfo = (state, currentSongId) => {
  if (state.queue.length > 0) {
    // If there's a queue, play the next from queue
    return { song: state.queue[0], isFromQueue: true, indexInQueue: 0 };
  }
  
  const currentSongIndex = state.playlist.findIndex(s => s._id === currentSongId);
  // If current song is not in the playlist (e.g., played directly)
  if (currentSongIndex === -1 && state.playlist.length > 0) {
    // Fallback to playing the first song in the playlist
    return { song: state.playlist[0], isFromPlaylist: true, index: 0 };
  }
  
  if (state.isRepeat) {
    return { song: state.playlist[currentSongIndex], isFromPlaylist: true, index: currentSongIndex };
  }
  
  if (state.isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * state.playlist.length);
    } while (state.playlist.length > 1 && randomIndex === currentSongIndex);
    return { song: state.playlist[randomIndex], isFromPlaylist: true, index: randomIndex };
  }
  
  // Normal sequential play
  const nextIdx = (currentSongIndex + 1) % state.playlist.length;
  // If we wrapped around and it's the same song, and not repeat, implies single song in playlist or end.
  if (nextIdx === currentSongIndex && state.playlist.length === 1) {
    return null; // No next song
  }
  return { song: state.playlist[nextIdx], isFromPlaylist: true, index: nextIdx };
};

const getPreviousSongInfo = (state, currentSongId) => {
    // Priority: History, then Playlist
  if (state.history.length > 0) {
    const lastPlayedSong = state.history[state.history.length - 1];
        return { song: lastPlayedSong, isFromHistory: true, index: state.history.length - 1 };
    }

    const currentSongIndex = state.playlist.findIndex(s => s._id === currentSongId);
    if (currentSongIndex === -1 && state.playlist.length > 0) {
        // If current song is not in playlist, but playlist exists, assume previous is first song
        return { song: state.playlist[0], isFromPlaylist: true, index: 0 };
    }
    
    if (state.isShuffle) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * state.playlist.length);
        } while (state.playlist.length > 1 && randomIndex === currentSongIndex);
        return { song: state.playlist[randomIndex], isFromPlaylist: true, index: randomIndex };
    }

    const prevIdx = (currentSongIndex - 1 + state.playlist.length) % state.playlist.length;
    if (prevIdx === currentSongIndex && state.playlist.length === 1) {
      return null; // No previous song (single song)
    }
    return { song: state.playlist[prevIdx], isFromPlaylist: true, index: prevIdx };
};


// Create the context
const PlaylistManagerContext = createContext();

// Provider Component
export const PlaylistManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playlistManagerReducer, initialState);
  const { 
    currentSong: audioPlayerCurrentSong, 
    isPlaying,
    isPaused,
    isLoading,
    error,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    frequencyData,
    playSong: audioPlayerPlaySong,
    pauseSong: audioPlayerPauseSong,
    resumeSong: audioPlayerResumeSong,
    stopSong: audioPlayerStopSong,
    seekTo: audioPlayerSeekTo,
    setVolume: audioPlayerSetVolume,
    toggleMute: audioPlayerToggleMute,
    clearError: audioPlayerClearError,
  } = useAudioPlayer();

  // Get AudioService instance directly
  const audioService = useRef(getAudioService()).current;

  // This `playSong` function is the *wrapper* in PlaylistManagerContext
  // It handles updating the playlist state and then delegating to AudioPlayerContext
  const playSong = useCallback(async (songToPlayParam, updatePlaylistState = true) => {
    if (!songToPlayParam || !songToPlayParam._id || !songToPlayParam.audioUrl) {
      audioPlayerClearError('Invalid song object provided for playback.');
      return;
    }

    let songToPlay = songToPlayParam;
      let newIndex = -1;

    // Determine the index if playing from the current playlist
    if (updatePlaylistState) {
        newIndex = state.playlist.findIndex(s => s._id === songToPlay._id);
        if (newIndex === -1 && state.playlist.length === 0) {
            // If playlist is empty, add this song to a temporary playlist
          dispatch({ type: ActionTypes.SET_PLAYLIST, payload: [songToPlay] });
          newIndex = 0;
        } else if (newIndex === -1) {
            // Song not found in playlist, but playlist exists. Do not update current index.
            // This case means a song is played outside of current playlist context.
            // We will not update currentIndex for the playlist if the song is not found there.
        }
        dispatch({ type: ActionTypes.SET_CURRENT_SONG, payload: { song: songToPlay, index: newIndex } });
    } else {
        // If not updating playlist state, ensure currentSong is set in AudioPlayerContext
        // This means it's playing a song that might not be part of the active playlist flow (e.g., from queue temporarily)
        // No explicit dispatch to SET_CURRENT_SONG in playlist reducer here if updatePlaylistState is false.
    }


    // Delegate actual playback to AudioPlayerContext
    await audioPlayerPlaySong(songToPlay);

    // Increment play count via API
      if (songToPlay._id) {
        try {
          await API.songApi.incrementPlayCount(songToPlay._id);
          console.log(`Play count incremented for ${songToPlay.title}`);
        } catch (err) {
          console.warn('Failed to increment play count:', err);
        }
      }
  }, [state.playlist, audioPlayerPlaySong, audioPlayerClearError, dispatch]); // Added dispatch

  // Effect to handle song ending directly from AudioService
  useEffect(() => {
    const handleAudioEnded = () => {
      console.log('PlaylistManagerContext: AudioService emitted \'ended\'. Triggering next song logic.');
      
      const currentSongForNextLogic = audioPlayerCurrentSong || state.playlist[state.currentIndex]; // Use audioPlayerCurrentSong if available, else playlist state

      if (!currentSongForNextLogic) {
        audioPlayerStopSong();
        dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
        return;
      }

      if (state.isRepeat) {
        playSong(currentSongForNextLogic, false); // Replay current song, don't update playlist state
      } else {
        const nextSongInfo = getNextSongInfo(state, currentSongForNextLogic._id);
        if (nextSongInfo && nextSongInfo.song) {
          if (nextSongInfo.isFromQueue) {
            dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, payload: nextSongInfo.indexInQueue });
            playSong(nextSongInfo.song, false); // Play from queue, don't update playlist state index directly
          } else {
            playSong(nextSongInfo.song); // Play from playlist, update state
          }
        } else {
          audioPlayerStopSong(); // No next song
          dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
        }
      }
    };

    audioService.on('ended', handleAudioEnded);

    return () => {
      audioService.off('ended', handleAudioEnded);
    };
  }, [audioService, state.isRepeat, state.queue, state.playlist, state.currentIndex, audioPlayerCurrentSong, audioPlayerPlaySong, audioPlayerStopSong, dispatch, playSong]);

  const pauseSong = useCallback(() => {
    audioPlayerPauseSong();
  }, [audioPlayerPauseSong]);

  const resumeSong = useCallback(() => {
    audioPlayerResumeSong();
  }, [audioPlayerResumeSong]);

  const stopSong = useCallback(() => {
    audioPlayerStopSong();
    dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
  }, [audioPlayerStopSong, dispatch]);

  const seekTo = useCallback((time) => {
    audioPlayerSeekTo(time);
  }, [audioPlayerSeekTo]);

  const setVolume = useCallback((volume) => {
    audioPlayerSetVolume(volume);
  }, [audioPlayerSetVolume]);

  const toggleMute = useCallback(() => {
    audioPlayerToggleMute();
  }, [audioPlayerToggleMute]);

  const playNext = useCallback(() => {
    if (!audioPlayerCurrentSong && state.queue.length === 0 && state.playlist.length === 0) {
      // Nothing to play
      audioPlayerStopSong();
      dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
      return;
    }

    const currentSongForNextLogic = audioPlayerCurrentSong || state.playlist[state.currentIndex];
    if (currentSongForNextLogic) {
        const nextSongInfo = getNextSongInfo(state, currentSongForNextLogic._id);
        if (nextSongInfo && nextSongInfo.song) {
            if (nextSongInfo.isFromQueue) {
                dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, payload: nextSongInfo.indexInQueue });
                playSong(nextSongInfo.song, false);
            } else {
                playSong(nextSongInfo.song);
            }
        } else {
            audioPlayerStopSong();
            dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
        }
    } else if (state.queue.length > 0) {
        // If no current song but queue exists, play first in queue
        const nextSong = state.queue[0];
      dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, payload: 0 });
        playSong(nextSong, false);
    } else if (state.playlist.length > 0) {
        // If no current song or queue, play first in playlist
        playSong(state.playlist[0]);
      } else {
        audioPlayerStopSong();
        dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
    }

  }, [state.queue, state.playlist, state.isRepeat, state.isShuffle, state.currentIndex, audioPlayerCurrentSong, playSong, audioPlayerStopSong, dispatch]); // Added missing dependencies

  const playPrevious = useCallback(() => {
    if (!audioPlayerCurrentSong && state.history.length === 0 && state.playlist.length === 0) {
      // Nothing to go back to
      return;
    }

    const currentSongForPrevLogic = audioPlayerCurrentSong || state.playlist[state.currentIndex];
    if (!currentSongForPrevLogic) {
        // If no current song, and no history, can't go previous
        audioPlayerStopSong();
        dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
        return;
    }

    const prevSongInfo = getPreviousSongInfo(state, currentSongForPrevLogic._id);
    if (prevSongInfo && prevSongInfo.song) {
        if (prevSongInfo.isFromHistory) {
            dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, payload: prevSongInfo.index }); // Assuming history is managed like queue for removal
            playSong(prevSongInfo.song, false); // Play from history, don't update playlist state
        } else {
            playSong(prevSongInfo.song);
        }
    } else {
        audioPlayerStopSong(); // No previous song
        dispatch({ type: ActionTypes.RESET_PLAYLIST_MANAGER });
    }
  }, [state.history, state.playlist, state.isShuffle, state.currentIndex, audioPlayerCurrentSong, playSong, audioPlayerStopSong, dispatch]); // Added missing dependencies

  const setPlaylist = useCallback((songs) => {
    dispatch({ type: ActionTypes.SET_PLAYLIST, payload: songs });
  }, [dispatch]);

  const addToQueue = useCallback((song) => {
    dispatch({ type: ActionTypes.ADD_TO_QUEUE, payload: song });
  }, [dispatch]);

  const removeFromQueue = useCallback((index) => {
    dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, payload: index });
  }, [dispatch]);

  const clearQueue = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_QUEUE });
  }, [dispatch]);

  const toggleRepeat = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_REPEAT });
  }, [dispatch]);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_SHUFFLE });
  }, [dispatch]);

  // Context value to be provided to consumers
  const contextValue = {
    ...state,
    currentSong: audioPlayerCurrentSong,
    isPlaying,
    isPaused,
    isLoading,
    error,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    frequencyData,
    playSong,
    pauseSong,
    resumeSong,
    stopSong,
    seekTo,
    setVolume,
    toggleMute,
    clearError: audioPlayerClearError,
    playNext,
    playPrevious,
    setPlaylist,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
  };

  return (
    <PlaylistManagerContext.Provider value={contextValue}>
      {children}
    </PlaylistManagerContext.Provider>
  );
};

// Custom hook to consume the playlist manager context
export const usePlaylistManager = () => {
  const context = useContext(PlaylistManagerContext);
  if (context === undefined) {
    throw new Error('usePlaylistManager must be used within a PlaylistManagerProvider');
  }
  return context;
};