# Phase 3: Comprehensive Testing Plan

This document outlines the manual testing procedures for Phase 3. Since this is an Expo mobile application integrating native modules (Voice, Audio, SQLite) and external APIs (Groq), automated testing is limited without a complex CI/CD setup. Therefore, we rely on structured manual testing.

## Area 1: Application Boot & Navigation (Smoke Test)
**Goal:** Ensure the app loads without a white screen of death or native bridge casting errors.
1. **Launch App in Expo Go:** Run `npx.cmd expo start -c` and open it on your device.
2. **Navigation Check:** 
   - Tap through all tabs in the bottom navigation (Home, Chat, Schedule, Profile).
   - Ensure transitions are smooth and no "Boolean Cast" errors pop up on the screen (thanks to our `toBool` fix).
3. **Error Boundary Test:** If an error occurs, verify that the Error Boundary catches it and displays the fallback UI instead of crashing the app.

## Area 2: AI Chat Engine & Groq API
**Goal:** Verify that the RAG-lite system and Groq integration work seamlessly.
1. **Send a Text Message:** Go to the Chat tab and type "I am feeling a bit overwhelmed today."
2. **Verify Response:** 
   - Does the AI respond empathetically?
   - Is the response time acceptable (under 3-5 seconds)?
3. **State Detection Verification:** Check the UI/console to see if the "overwhelmed" state was detected properly and if the background or UI adjusts to a calming theme.
4. **Offline Resilience:** Turn off your internet, try to send a message. Ensure the app doesn't crash but instead shows a polite "Network Error" or "Offline" message.

## Area 3: Voice Integration (TTS & STT)
**Goal:** Ensure voice features work correctly on actual devices.
> **Note:** STT (Speech-to-Text) requires a development build (`npm run android` or `npm run ios`). It will NOT work in standard Expo Go.

1. **Text-To-Speech (TTS):** 
   - In the Chat tab, receive a message from the AI.
   - Tap the "Speaker" icon next to the AI's message.
   - Verify that the audio plays clearly and completely.
2. **Speech-To-Text (STT):**
   - Tap and hold the microphone button.
   - Speak a sentence like "What is on my schedule today?"
   - Verify that the text field populates with your speech accurately.
3. **Permissions:** Go to your phone's App Settings, revoke the microphone permission, open the app, and try to use voice input. The app should gracefully ask for permission or show an alert, not crash.

## Area 4: Local Database (SQLite)
**Goal:** Verify that data persists across app restarts.
1. **Create Data:**
   - Add a new task in the Schedule screen.
   - Have a brief conversation in the Chat screen.
2. **Restart App:** Completely close the app from your phone's memory, then open it again.
3. **Verify Persistence:**
   - Are the tasks still in the Schedule?
   - Is the chat history still visible?

## Area 5: UI/UX & Responsive Layout
**Goal:** Ensure the app looks good on your specific device.
1. **Keyboard Avoidance:** Open the chat and tap the text input. The keyboard should not cover the input field.
2. **Dark/Light Mode (If applicable):** Toggle your system theme and check if the app respects it without unreadable text.

---

### How to Report Bugs during Testing:
If you encounter an issue during these tests, note down:
1. The action you took.
2. What happened vs. what you expected to happen.
3. Any warnings/errors displayed in the terminal console where you ran `expo start`.
