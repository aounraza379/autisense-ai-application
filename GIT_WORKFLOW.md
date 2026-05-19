# Git Workflow Guide for AutiSense AI

## 📌 Overview

This document outlines the Git workflow for tracking all changes to the AutiSense AI project. Every phase completion will be committed with proper documentation.

## 🌳 Branch Strategy

```
main (production-ready)
  └── develop (active development)
       ├── feature/voice-input
       ├── feature/analytics
       ├── feature/offline-mode
       └── bugfix/[issue-name]
```

### Branch Rules
- **main**: Only production-ready, tested code
- **develop**: Integration branch for all features
- **feature/***: New features (merge to develop)
- **bugfix/***: Bug fixes (merge to develop)
- **hotfix/***: Critical production fixes (merge to main & develop)

## 📝 Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, no logic change)
- **refactor**: Code restructuring (no feature change)
- **perf**: Performance improvement
- **test**: Adding/updating tests
- **chore**: Build process, dependencies, etc.

### Examples

```bash
# Feature
git commit -m "feat(voice): enable STT in development build

- Uncommented STT code in voice.js
- Added microphone permissions
- Updated VoiceButton for recording state
- Tested on Android device

Closes #12"

# Bug Fix
git commit -m "fix(chat): prevent duplicate messages

- Added message deduplication logic
- Fixed race condition in handleInput
- Added unit tests

Fixes #45"

# Documentation
git commit -m "docs(readme): update installation steps

- Added .env configuration section
- Updated troubleshooting guide
- Added screenshots"

# Refactor
git commit -m "refactor(database): optimize query performance

- Added indexes on frequently queried columns
- Reduced query execution time by 60%
- No API changes"
```

## 🔄 Phase Completion Workflow

### Step 1: Complete Phase Tasks
Work through all tasks in the current phase, testing thoroughly.

### Step 2: Update Documentation
```bash
# Update CHANGELOG.md with completed items
# Update TODO list to mark phase complete
# Document any issues or learnings
```

### Step 3: Stage Changes
```bash
# Check what changed
git status

# Review changes
git diff

# Stage all changes
git add .

# Or stage specific files
git add src/engine/voice.js
git add CHANGELOG.md
```

### Step 4: Commit with Phase Message
```bash
# Phase completion commit
git commit -m "Phase X: [Phase Name] complete

Completed Tasks:
- Task 1
- Task 2
- Task 3

Changes:
- File changes summary
- New features added
- Bugs fixed

Testing:
- All tests passed
- Manual testing completed
- No regressions found

Next Phase: Phase Y - [Next Phase Name]"
```

### Step 5: Push to Remote
```bash
# Push to develop branch
git push origin develop

# Or push to feature branch
git push origin feature/voice-input
```

## 📊 Phase-Specific Commits

### Phase 0: Setup & Documentation
```bash
git add .
git commit -m "Phase 0: Setup & Documentation complete

Completed:
- Codebase analysis and verification
- Created .env.example template
- Created CHANGELOG.md
- Created DEVELOPMENT.md
- Created GIT_WORKFLOW.md
- Created comprehensive TODO list (83 items)

Current State:
- All core features implemented and functional
- Database schema complete (6 tables)
- AI chat engine operational
- TTS working, STT disabled (requires dev build)
- Boolean safety utilities in place
- Error boundaries implemented

Next: Phase 1 - Environment & Configuration"
```

### Phase 1: Environment & Configuration
```bash
git commit -m "Phase 1: Environment & Configuration complete

Completed:
- Created .env file with Groq API key
- Tested app launch in Expo Go
- Verified database initialization
- Tested text chat functionality
- Verified TTS (text-to-speech)
- Tested all 3 role modes
- Documented setup process

Issues Found:
- [List any issues]

Fixes Applied:
- [List any fixes]

Next: Phase 2 - Voice Input Implementation"
```

### Phase 2: Voice Input
```bash
git commit -m "Phase 2: Voice Input (STT) complete

Completed:
- Ran npx expo prebuild
- Uncommented STT code in voice.js
- Added microphone permissions
- Built development version
- Tested voice recognition on Android
- Added error handling for STT
- Updated VoiceButton visual feedback
- Tested end-to-end voice flow

Changes:
- src/engine/voice.js: Enabled STT
- src/components/VoiceButton.js: Added recording animation
- app.json: Added microphone permission

Next: Phase 3 - Testing & Bug Fixes"
```

## 🏷️ Tagging Releases

### Version Format
Follow Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating Tags
```bash
# After Phase 7 (Production Ready)
git tag -a v1.0.0 -m "Release v1.0.0 - Initial Production Release

Features:
- AI-powered chat with 3 role modes
- Voice input and output
- Emotion board with 11 cards
- Daily schedule tracking
- Profile analytics
- Offline mode
- Crash reporting

Tested on:
- Android 10+
- iOS 14+
- Multiple devices"

# Push tag
git push origin v1.0.0
```

### Pre-release Tags
```bash
# Beta releases
git tag -a v1.0.0-beta.1 -m "Beta 1 for testing"
git tag -a v1.0.0-beta.2 -m "Beta 2 with bug fixes"

# Release candidates
git tag -a v1.0.0-rc.1 -m "Release Candidate 1"
```

## 🔍 Reviewing Changes

### Before Committing
```bash
# See what changed
git status

# See detailed changes
git diff

# See staged changes
git diff --staged

# Review specific file
git diff src/engine/voice.js
```

### After Committing
```bash
# View commit history
git log --oneline

# View detailed commit
git show HEAD

# View specific commit
git show abc123
```

## 🚨 Emergency Procedures

### Undo Last Commit (Not Pushed)
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit
git reset --hard HEAD~1
```

### Fix Commit Message
```bash
# Amend last commit message
git commit --amend -m "New message"
```

### Revert Pushed Commit
```bash
# Create revert commit
git revert abc123

# Push revert
git push origin develop
```

## 📋 Checklist Before Each Commit

- [ ] All code changes tested locally
- [ ] No console errors or warnings
- [ ] CHANGELOG.md updated
- [ ] TODO list updated
- [ ] Code follows project style
- [ ] No sensitive data (API keys, passwords)
- [ ] Commit message is clear and descriptive
- [ ] Changes are related to single purpose

## 🎯 Quick Reference

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Work on feature
# ... make changes ...
git add .
git commit -m "feat(scope): description"

# Push feature
git push origin feature/new-feature

# Merge to develop (after review)
git checkout develop
git merge feature/new-feature
git push origin develop

# Delete feature branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

---

**Remember**: Commit early, commit often, but make each commit meaningful!

**Last Updated**: 2026-05-19