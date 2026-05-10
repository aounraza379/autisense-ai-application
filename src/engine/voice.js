import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
// import Voice from '@react-native-voice/voice'; // Disabled for Expo Go compatibility

// ── TEXT TO SPEECH ────────────────────────────────────────

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

// ── SPEECH TO TEXT (DISABLED FOR EXPO GO) ─────────────────
/*
export class SpeechRecognizer {
  constructor() {
    this.isListening   = false;
    this.onResult      = null;
    this.onError       = null;
    this.onVolumeChange = null;
    this._setupListeners();
  }

  _setupListeners() {
    Voice.onSpeechStart   = () => { this.isListening = true; };
    Voice.onSpeechEnd     = () => { this.isListening = false; };

    Voice.onSpeechResults = (e) => {
      const results = e.value || [];
      const best    = results[0] || '';
      const cleaned = this._clean(best);
      if (cleaned && this.onResult) {
        this.onResult(cleaned);
      }
    };

    Voice.onSpeechError = (e) => {
      this.isListening = false;
      const msg = this._parseError(e.error?.code);
      if (this.onError) this.onError(msg);
    };

    Voice.onSpeechVolumeChanged = (e) => {
      if (this.onVolumeChange) this.onVolumeChange(e.value);
    };
  }

  _clean(text) {
    if (!text) return null;
    const cleaned = text.trim();
    if (cleaned.length < 2) return null;

    const garbage = new Set([
      'um','uh','hmm','hm','okay','ok','bye','the','you'
    ]);
    if (garbage.has(cleaned.toLowerCase())) return null;

    const alphaRatio = (cleaned.match(/[a-zA-Z]/g) || []).length / cleaned.length;
    if (alphaRatio < 0.4) return null;

    return cleaned;
  }

  _parseError(code) {
    const errors = {
      '2':  'No speech detected. Please speak clearly.',
      '5':  'Could not hear you. Try again.',
      '6':  'No speech input. Please try again.',
      '7':  'No match found. Speak more clearly.',
      '8':  'Recognizer busy. Wait a moment.',
      '9':  'Permissions not granted.',
    };
    return errors[String(code)] || 'Could not understand. Please try again.';
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
      await Voice.start('en-US');
    } catch (e) {
      if (this.onError) this.onError('Could not start listening.');
    }
  }

  async stop() {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (e) {
      // ignore
    }
  }

  destroy() {
    Voice.destroy().then(Voice.removeAllListeners);
  }
}
*/

// Fallback for ChatEngine
export class SpeechRecognizer {
    constructor() {
        this.isListening = false;
    }
    start() { console.log("STT is disabled in Expo Go"); }
    stop() { this.isListening = false; }
    destroy() {}
}
