import React, { useState } from "react";
import Recorder from "./components/Recorder";
import RecordingList from "./components/RecordingList";
import "./App.css";

function App() {
  const [refresh, setRefresh] = useState(0);

  const handleUploadSuccess = () => {
    setRefresh(prev => prev + 1); // Increment to trigger refresh
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="icon">🎥</span>
            Screen Recorder Studio
          </h1>
          <p className="app-subtitle">Record, save, and manage your screen recordings</p>
        </div>
      </header>
      
      <main className="app-main">
        <div className="content-grid">
          <div className="recorder-section">
            <Recorder onUploadSuccess={handleUploadSuccess} />
          </div>
          
          <div className="recordings-section">
            <RecordingList key={refresh} refresh={refresh} />
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2024 Screen Recorder Studio. Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;