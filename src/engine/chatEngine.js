import { callGroq, handleGroqError } from '../api/groq';
import { detectState, buildPrompt, detectPatternNote } from './patterns';
import { speak } from './voice';
import {
  logInteraction, savePreference, getPreferences
} from '../db/database';

export class ChatEngine {
  constructor(childId, sessionId, role = 'parent') {
    this.childId        = childId;
    this.sessionId      = sessionId;
    this.role           = role;
    this.stateLog       = [];
    this.recentResponses= [];
    this.preferences    = {};
    this.history        = [];  // last 10 turns for context
  }

  async init() {
    this.preferences = await getPreferences(this.childId);
  }

  setRole(role) {
    this.role = role;
    this.recentResponses = []; // clear repeat guard on role switch
  }

  async process(text, inputType = 'text') {
    if (!text?.trim()) return null;

    // 1. Update preferences from text
    this._extractPreferences(text);

    // 2. Detect state
    const state = detectState(text);
    this.stateLog.push(state);
    if (this.stateLog.length > 10) this.stateLog.shift();

    // 3. Build prompt
    const systemPrompt = buildPrompt({
      text,
      role:            this.role,
      state,
      preferences:     this.preferences,
      patternNote:     detectPatternNote(this.stateLog),
      recentResponses: this.recentResponses,
    });

    // 4. Build message history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.history.slice(-8),  // last 4 turns (8 messages)
      { role: 'user', content: text },
    ];

    // 5. Call Groq
    let aiResponse;
    try {
      aiResponse = await callGroq(messages, 60);
    } catch (e) {
      aiResponse = handleGroqError(e.message);
    }

    // 6. Update history and repeat guard
    this.history.push({ role: 'user', content: text });
    this.history.push({ role: 'assistant', content: aiResponse });
    if (this.history.length > 20) this.history = this.history.slice(-20);

    this.recentResponses.push(aiResponse.slice(0, 60));
    if (this.recentResponses.length > 4) this.recentResponses.shift();

    // 7. Log to database
    await logInteraction(
      this.sessionId, this.childId,
      text, aiResponse, state, inputType
    );

    // 8. Speak response
    await speak(aiResponse);

    return { text: aiResponse, state };
  }

  _extractPreferences(text) {
    const t = text.toLowerCase();
    if (t.includes('i like')) {
      const tail = t.split('i like')[1]?.trim().replace(/\.$/, '');
      if (!tail) return;
      const category =
        ['pizza','apple','banana','food','snack','cookie'].some(w => tail.includes(w)) ? 'food' :
        ['toy','game','block','car','lego'].some(w => tail.includes(w))                ? 'toy'  :
        'general';
      this.preferences[category] = tail;
      savePreference(this.childId, category, tail).catch(() => {});
    }
  }
}
