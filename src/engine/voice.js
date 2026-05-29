import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../api/groq';// ── TEXT TO SPEECH ────────────────────────────────────────

export async function speak(text, options = {}) {
  if (!text?.trim()) return;

  // Stop any current speech first
  await Speech.stop();

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch:    options.pitch    || 1.0,
      rate:     options.rate     || 0.85,  // slightly slower for autism
      onDone:   resolve,
      onError:  reject,
      onStopped: resolve,
    });
  });
}

export async function stopSpeaking() {
  await Speech.stop();
}

export function isSpeaking() {
  return Speech.isSpeakingAsync();
}

// ── SPEECH TO TEXT (Expo-AV + Groq Whisper) ─────────────────
export class SpeechRecognizer {
  constructor() {
    this.isListening = false;
    this.onResult    = null;
    this.onError     = null;
    this.recording   = null;
  }

  async requestPermission() {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  async start() {
    if (this.isListening) return;
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      if (this.onError) this.onError('Microphone permission required.');
      return;
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.isListening = true;
    } catch (err) {
      console.log('[DEBUG] Failed to start recording', err);
      if (this.onError) this.onError('Could not start listening.');
      this.isListening = false;
    }
  }

  async stop() {
    if (!this.recording || !this.isListening) return;
    
    try {
      console.log('Stopping recording...');
      this.isListening = false; // Optimistic update
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      
      if (uri) {
        if (this.onError) this.onError('Transcribing...'); // Reuse error callback for status
        console.log('Transcribing audio at', uri);
        
        const text = await transcribeAudio(uri);
        
        if (text && text.trim().length > 1) {
          if (this.onResult) this.onResult(text);
        } else {
          if (this.onError) this.onError('Could not understand. Please try again.');
        }
      }
    } catch (err) {
      console.log('[DEBUG] Failed to stop/transcribe', err);
      if (this.onError) this.onError('Failed to transcribe: ' + err.message);
    }
  }

  destroy() {
    if (this.recording) {
      this.recording.stopAndUnloadAsync().catch(()=>{});
      this.recording = null;
    }
    this.isListening = false;
  }
}
