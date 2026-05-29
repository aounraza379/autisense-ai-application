# AutiSense AI: Project Vision & Architecture

Welcome to the AutiSense AI codebase! Whether you are a new developer, a project manager, or an open-source contributor, this document explains the **purpose** of the application, **why** certain technologies were chosen, and **how** everything works behind the scenes.

---

## Part 1: Project Overview & Vision

### 1. Why does AutiSense AI exist? (The Purpose)
Children with autism often face challenges with emotional regulation, communication, and executive functioning (like maintaining a daily routine). Caregivers and therapists cannot be available 24/7. 
**AutiSense AI exists to bridge this gap.** It acts as an always-available, infinitely patient, and hyper-personalized companion. By understanding a child's unique traits and current emotional state, it provides immediate emotional coaching, routine management, and conversational practice without judgment or fatigue.

### 2. Who is this app for? (Target Audience)
- **Primary Users:** Autistic children (and individuals with related neurodivergent traits) who need a safe space to practice communication, navigate emotional meltdowns, and track their daily schedules.
- **Secondary Users:** Parents, caregivers, and therapists who can review the application's Analytics and Chat History to understand what triggers the child and how they are progressing over time.

### 3. What makes our app stronger? (Key Features)
AutiSense AI is not just a generic ChatGPT wrapper. It is heavily specialized:
- **Ultra-Fast Voice Interaction:** Because autistic individuals might struggle with typing, the app features robust Text-to-Speech (TTS) and Speech-to-Text (STT) so the child can simply *talk* to their companion natively.
- **RAG-Lite Personalization:** The AI knows the child's schedule, age, and personality traits. It doesn't give generic advice; it gives advice tailored to the child's current task and unique needs.
- **Real-Time Emotion Detection:** Utilizing the `patterns.js` engine, the app instantly recognizes keywords (e.g., "sad", "angry") to adjust the coaching tone immediately.
- **Offline Resilience:** Meltdowns don't wait for Wi-Fi. The app queues messages offline and silently syncs them when the internet returns, ensuring the child is never met with a frustrating "Network Error" screen.
- **Privacy & Safety:** All conversations and analytics are saved entirely on the local device via SQLite. No personal data is harvested.

### 4. Why this Tech Stack?
- **React Native (Expo):** Allows us to build for both iOS and Android simultaneously from a single codebase. Expo provides native modules out-of-the-box (like `expo-av` for microphone access and `expo-sqlite` for the database) drastically speeding up development.
- **Groq API (LLaMA 3.1 & Whisper):** Groq's LPU (Language Processing Unit) hardware is incredibly fast. Speed is critical because high latency or delayed AI responses can cause an autistic child to lose focus or become frustrated. Groq delivers near-instantaneous replies.
- **SQLite:** Chosen for its zero-configuration, offline-first capabilities. It guarantees that a child's sensitive conversational data never sits on an unprotected remote server.

---

## Part 2: Technical Architecture & Behind The Scenes

## 1. App Initialization & Navigation
The entry point of the app is **`App.js`**:
- **Initialization:** It initializes the local database (`database.js`) and checks if a child profile exists. If not, it creates a default one.
- **Error Boundaries & Safety:** It wraps the app in an `ErrorBoundary` and a custom console error guard to gracefully catch and handle any fatal exceptions. Sentry is also initialized here for remote crash reporting.
- **Navigation:** Uses `@react-navigation/native` to manage screens (`Home`, `Chat`, `Schedule`, `Profile`, `Analytics`).

---

## 2. The Core AI Engine (`src/engine/`)
This folder contains the "brain" of the application. It acts as the bridge between the user's interface and the external AI models.

- **`chatEngine.js`**: The central coordinator. When a user sends a message, it:
  1. Detects the child's emotional state using `patterns.js`.
  2. Pulls relevant knowledge (like the child's profile details or schedule) via `rag.js`.
  3. Formats all this context and sends it to the Groq API.
  4. Manages the offline queue: If there's no internet, it saves the user's message locally to process later.

- **`voice.js`**: Handles Speech-to-Text (STT). It uses `expo-av` to record the user's voice into an audio file (m4a), and then sends that binary file to Groq's Whisper API to transcribe into text.
  - *It also handles Text-to-Speech (TTS) using `expo-speech` to read AI responses out loud.*

- **`rag.js` & `patterns.js`**: 
  - **RAG** (Retrieval-Augmented Generation) is a lightweight system that fetches the user's schedule/profile from the database and injects it into the AI's hidden prompt. This is how the AI "knows" who it's talking to.
  - **Patterns** scans the user's text for keywords (e.g., "sad", "angry") to instantly adapt the UI or the AI's coaching tone.

---

## 3. Database & Storage (`src/db/database.js`)
Since this is an offline-capable mobile app, all user data is stored locally on the device using `expo-sqlite`.
- We use relational tables to store:
  - `profiles`: Child settings (name, age, traits).
  - `sessions` & `interactions`: To save chat history.
  - `schedule`: To manage the child's daily routine tasks.
  - `message_queue`: A temporary table to hold messages that failed to send due to no internet.

---

## 4. UI Screens (`src/screens/`)
- **`ChatScreen.js`**: The most complex screen. It handles the chat interface, microphone toggling, and network checking. It polls every 5 seconds to see if the internet is back, automatically re-syncing any offline messages.
- **`ScheduleScreen.js`**: A basic CRUD (Create, Read, Update, Delete) list for tasks.
- **`AnalyticsScreen.js`**: Queries the database to show metrics (how long the app was used, how many messages sent) and exports this data as a CSV.
- **`ProfileScreen.js` & `HomeScreen.js`**: Handles user details and simple main menu navigation.

---

## 5. External API Integrations (`src/api/groq.js`)
All communication with external servers happens here.
- It uses the Groq API because of its ultra-low latency LPU hardware, allowing the AI to respond in milliseconds.
- Uses `llama-3.1-8b-instant` for text generation.
- Uses `whisper-large-v3` for voice transcription.
- Instead of using standard Axios to upload audio (which is buggy in React Native), it utilizes `expo-file-system/legacy` to reliably stream the binary microphone file natively from the phone to the Groq servers.

---

## 6. Utilities (`src/utils/`)
- **`bool.js`**: Contains a very specific fix `toBool()`. React Native's bridge between JavaScript and Android sometimes crashes when passing boolean values directly to native components. This utility safely casts them to prevent fatal app crashes.

---

### In Summary
When a user speaks into the app:
1. `ChatScreen.js` triggers `voice.js` to record audio.
2. `groq.js` uploads the audio and returns text.
3. `chatEngine.js` gathers the text, checks `patterns.js` for emotions, and `rag.js` for database context.
4. `groq.js` sends the combined prompt to LLaMA 3.1.
5. The response is saved to `database.js` and displayed in `ChatScreen.js`.
6. `voice.js` reads the response out loud.
