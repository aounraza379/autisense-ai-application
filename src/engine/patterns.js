import rag from './rag';
import { SCENARIO_PROFILES, STRATEGY_KB } from '../constants/profiles';

const CRISIS_WORDS    = ['help','scared','panic','danger','hurt','pain','emergency'];
const EMOTIONAL_WORDS = ['sad','happy','angry','excited','worried','lonely','mad','frustrated'];
const FUNCTIONAL_WORDS= ['hungry','bathroom','tired','thirsty','eat','drink','brush','sleep','play'];

export function detectState(text) {
  const t = text.toLowerCase();
  if (CRISIS_WORDS.some(w => t.includes(w)))    return 'crisis';
  if (EMOTIONAL_WORDS.some(w => t.includes(w))) return 'emotional';
  if (FUNCTIONAL_WORDS.some(w => t.includes(w)))return 'functional';
  return 'social';
}

export function buildPrompt({
  text,
  role,
  state,
  preferences = {},
  patternNote = '',
  recentResponses = [],
}) {
  const profile  = SCENARIO_PROFILES[role] || SCENARIO_PROFILES.parent;
  const strategy = STRATEGY_KB[state]      || STRATEGY_KB.social;
  const retrieved = rag.retrieve(text);

  const prefStr = Object.values(preferences)
    .map(v => `Child likes: ${v}.`)
    .join(' ');

  const noRepeat = recentResponses.length
    ? `AVOID repeating: [${recentResponses.slice(-3).join(' | ')}]`
    : '';

  const ragBlock = retrieved
    ? `STRICT RULE — follow this:\n"""\n${retrieved}\n"""`
    : '';

  return `${profile.role}
TONE: ${profile.tone}
VOCABULARY: ${profile.vocab}

HARD RULES — NON NEGOTIABLE:
- ONE sentence only. Absolute limit.
- Maximum 12 words in that one sentence.
- No lists, no bullet points.
- No recipes or instructions.
- No questions back to the child.
- Validate feelings first if emotional state.
- Offer exactly two choices if functional need.

EXAMPLES (style only):
${profile.examples.join('\n')}

STRATEGY: ${strategy}
${prefStr}
${patternNote}
${noRepeat}
${ragBlock}`.trim();
}

export function detectPatternNote(stateLog = []) {
  if (stateLog.length < 3) return '';
  const counts = {};
  stateLog.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  const [top] = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  if (top && top[1] / stateLog.length >= 0.6 && top[1] >= 3) {
    const notes = {
      emotional:  'Pattern: child expressing emotions frequently. Prioritise brief validation.',
      functional: 'Pattern: child has practical needs. Stay concrete.',
      crisis:     'Pattern: child repeatedly distressed. Use very short soothing words.',
    };
    return notes[top[0]] || '';
  }
  return '';
}

export async function analyseChildPatterns(childId) {
  const { getEmotionFrequency, getRecentInteractions } = require('../db/database');
  const [emotions, recent] = await Promise.all([
    getEmotionFrequency(childId, 7),
    getRecentInteractions(childId, 50),
  ]);

  const patterns = [];

  // Dominant emotion this week
  if (emotions.length > 0) {
    const top = emotions[0];
    if (top.count >= 3) {
      patterns.push({
        type:    'emotion',
        insight: `Most frequent feeling this week: ${top.detected_state} (${top.count} times)`,
        action:  top.detected_state === 'emotional'
          ? 'Consider adding more calming activities to the routine.'
          : top.detected_state === 'functional'
          ? 'Child has many practical needs — ensure routine needs are pre-empted.'
          : null,
      });
    }
  }

  // Time-based patterns
  const angerByHour = {};
  recent
    .filter(r => r.detected_state === 'emotional' || r.detected_state === 'crisis')
    .forEach(r => {
      angerByHour[r.hour_of_day] = (angerByHour[r.hour_of_day] || 0) + 1;
    });

  const peakHour = Object.entries(angerByHour).sort((a,b) => b[1]-a[1])[0];
  if (peakHour && peakHour[1] >= 3) {
    patterns.push({
      type:    'timing',
      insight: `Child often expresses distress around ${peakHour[0]}:00`,
      action:  'Consider a calming activity before this time.',
    });
  }

  return patterns;
}

