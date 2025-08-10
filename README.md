# Team Tracker

**Team Tracker** – A real-time dashboard for organizing teams, shifts, and supervisors, built for speed, clarity, and collaboration.

A React + Firebase dashboard to visualize team members, shifts, and supervisors. Real-time data powers animated cards and shift views for quick situational awareness.

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="28" alt="react" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" height="28" alt="vite" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" height="28" alt="tailwindcss" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" height="28" alt="firebase" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="28" alt="nodejs" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="28" alt="javascript" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg" height="28" alt="html5" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-plain.svg" height="28" alt="css3" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg" height="28" alt="eslint" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="28" alt="git" />
</p>

## ✨ Features

- Real-time team data via **Firebase Realtime Database**
- Shift views with supervisors, mandates, and unassigned
- Animated UI with **Motion/Framer Motion-style API**
- Responsive card grid, sidebar navigation, and carousel
- Tailwind CSS design system (including forms plugin)
- Ready-to-extend pages: Home, Team Management, Login, Settings

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Icons, @material-tailwind/react
- **Animation:** motion (Framer Motion API)
- **Backend/RTDB:** Firebase (Analytics, Realtime Database)
- **Tooling:** ESLint, @vitejs/plugin-react

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

### Install

```bash
git clone https://github.com/<you>/team-tracker-react.git
cd team-tracker-react
npm install
```

### Configure Firebase

The project currently includes a `src/firebase.js` with a Firebase config. For better security and portability, consider moving these keys to env variables.

Create a `.env` file (Vite expects `VITE_*` names):

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Then update `src/firebase.js` to read from `import.meta.env.*`.

### Run (dev)

```bash
vite
```

### Build

```bash
vite build
```

### Preview (static)

```bash
vite preview
```

## 📸 Screenshots

_Add `./docs/screenshots/*.png` and reference here._

- Dashboard / Home
- Team Management
- Shift view

## 🧭 Project Structure

```
src/
.DS_Store
App.css
App.jsx
assets/
  .DS_Store
  background.svg
  background2.jpg
  background3.jpg
  react.svg
components/
  Card.jsx
  CardSm.jsx
  Carousel.jsx
  Home.jsx
  InfoCard.jsx
  Login.jsx
  Shifts.jsx
  Sidebar.jsx
  TeamDisplay.jsx
  TeamManagement.jsx
  UpperCard.jsx
createCards.jsx
firebase.js
index.css
main.jsx
teamSorting.js
```

Key modules:

- `components/TeamDisplay.jsx` – orchestrates upper supervisors and shifts from RTDB
- `components/Shifts.jsx` – builds each shift section
- `components/Card.jsx`, `components/UpperCard.jsx` – person cards with badges/OIC/FTO
- `teamSorting.js` – helpers: supervisors, mandates, unassigned, and per-shift filters
- `createCards.jsx` – utilities to build card components
- `firebase.js` – Firebase app, analytics, and database init

## 🔒 Data & Security

- Use Firebase Rules to restrict read/write.
- Keep secrets in `.env` (don’t commit them).
- Consider separating public config from private admin tasks.

## 🧪 Linting

```bash
eslint .
```

## 📦 Deployment

### Firebase Hosting

1. Install Firebase CLI (if not installed):

```bash
npm install -g firebase-tools
```

2. Log in to Firebase:

```bash
firebase login
```

3. Initialize hosting in your project (select your Firebase project, set `dist` as the public folder, configure as single-page app = yes):

```bash
firebase init hosting
```

4. Build the project:

```bash
npm run build
```

5. Deploy:

```bash
firebase deploy
```

Make sure your Firebase project has the correct `VITE_*` environment variables set in `.env` before building.

## ✅ Roadmap

Coming soon.

## 🤝 Contributing

PRs welcome! Please open an issue to discuss major changes.

## 📄 License

MIT License © Cody Willard
