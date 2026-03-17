# ARSII Synergy — Project Management Mobile App

ARSII Synergy is a premium React Native mobile application designed for **ARSII-Sfax**. It bridges the gap between high-level project planning and daily task execution, providing real-time collaboration and role-based dashboards.

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
   git clone <repository-url>
   cd arsii-synergy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Update `src/services/firebaseConfig.js` with your own Firebase project credentials.

4. **Start the app**:
   ```bash
   npx expo start
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

### ✨ 5. Unified AI Workspace
A Gemini Flash-powered AI assistant that knows your project's complete context automatically.
<video src="./ARSII AI Feature Demo.mp4" controls="controls" width="100%"></video>

- **Linked Documents**: Co-author living "Project Brief" and "Task List" documents with the AI. Changes requested in the chat interface are automatically parsed and previewed in real-time.
- **3-Tab Interface**: Seamlessly switch between the AI Chat, your Project Brief draft, and your Task List draft.
- **Git-like Publishing**: Leads and Managers can review their personal drafts against the live published Master documents in a side-by-side Diff View before hitting "Publish ✨".
- **Role-Based Access**: Members can view the Master documents and chat with the AI to create personal drafts, but only Managers and Leads have the authority to publish changes to the entire team.

---
*Created for the ARSII-Sfax Challenge.*
*Stop the Scroll, Start the Control.*
