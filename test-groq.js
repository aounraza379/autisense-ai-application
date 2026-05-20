require('dotenv').config();
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ ERROR: EXPO_PUBLIC_GROQ_API_KEY is not set in .env file.");
  process.exit(1);
}

async function testGroqAPI() {
  console.log("Testing Groq API Integration...");
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Say hello in one short sentence.' }],
        max_tokens: 30,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    console.log("✅ Success! Received response from Groq:");
    console.log(`> "${content.trim()}"`);
  } catch (error) {
    console.error("❌ Failed to connect to Groq API.");
    console.error("Error details:", error.response ? error.response.data : error.message);
  }
}

testGroqAPI();
