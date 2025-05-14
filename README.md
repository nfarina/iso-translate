# Iso Translate

A client-side web application for real-time English/Simplified Chinese translation using OpenAI's Realtime API.

## Features

- Real-time translation between English and Simplified Chinese
- Voice input and translation
- Clean, responsive UI
- Supports multiple speakers with color coding
- Progressive Web App (PWA) support for mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/iso-translate.git
cd iso-translate
```

2. Install dependencies
```bash
npm install
```

3. Development
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

5. Preview production build
```bash
npm run preview
```

## Deployment to Firebase

1. Install Firebase CLI if you haven't already
```bash
npm install -g firebase-tools
```

2. Login to Firebase
```bash
firebase login
```

3. Initialize Firebase (if first time)
```bash
firebase init
```

4. Deploy to Firebase
```bash
npm run deploy
```

Or manually:
```bash
npm run build
firebase deploy
```

## Configuration

- You will need to provide an OpenAI API key when using the application
- The API key is stored in your browser's localStorage

## Tech Stack

- React
- Vite
- Tailwind CSS
- OpenAI Realtime API
- Firebase Hosting
