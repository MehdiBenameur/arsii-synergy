# ARSII Synergy — Project Management Mobile App

ARSII Synergy is a premium React Native mobile application designed for **ARSII-Sfax**. It bridges the gap between high-level project planning and daily task execution, providing real-time collaboration and role-based dashboards.

## 📁 Project Structure

```text
arsii-synergy/
├── App.js                   # Application entry point
├── app.json                 # Expo configuration
├── .env.example             # Template for API keys (Firebase & Gemini)
└── src/                     # Source Code
    ├── components/          # Reusable UI components
    ├── context/             # Global State (Auth, AI Artifacts)
    ├── data/                # Mock data (USERS, TEAMS, PROJECTS)
    ├── navigation/          # React Navigation setup
    ├── screens/             # Role-based Screens
    │   ├── auth/            # Login, Registration
    │   ├── lead/            # Lead Dashboard
    │   ├── manager/         # Manager Dashboard
    │   ├── shared/          # ArtifactChat, ArtifactViewer, DiffView
    │   └── user/            # Personal Tasks Dashboard
    ├── services/            # APIs and Backend
    │   ├── firebaseConfig.js# Firebase initialization
    │   ├── geminiService.js # AI Integration bridge
    │   └── dbSeed.js        # Firestore database seed script
    └── theme/               # Global styling (Colors, Typography)
```

## 🚀 Key Features

- **Real-time Backend (Firebase)**: Fully powered by Google Firebase (Firestore). Data is synced instantly across all users' devices.
- **Secure Authentication**: Robust Email/Password login and registration system with dynamic role and team assignment.
- **Native Push Notifications**: Integrated Expo Push Notifications for real-time alerts on task assignments and updates.
- **Role-Based Workspaces**:
  - **Member**: Personal task management with search and status filtering.
  - **Team Lead**: Team progress tracking, task creation, and workload analytics.
  - **Manager**: High-level project portfolio overview and cross-team health metrics.
  - **Admin**: Organization hierarchy and team management.
- **Advanced Search & Filters**: Instant search bar and status tabs (To Do, In Progress, Done) for efficient task management.
- **Collaboration**: Real-time task comments and activity tracking.
- **Accountability**: Visual workload tracking and deadline alerts.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo SDK
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Vanilla CSS (StyleSheet)
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Context API (Auth, Project, Notifications)
- **Date Handling**: date-fns

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MehdiBenameur/arsii-synergy.git
   cd arsii-synergy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Firebase and Gemini credentials:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   
   # Required for the AI functionality
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: You can copy `.env.example` to get started quickly).*

4. **Seed the database**:
   ```bash
   node src/services/dbSeed.js
   ```

5. **Start the app**:
   ```bash
   npx expo start --clear
   ```
   - Scan the QR code with **Expo Go** on Android.
   - Use the **Camera app** on iOS to scan the QR code.

## 📱 Features Walkthrough

### 1. Authentication
Sign up as any role (Admin, Manager, Lead, User) and assign yourself to a team. The app will customize the experience based on your selection.

### 2. Dashboards
Each dashboard is tailored to the user's responsibilities:
- **Managers** see the "Project Portfolio".
- **Leads** see "Team Progress" and "Workload".
- **Members** see their "Personal Tasks".

### 3. Task Management
Create tasks (as a Lead), set priorities and deadlines. Update status from the Task Detail screen to see live progress updates across the team.

### 4. Real-time Notifications
Receive push notifications whenever someone assigns you a task or comments on your work.

### ✨ 5. Unified AI Workspace (New Feature!)
A Gemini Flash-powered AI assistant that knows your project's complete context automatically.

**[🎥 Click here to watch the AI Workspace Demo Video](https://github.com/MehdiBenameur/arsii-synergy/raw/main/ARSII%20AI%20Feature%20Demo.mp4)**

- **Linked Documents**: Co-author living "Project Brief" and "Task List" documents with the AI. Changes requested in the chat interface are automatically parsed and previewed in real-time.
- **3-Tab Interface**: Seamlessly switch between the AI Chat, your Project Brief draft, and your Task List draft.
- **Git-like Publishing**: Leads and Managers can review their personal drafts against the live published Master documents in a side-by-side Diff View before hitting "Publish ✨".
- **Role-Based Access**: Members can view the Master documents and chat with the AI to create personal drafts, but only Managers and Leads have the authority to publish changes to the entire team.

#### 🏗️ AI Feature — Architecture & Screens Guide
- `src/services/geminiService.js`: The central bridge to Google's `@google/genai` SDK. It retrieves dynamic project context and uses precise XML tagging (`<project_brief>`, `<task_list>`) to parse LLM outputs.
- `src/context/ArtifactContext.js`: Global state management that listens to `masterArtifacts` (published) and `userDrafts` (private) in real-time via Firestore subcollections.
- `src/screens/shared/ArtifactChatScreen.js`: The flagship AI editing experience featuring a Segmented Tab layout. Users interact with the AI while rendering Markdown previews simultaneously.
- `src/screens/shared/DiffViewScreen.js`: A specialized side-by-side verification screen ensuring Leads and Managers can audit AI-generated content before executing a destructive publish to the master document.
- `src/screens/shared/ArtifactViewerScreen.js`: A clean, read-only Markdown renderer serving as the entry point from all User Dashboards. 

---
*Created for the ARSII-Sfax Challenge.*
*Stop the Scroll, Start the Control.*
