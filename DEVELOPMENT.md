# AutiSense AI - Development Guide

## 🎯 Project Overview

AutiSense AI is a React Native mobile application designed to support neurodivergent children (autism spectrum) through AI-driven behavioral analysis, interactive chat, and structured scheduling.

## 📁 Project Structure

```
autisense-ai-application/
├── App.js                      # Main app entry with navigation
├── index.js                    # Expo entry point
├── package.json                # Dependencies
├── .env.example                # Environment template
├── CHANGELOG.md                # Version history
├── DEVELOPMENT.md              # This file
│
├── src/
│   ├── api/
│   │   └── groq.js            # Groq AI API client
│   │
│   ├── components/
│   │   ├── CoachingLabel.js   # Coaching tips display
│   │   ├── EmotionBoard.js    # Visual emotion cards
│   │   └── VoiceButton.js     # Voice input button
│   │
│   ├── constants/
│   │   ├── knowledge.js       # RAG knowledge base
│   │   └── profiles.js        # Role profiles & strategies
│   │
│   ├── db/
│   │   └── database.js        # SQLite operations
│   │
│   ├── engine/
│   │   ├── chatEngine.js      # Main chat logic
│   │   ├── patterns.js        # State detection & prompts
│   │   ├── rag.js             # RAG retrieval engine
│   │   └── voice.js           # TTS & STT handlers
│   │
│   ├── screens/
│   │   ├── HomeScreen.js      # Role selection
│   │   ├── ChatScreen.js      # Main chat interface
│   │   ├── ScheduleScreen.js  # Daily tasks
│   │   └── ProfileScreen.js   # Analytics dashboard
│   │
│   └── utils/
│       └── bool.js            # Boolean safety utility
│
└── assets/                     # App icons & images
```

## 🔧 Technology Stack

- **Framework**: React Native 0.81.5 via Expo 54.0.33
- **Navigation**: React Navigation (Stack)
- **Database**: SQLite (expo-sqlite)
- **AI Backend**: Groq API (LLaMA 3.1)
- **Voice**: expo-speech (TTS), @react-native-voice/voice (STT)
- **State**: React Hooks (useState, useEffect)

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/aounraza379/autisense-ai-application.git
cd autisense-ai-application
npm install
```

### 2. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env and add your Groq API key
# Get key from: https://console.groq.com/keys
```

### 3. Run in Expo Go (Voice Input Disabled)
```bash
npx expo start
# Scan QR code with Expo Go app
```

### 4. Run Development Build (Full Features)
```bash
# First time setup
npx expo prebuild

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## 📊 Database Schema

### Tables
1. **child_profile** - User profiles
2. **sessions** - Chat sessions
3. **interactions** - All messages & responses
4. **task_completions** - Schedule tracking
5. **preferences** - Learned user preferences
6. **app_settings** - App configuration

## 🧠 AI Architecture

### State Detection
- **Crisis**: help, scared, panic, danger
- **Emotional**: sad, happy, angry, worried
- **Functional**: hungry, bathroom, tired
- **Social**: General conversation

### Role Profiles
- **Parent**: Warm, nurturing, emotional connection
- **Teacher**: Structured, clear, step-by-step
- **Caretaker**: Practical, direct, two-choice options

### RAG System
- TF-IDF based retrieval
- Built-in knowledge base
- Context-aware responses

## 🔒 Safety Features

### Boolean Cast Protection
```javascript
// src/utils/bool.js
export function toBool(value) {
  return value === true || value === 'true';
}
```
Prevents Android crash: `java.lang.String cannot be cast to java.lang.Boolean`

### Error Boundaries
- Global error boundary in App.js
- Graceful fallback UI
- Console error interceptor

## 🧪 Testing Checklist

### Phase 1: Basic Functionality
- [ ] App launches without crashes
- [ ] Database initializes correctly
- [ ] Navigation between screens works
- [ ] Text input sends messages
- [ ] AI responses appear
- [ ] TTS speaks responses

### Phase 2: Role Testing
- [ ] Parent mode uses warm tone
- [ ] Teacher mode uses structured language
- [ ] Caretaker mode offers choices

### Phase 3: Features
- [ ] Emotion board cards work
- [ ] Schedule tasks can be checked
- [ ] Profile shows analytics
- [ ] Preferences are saved
- [ ] RAG retrieves relevant context

### Phase 4: Voice (Dev Build Only)
- [ ] Microphone permission granted
- [ ] Voice button shows recording state
- [ ] Speech recognized correctly
- [ ] Voice input triggers AI response

## 🐛 Common Issues

### Issue: "Cannot be cast to java.lang.Boolean"
**Solution**: All boolean props use `toBool()` utility

### Issue: Voice input not working
**Solution**: Build dev client, not Expo Go
```bash
npx expo prebuild
npx expo run:android
```

### Issue: Groq API errors
**Solution**: Check `.env` file has valid API key

### Issue: Database errors
**Solution**: Clear app data and restart
```bash
npx expo start -c
```

## 📝 Git Workflow

### Branch Strategy
- `main` - Production ready code
- `develop` - Active development
- `feature/*` - New features
- `bugfix/*` - Bug fixes

### Commit Convention
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: component/file affected
```

Examples:
```bash
git commit -m "feat(voice): enable STT in dev build"
git commit -m "fix(chat): prevent duplicate messages"
git commit -m "docs(readme): update setup instructions"
```

### Phase Completion
```bash
# After completing a phase
git add .
git commit -m "Phase X: [Phase Name] complete"
git push origin develop

# Update CHANGELOG.md
# Update TODO list
```

## 🔄 Development Phases

See `CHANGELOG.md` for detailed phase breakdown.

**Current Phase**: Phase 0 - Setup & Documentation ✅

**Next Phase**: Phase 1 - Environment & Configuration

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: aounraza379@gmail.com

## 📄 License

This project is private and proprietary.

---

**Last Updated**: 2026-05-19
**Version**: 0.1.0
**Status**: Phase 0 Complete