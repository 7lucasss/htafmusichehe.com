class AudioService {
  constructor() {
    this.context = null;
    this.source = null;
    this.gainNode = null;
    this.analyser = null;

    this.currentBuffer = null;
    this.currentSongId = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.playbackStartTime = 0;
    this.pausedAtTime = 0;
    this.duration = 0;
    this.manualStopFlag = false;

    this.listeners = {};
    this.timeUpdateInterval = null;

    this._initializeAudioContext();
  }

  _initializeAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      this.context = new AudioContextClass();
      
      this.gainNode = this.context.createGain();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;

      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);

      console.log('AudioContext initialized:', this.context.state);

      if (this.context.state === 'suspended') {
        const resumeContext = () => {
          this.context.resume().then(() => {
            console.log('AudioContext resumed after user interaction.');
            document.removeEventListener('click', resumeContext);
            document.removeEventListener('touchstart', resumeContext);
          }).catch(error => console.error('Error resuming AudioContext:', error));
        };
        document.addEventListener('click', resumeContext, { once: true });
        document.addEventListener('touchstart', resumeContext, { once: true });
      }

    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      this._emit('error', 'Failed to initialize audio. Please use a modern browser.');
    }
  }

  async loadAudio(songUrl, songId) {
    if (!this.context) {
      this._emit('error', 'Audio context not initialized.');
      return;
    }

    if (this.currentSongId === songId && this.currentBuffer) {
      console.log('Audio already loaded for this song ID:', songId);
      return; 
    }

    // this.stop(); // Removed: Stopping logic moved to play() to prevent premature state resets
    
    this._emit('loading', true);
    this._emit('clearError');

    try {
      console.log('Fetching audio from:', songUrl);
      const response = await fetch(songUrl, {
        headers: { 'Range': 'bytes=0-' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Received empty audio data.');
      }

      this.currentBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.duration = this.currentBuffer.duration;
      this.currentSongId = songId;
      this.pausedAtTime = 0; 

      console.log(`Audio loaded for ${songId}, duration: ${this.duration}`);
      this._emit('loaded', { duration: this.duration });

    } catch (error) {
      console.error('Error loading audio:', error);
      this._emit('error', `Failed to load audio: ${error.message}`);
      this._emit('loading', false);
      this.currentBuffer = null;
      this.duration = 0;
      this.currentSongId = null;
    } finally {
      this._emit('loading', false);
    }
  }

  async play(song) {
    if (!this.context) {
      this._emit('error', 'Audio context not initialized.');
      console.error('AudioService: Play - Audio context not initialized.'); // Debug log
      return;
    }

    if (!song || !song._id || !song.audioUrl) {
      this._emit('error', 'Invalid song object provided.');
      console.error('AudioService: Play - Invalid song object.'); // Debug log
      return;
    }

    // Stop current playback source if it exists, without emitting a global stop event
    if (this.source) {
      this.source.onended = null; // Prevent onended from firing for the old source
      this.source.stop(0);
      this.source.disconnect();
      this.source = null;
      console.log('AudioService: Play - Stopped existing source.'); // Debug log
    }

    const streamUrl = `/api/audio/stream/${song._id}`;

    // Load audio if it's a new song or the current buffer is empty/invalid
    if (this.currentSongId !== song._id || !this.currentBuffer) {
      console.log('AudioService: Play - Loading new audio...'); // Debug log
      await this.loadAudio(streamUrl, song._id);
    }

    if (!this.currentBuffer) {
      this._emit('error', 'No audio buffer loaded for playback.');
      console.error('AudioService: Play - No audio buffer loaded.'); // Debug log
      return;
    }
    
    // Create new source for playback from the beginning
    this.source = this.context.createBufferSource();
    this.source.buffer = this.currentBuffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode); // Ensure full chain is connected

    this.source.onended = () => {
      if (this.manualStopFlag) {
        this.manualStopFlag = false; 
        console.log('AudioService: onended - Manual stop detected.'); // Debug log
        return;
      }
      console.log('AudioService: onended - Audio ended naturally.'); // Debug log
      this.isPlaying = false;
      this.isPaused = false;
      this.playbackStartTime = 0;
      this.pausedAtTime = 0;
      this.stopTimeUpdate();
      this._emit('ended');
    };

    this.playbackStartTime = this.context.currentTime; // Start from current context time
    this.pausedAtTime = 0; // Always start a new play from 0

    this.source.start(0, 0); // Start from offset 0
    this.isPlaying = true;
    this.isPaused = false;
    this.startTimeUpdate();

    this._emit('play', { currentTime: 0, duration: this.duration });
    console.log(`AudioService: Play - Playing audio from offset: 0s`); // Debug log
  }

  pause() {
    console.log(`AudioService: Pause - Call received. isPlaying: ${this.isPlaying}, source exists: ${!!this.source}`);
    if (this.isPlaying && this.source) {
      this.pausedAtTime = this.context.currentTime - this.playbackStartTime;
      this.source.onended = null; // Ensure onended does not fire unexpectedly
      try {
        this.source.stop(0);
      } catch (e) {
        console.warn('AudioService: Pause - Error stopping source:', e);
      } // Debug log
      this.isPlaying = false;
      this.isPaused = true;
      this.stopTimeUpdate();
      this._emit('pause', { currentTime: this.pausedAtTime, duration: this.duration });
      console.log(`AudioService: Pause - Audio paused at: ${this.pausedAtTime}s`); // Debug log
    } else {
      console.log('AudioService: Pause - Cannot pause: Not playing or no source, or conditions not met.'); // Debug log
    }
  }

  async resume() {
    console.log(`AudioService: Resume - Call received. isPaused: ${this.isPaused}, currentBuffer exists: ${!!this.currentBuffer}`);
    if (this.isPaused && this.currentBuffer && this.context) {
      console.log(`AudioService: Resume - Attempting to resume from: ${this.pausedAtTime}s`); // Debug log
      // Create new source and connect nodes
      this.source = this.context.createBufferSource();
      this.source.buffer = this.currentBuffer;
      this.source.connect(this.analyser);
      this.analyser.connect(this.gainNode); // Ensure full chain is connected

      this.source.onended = () => {
        if (this.manualStopFlag) {
          this.manualStopFlag = false;
          console.log('AudioService: onended - Manual stop detected during resume.'); // Debug log
          return;
        }
        console.log('AudioService: onended - Audio ended naturally during resume playback.'); // Debug log
        this.isPlaying = false;
        this.isPaused = false;
        this.playbackStartTime = 0;
        this.pausedAtTime = 0;
        this.stopTimeUpdate();
        this._emit('ended');
      };

      this.playbackStartTime = this.context.currentTime - this.pausedAtTime; // Continue from where it was paused
      this.source.start(0, this.pausedAtTime); // Start from paused offset
      this.isPlaying = true;
      this.isPaused = false;
      this.startTimeUpdate();

      this._emit('play', { currentTime: this.pausedAtTime, duration: this.duration });
      console.log(`AudioService: Resume - Resuming audio from: ${this.pausedAtTime}s`); // Debug log
    } else {
      console.log('AudioService: Resume - Cannot resume: Not paused or no buffer.'); // Debug log
    }
  }

  stop() {
    if (this.source) {
      this.manualStopFlag = true; 
      this.source.onended = null; 
      this.source.disconnect(); // Disconnect to clean up resources
      try { this.source.stop(0); } catch (e) { console.warn('AudioService: Stop - Error stopping source:', e); } // Debug log
      this.source = null;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.playbackStartTime = 0;
    this.pausedAtTime = 0; 
    this.stopTimeUpdate();
    this._emit('stop'); 
    this._emit('clearError'); 
    console.log('AudioService: Stop - Audio stopped.'); // Debug log
  }

  async seek(time) {
    if (!this.currentBuffer || !this.context) {
      this._emit('error', 'No audio loaded to seek.');
      console.error('AudioService: Seek - No audio loaded to seek.'); // Debug log
      return;
    }

    const clampedTime = Math.max(0, Math.min(time, this.duration)); // Ensure time is within bounds
    console.log(`AudioService: Seek - Attempting to seek to: ${clampedTime}s`); // Debug log

    if (this.source) {
      this.source.onended = null; // Prevent unwanted 'ended' event
      try { this.source.stop(0); } catch (e) { console.warn('AudioService: Seek - Error stopping source on seek:', e); } // Debug log
      this.source.disconnect();
      this.source = null;
    }

    // Create a new source with the same buffer
    this.source = this.context.createBufferSource();
    this.source.buffer = this.currentBuffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode); // Ensure full chain is connected

    this.source.onended = () => {
      if (this.manualStopFlag) {
        this.manualStopFlag = false;
        console.log('AudioService: onended - Manual stop detected during seek onended.'); // Debug log
        return;
      }
      console.log('AudioService: onended - Audio ended naturally after seek.'); // Debug log
      this.isPlaying = false;
      this.isPaused = false;
      this.playbackStartTime = 0;
      this.pausedAtTime = 0;
      this.stopTimeUpdate();
      this._emit('ended');
    };

    // Calculate new playback start time based on context's current time and the seeked time
    this.playbackStartTime = this.context.currentTime - clampedTime;
    this.pausedAtTime = clampedTime; // If currently paused, this will be the new pausedAtTime

    // Start playback from the new time offset
    this.source.start(0, clampedTime);
    this.isPlaying = true;
    this.isPaused = false; // Seeking implies playing

    this.startTimeUpdate(); // Ensure time update interval is running
    this._emit('timeUpdate', { currentTime: clampedTime, duration: this.duration, progress: clampedTime / this.duration });
    this._emit('play', { currentTime: clampedTime, duration: this.duration }); // Emit play event after seeking
    console.log(`AudioService: Seek - Audio seeked to: ${clampedTime}s`); // Debug log
  }

  getCurrentTime() {
    if (this.isPlaying && this.context) {
      return this.context.currentTime - this.playbackStartTime;
    } else if (this.isPaused) {
      return this.pausedAtTime;
    }
    return 0;
  }

  getDuration() {
    return this.duration;
  }

  getFrequencyData() {
    if (this.analyser) {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);
      return dataArray;
    }
    return new Uint8Array(0);
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
      this._emit('volumeChange', volume);
      console.log(`AudioService: Volume set to: ${volume}`);
    } else {
      console.warn('AudioService: gainNode not initialized, cannot set volume.');
    }
  }

  getVolume() {
    return this.gainNode ? this.gainNode.gain.value : 1; // Default to 1 if not initialized
  }

  startTimeUpdate() {
    this.stopTimeUpdate();
    this.timeUpdateInterval = setInterval(() => {
      if (this.isPlaying) {
        const currentTime = this.getCurrentTime();
        this._emit('timeUpdate', {
          currentTime: currentTime,
          duration: this.duration,
          progress: this.duration > 0 ? currentTime / this.duration : 0
        });
      }
    }, 250);
  }

  stopTimeUpdate() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  destroy() {
    this.stop();
    this.stopTimeUpdate();
    if (this.context && this.context.state !== 'closed') {
      this.context.close().then(() => console.log('AudioContext closed.'));
    }
    this.context = null;
    this.currentBuffer = null;
    this.currentSongId = null;
    this.listeners = {};
    console.log('AudioService destroyed.');
  }
}

let audioServiceInstance = null;

export const getAudioService = () => {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
};

export default AudioService; 