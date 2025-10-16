import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getAudioService } from '../services/audioService';

// Initial state for the audio player
const initialState = {
  currentSong: null,     // The currently playing song object
  isPlaying: false,      // Is audio currently playing
  isPaused: false,       // Is audio currently paused
  isLoading: false,      // Is audio currently loading
  error: null,           // Any error message
  currentTime: 0,        // Current playback time in seconds
  duration: 0,           // Total duration of the current song in seconds
  progress: 0,           // Playback progress (0.0 to 1.0)
  volume: 1.0,           // Volume (0.0 to 1.0)
  isMuted: false,        // Is audio muted
  previousVolume: 1.0,   // Store volume before muting
  frequencyData: new Uint8Array(0), // Data for audio visualizer
};

// Action types for the reducer
const ActionTypes = {
  SET_CURRENT_SONG: 'SET_CURRENT_SONG',
  SET_PLAYING: 'SET_PLAYING',
  SET_PAUSED: 'SET_PAUSED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_TIME_UPDATE: 'SET_TIME_UPDATE',
  SET_VOLUME: 'SET_VOLUME',
  SET_MUTED: 'SET_MUTED',
  SET_FREQUENCY_DATA: 'SET_FREQUENCY_DATA',
  RESET_PLAYER_STATE: 'RESET_PLAYER_STATE', // Resets only player-specific states, not currentSong
};

// Reducer function to manage state changes
const audioPlayerReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_SONG:
      return { ...state, currentSong: action.payload };
    case ActionTypes.SET_PLAYING:
      return { ...state, isPlaying: true, isPaused: false, isLoading: false, error: null };
    case ActionTypes.SET_PAUSED:
      return { ...state, isPlaying: false, isPaused: true, isLoading: false };
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false, isPlaying: false, isPaused: false };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.SET_TIME_UPDATE:
      return { ...state, currentTime: action.payload.currentTime, duration: action.payload.duration, progress: action.payload.progress };
    case ActionTypes.SET_VOLUME:
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case ActionTypes.SET_MUTED:
      return { ...state, isMuted: action.payload, previousVolume: action.payload ? state.volume : state.previousVolume, volume: action.payload ? 0 : state.previousVolume };
    case ActionTypes.SET_FREQUENCY_DATA:
      return { ...state, frequencyData: action.payload };
    case ActionTypes.RESET_PLAYER_STATE:
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        isLoading: false,
        currentTime: 0,
        duration: 0,
        progress: 0,
        frequencyData: new Uint8Array(0),
        error: null,
      };
    default:
      return state;
  }
};

// Create the context
const AudioPlayerContext = createContext();

// Provider Component
export const AudioPlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(audioPlayerReducer, initialState);
  const audioService = useRef(getAudioService()).current; // Use useRef to ensure a single instance

  // Effect to set up audio service listeners
  useEffect(() => {
    const handleTimeUpdate = (data) => dispatch({ type: ActionTypes.SET_TIME_UPDATE, payload: data });
    const handlePlay = (data) => {
      console.log('AudioPlayerContext: AudioService emitted \'play\', dispatching SET_PLAYING', data);
      dispatch({ type: ActionTypes.SET_PLAYING, payload: data });
    };
    const handlePause = (data) => {
      console.log('AudioPlayerContext: AudioService emitted \'pause\', dispatching SET_PAUSED', data);
      dispatch({ type: ActionTypes.SET_PAUSED, payload: data });
    };
    const handleEnded = () => {
      console.log('AudioPlayerContext: AudioService emitted \'ended\', dispatching RESET_PLAYER_STATE');
      // On natural end, reset player state but keep currentSong
      dispatch({ type: ActionTypes.RESET_PLAYER_STATE });
    };
    const handleError = (message) => dispatch({ type: ActionTypes.SET_ERROR, payload: message });
    const handleLoaded = (data) => dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    const handleLoading = (data) => dispatch({ type: ActionTypes.SET_LOADING, payload: data });
    const handleVolumeChange = (volume) => dispatch({ type: ActionTypes.SET_VOLUME, payload: volume });
    const handleStop = () => {
      console.log('AudioPlayerContext: AudioService emitted \'stop\', dispatching RESET_PLAYER_STATE');
      dispatch({ type: ActionTypes.RESET_PLAYER_STATE });
      dispatch({ type: ActionTypes.SET_CURRENT_SONG, payload: null }); // Clear current song on full stop
    };

    audioService.on('timeUpdate', handleTimeUpdate);
    audioService.on('play', handlePlay);
    audioService.on('pause', handlePause);
    audioService.on('ended', handleEnded);
    audioService.on('error', handleError);
    audioService.on('loaded', handleLoaded);
    audioService.on('loading', handleLoading);
    audioService.on('volumeChange', handleVolumeChange);
    audioService.on('stop', handleStop);

    // Cleanup listeners on unmount
    return () => {
      audioService.off('timeUpdate', handleTimeUpdate);
      audioService.off('play', handlePlay);
      audioService.off('pause', handlePause);
      audioService.off('ended', handleEnded);
      audioService.off('error', handleError);
      audioService.off('loaded', handleLoaded);
      audioService.off('loading', handleLoading);
      audioService.off('volumeChange', handleVolumeChange);
      audioService.off('stop', handleStop);
    };
  }, [audioService]);

  // Frequency data update for visualizer
  useEffect(() => {
    let animationFrame;
    const updateFrequencyData = () => {
      if (state.isPlaying) {
        const data = audioService.getFrequencyData();
        dispatch({ type: ActionTypes.SET_FREQUENCY_DATA, payload: data });
      }
      animationFrame = requestAnimationFrame(updateFrequencyData);
    };

    if (state.isPlaying) {
      updateFrequencyData();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [state.isPlaying, audioService]);

  // --- Player Actions ---

  const playSong = useCallback(async (song) => {
    if (!song || !song._id || !song.audioUrl) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'Invalid song object provided for playback.' });
      return;
    }
    
    try {
      dispatch({ type: ActionTypes.SET_CURRENT_SONG, payload: song });
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      // If it's the same song and paused, resume; otherwise, play new song
      if (state.currentSong && state.currentSong._id === song._id && state.isPaused) {
        await audioService.resume();
      } else {
        await audioService.play(song);
      }

    } catch (error) {
      console.error('Error playing song:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.currentSong, state.isPaused, audioService]);

  const pauseSong = useCallback(() => {
    audioService.pause();
  }, [audioService]);

  const resumeSong = useCallback(async () => {
    if (!state.currentSong) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'No song to resume.' });
      return;
    }
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await audioService.resume();
    } catch (error) {
      console.error('Error resuming song:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.currentSong, audioService]);

  const stopSong = useCallback(() => {
    audioService.stop();
  }, [audioService]);

  const seekTo = useCallback(async (time) => {
    try {
      await audioService.seek(time);
    } catch (error) {
      console.error('Error seeking:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, [audioService]);

  const setVolume = useCallback((volume) => {
    audioService.setVolume(volume);
  }, [audioService]);

  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    dispatch({ type: ActionTypes.SET_MUTED, payload: newMuted });
    audioService.setVolume(newMuted ? 0 : state.previousVolume);
  }, [state.isMuted, state.previousVolume, audioService]);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // Context value to be provided to consumers
  const contextValue = {
    ...state,
    playSong,
    pauseSong,
    resumeSong,
    stopSong,
    seekTo,
    setVolume,
    toggleMute,
    clearError,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Custom hook to consume the AudioPlayer context
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export default AudioPlayerContext; 