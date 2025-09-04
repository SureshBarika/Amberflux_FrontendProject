import React, { useState } from "react";
import Recorder from "./components/Recorder";
import RecordingList from "./components/RecordingList";
import "./App.css";

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleUploadSuccess = () => {
    setRefresh(!refresh); // toggle refresh to reload recordings list
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }} className="app-container">
      <h1 className="app-header">Screen Recorder App</h1>
      <Recorder onUploadSuccess={handleUploadSuccess} />
      <RecordingList key={refresh} />
    </div>
  );
}

export default App;
