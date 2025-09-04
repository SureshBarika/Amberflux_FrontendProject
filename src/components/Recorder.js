import React, { useState, useRef, useEffect } from "react";
import "./Recorder.css";
import axios from "axios";

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const Recorder = ({ onUploadSuccess }) => {
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoURL, setVideoURL] = useState(null);
  const [timer, setTimer] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Get screen capture
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      // Get microphone audio (optional)
      let audioStream = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
      } catch (audioErr) {
        console.warn("Microphone access denied, recording without mic audio:", audioErr);
      }

      // Combine streams
      const tracks = [...screenStream.getTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getTracks());
      }
      
      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Setup MediaRecorder
      const options = { 
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      };
      
      // Fallback if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(combinedStream, options);

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedChunks(chunks);
        setVideoURL(URL.createObjectURL(blob));
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
      };

      // Handle stream ending (user stops sharing)
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setRecording(true);
      setTimer(0);
      startTimer();

    } catch (err) {
      console.error("Error starting recording:", err);
      setError(`Failed to start recording: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopTimer();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const resetRecording = () => {
    setRecordedChunks([]);
    setVideoURL(null);
    setTimer(0);
    setError(null);
    setUploadProgress(0);
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadRecording = async () => {
    if (recordedChunks.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const formData = new FormData();
      formData.append("recording", blob, `recording-${Date.now()}.webm`);

      const response = await axios.post("/", formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        alert("✅ Recording uploaded successfully!");
        if (onUploadSuccess) onUploadSuccess();
        resetRecording();
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(`Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="recorder-container">
      <div className="recorder-header">
        <h2 className="recorder-title">
          <span className="icon">🎬</span>
          Screen & Audio Recorder
        </h2>
      </div>

      <div className="recorder-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="timer-display">
          <div className="timer-circle">
            <span className="timer-text">{formatTime(timer)}</span>
            {recording && <div className="recording-pulse"></div>}
          </div>
          {recording && <p className="recording-status">Recording in progress...</p>}
        </div>

        <div className="controls">
          {!recording ? (
            <button 
              className="btn btn-start" 
              onClick={startRecording}
              disabled={uploading}
            >
              <span className="btn-icon">🎯</span>
              Start Recording
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopRecording}>
              <span className="btn-icon">⏹️</span>
              Stop Recording
            </button>
          )}
        </div>

        {videoURL && (
          <div className="preview-section">
            <h3>Recording Preview</h3>
            <div className="video-container">
              <video 
                src={videoURL} 
                controls 
                className="preview-video"
                preload="metadata"
              />
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn btn-download" 
                onClick={downloadRecording}
                disabled={uploading}
              >
                <span className="btn-icon">💾</span>
                Download
              </button>
              
              <button 
                className="btn btn-upload" 
                onClick={uploadRecording}
                disabled={uploading}
              >
                <span className="btn-icon">☁️</span>
                {uploading ? `Uploading ${uploadProgress}%` : 'Upload to Server'}
              </button>
              
              <button 
                className="btn btn-reset" 
                onClick={resetRecording}
                disabled={uploading}
              >
                <span className="btn-icon">🔄</span>
                New Recording
              </button>
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;