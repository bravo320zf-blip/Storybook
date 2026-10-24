# Inkling Studio · Novel Writing & Google Drive Sync Desk

An all-in-one digital writing, worldbuilding, and project-management application inspired by [inkling.digital](https://inkling.digital/app#). It preserves the core philosophy that **"the words are always, only yours"** while storing all your manuscripts, chapters, character sheets, storyboards, and world maps directly into your personal **Google Drive**, backed by **Firebase**.

---

## ✨ Features Recreated from Inkling

- **Dashboard**:
  - Live statistics: Total Stories, Words written, Words this week, Writing streak counter, Ideas count.
  - Filter chips: `All`, `Drafting`, `Stuck`, `Needs ending`, `Resting`, `Finished`.
  - Procedural landscape SVG cover art generation matching Inkling's palettes (*Clay*, *Gold*, *Night*, *Forest*, *Rose*, *Ocean*).
  - The "Previously..." story recap quote on every card for easy mental re-entry.
  - Quick action: *Jump back in →*.

- **The Writing Desk (Distraction-Free Editor)**:
  - Clean distraction-free typography with live word counter and estimated reading time.
  - **Studio Peek Drawer**: Peek at your Character Cast, Storyboard cards, and World Map landmarks without leaving your draft.
  - Synthesize "Previously..." recap from manuscript.
  - Export to Markdown (`.md`), Plain Text (`.txt`), or direct to Google Drive.

- **Storyboard (Visual Corkboard)**:
  - Digital index cards: `Note` (`#ECE4D7`), `Scene` (`#DCE9EE`), `Character` (`#F1E2E0`), `Place` (`#DFEAE4`), `Idea` (`#E7E1F0`).
  - Drag-and-drop cards across the canvas.
  - Draw connecting thread arrows between cards to track storylines.
  - One-click *Export to Google Drive Doc*.

- **Character Builder (Cast)**:
  - Deep psychological profiles: Core Wound, Deepest Fear, The Lie They Believe, What They Want vs What They Need, and Character Arc evolution.
  - Avatar badges and role categorizations (*Protagonist*, *Antagonist*, *Supporting*, *Mentor*, *Rival*).

- **Muse (Inspiration Desk)**:
  - Fantasy, Sci-Fi, and gothic character name generator.
  - Story hooks, moral dilemmas, and narrative plot twists.
  - *To Storyboard* button: Sends generated sparks directly into your corkboard canvas.

- **Art Board (Cover Designer)**:
  - Procedural book cover art studio with classic typography (*Cinzel*, *Cormorant Garamond*, *Caveat*, *Courier Prime*, *Josefin Sans*).
  - Save directly as a story cover or download high-res vector SVG.

- **Map Maker**:
  - Fantasy world and city map canvas (Aspect ratios: *Screen (3:2)*, *Book (2:3)*, *Poster (3:4)*, *Square (1:1)*, *Wide (16:9)*).
  - Hand-drawn SVG stamps: Castles, Walled Cities, Wizard Towers, Taverns, Mountains, Forests, Sea Serpents, Dragons, Compass Roses.
  - Styles: *Inkling Wash*, *Gilded Night*, *Parchment*.

- **Writing Sprint Timer**:
  - Built-in sprint tool (5, 15, 25 minutes) with word output tracking and celebration chime/confetti.

- **Command Palette (`⌘K` / `Ctrl+K`)**:
  - Instant keyboard access to search stories, cast members, studio tools, and themes.

---

## ☁️ Google Drive & Firebase Architecture

### 1. Google Drive Storage
All your pages and documents are saved in a dedicated Google Drive folder (default: `Inkling Stories`):
```text
Google Drive/
└── Inkling Stories/
    ├── A Vow of Ash and Wing.md
    ├── The Lighthouse at Renn.md
    ├── characters.json
    ├── storyboards.json
    ├── maps.json
    └── inkling_full_backup.json
```
- **Privacy First**: Uses Google OAuth with the `https://www.googleapis.com/auth/drive.file` scope, meaning this app only has access to files that it creates, and cannot read your personal files or unrelated documents in Drive.
- **Offline & Local-first**: Keystrokes are immediately saved to browser local storage so you never lose work even if your internet connection fluctuates.

### 2. Firebase Backend
- **Firebase Authentication**: Seamless Google Sign-In with Drive scopes.
- **Cloud Firestore**: Realtime metadata synchronization and secure per-user rules (`firestore.rules`).

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+ or v22+)
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/WriterLogProject.git
cd WriterLogProject

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` to open the studio.

---

## 🔑 Setting Up Firebase & Google Drive

### 1. Google Cloud Console (Drive API)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Under **APIs & Services > Library**, search for **Google Drive API** and click **Enable**.
4. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID** (Web Application).
5. Add your authorized Javascript origins:
   - `http://localhost:3000` (for local development)
   - Your production Firebase Hosting or Vercel domain.

### 2. Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Under **Build > Authentication**, enable the **Google** sign-in provider.
3. Under **Build > Firestore Database**, create a database in production mode.
4. Copy your web configuration and paste it into `.env` (or directly in the **Setup & Cloud Connections** screen inside the app):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📦 Deploying to GitHub & Firebase Hosting

### Push to GitHub
```bash
git remote add origin https://github.com/your-username/WriterLogProject.git
git branch -M main
git push -u origin main
```

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login and deploy
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## 📜 License
MIT License. Created for novelists, fiction writers, and worldbuilders.
