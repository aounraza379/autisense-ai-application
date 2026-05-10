import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const groqClient = axios.create({
  baseURL: GROQ_API_URL,
  timeout: 15000, // 15 second timeout for real network conditions
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function callGroq(messages, maxTokens = 60) {
  try {
    const response = await groqClient.post('', {
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    // Trim to first sentence always
    return trimToFirstSentence(content.trim());

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('TIMEOUT');
    }
    if (error.response?.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    if (error.response?.status === 401) {
      throw new Error('AUTH_ERROR');
    }
    throw new Error('API_ERROR');
  }
}

function trimToFirstSentence(text) {
  for (const punct of ['. ', '! ', '? ']) {
    const idx = text.indexOf(punct);
    if (idx !== -1 && idx > 3) {
      return text.slice(0, idx + 1).trim();
    }
  }
  return text;
}

export function handleGroqError(errorCode) {
  const messages = {
    TIMEOUT:    "Taking too long. Please try again.",
    RATE_LIMIT: "Too many messages. Wait a moment.",
    AUTH_ERROR: "API key issue. Check settings.",
    API_ERROR:  "Something went wrong. Please try again.",
  };
  return messages[errorCode] || "I'm here with you.";
}
