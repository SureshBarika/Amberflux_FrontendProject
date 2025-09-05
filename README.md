# Amberflux Screen Recorder Frontend

This is the frontend application for the Amberflux Screen Recorder project.

## Overview
This React-based web app allows users to record their screen, view a list of saved recordings, and interact with the backend server to upload and manage recordings.

## Features
- Start, stop, and save screen recordings
- View a list of previous recordings
- Download or play recordings
- Modern, responsive UI

## Project Structure
- `src/` - Main source code
  - `components/Recorder.js` - Screen recording component
  - `components/RecordingList.js` - List and playback of recordings
  - `App.js` - Main app logic
  - `App.css` - Styles
- `public/` - Static assets and HTML template

## Local Setup Instructions

### Prerequisites
- Node.js and npm installed
- Backend server set up and running (see backend README)

### Steps
1. Open a terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm start
   ```
   The app will run at [http://localhost:3000](http://localhost:3000).

4. Make sure the backend server is running so the frontend can communicate with it for uploading and fetching recordings.

### Troubleshooting
- If you encounter issues connecting to the backend, check the API URLs in `Recorder.js` and `RecordingList.js`.
- Ensure both frontend and backend are running on compatible ports and hosts.

---
For more details, see the main project README.
