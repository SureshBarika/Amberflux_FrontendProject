import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RecordingList.css";

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const RecordingList = ({ refresh }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("/");
      
      if (response.data.success) {
        setRecordings(response.data.data || []);
      } else {
        setError("Failed to fetch recordings");
      }
    } catch (err) {
      console.error("Failed to fetch recordings", err);
      setError(err.response?.data?.error || "Failed to fetch recordings");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecording = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) {
      return;
    }

    try {
      setDeletingId(id);
      
      const response = await axios.delete(`/api/recordings/${id}`);
      
      if (response.data.success) {
        // Remove from local state
        setRecordings(prev => prev.filter(rec => rec.id !== id));
      } else {
        alert("Failed to delete recording");
      }
    } catch (err) {
      console.error("Failed to delete recording:", err);
      alert(err.response?.data?.error || "Failed to delete recording");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoUrl = (filename) => {
    return `${API_BASE_URL}/uploads/${filename}`;
  };

  useEffect(() => {
    fetchRecordings();
  }, [refresh]);

  if (loading) {
    return (
      <div className="recordings-container">
        <div className="recordings-header">
          <h2>📁 Uploaded Recordings</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading recordings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recordings-container">
        <div className="recordings-header">
          <h2>📁 Uploaded Recordings</h2>
        </div>
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Error: {error}</p>
          <button className="btn btn-retry" onClick={fetchRecordings}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recordings-container">
      <div className="recordings-header">
        <h2>📁 Uploaded Recordings</h2>
        <div className="recordings-count">
          {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
        </div>
      </div>

      {recordings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No recordings yet</h3>
          <p>Upload your first screen recording to get started!</p>
        </div>
      ) : (
        <div className="recordings-grid">
          {recordings.map((recording) => (
            <div key={recording.id} className="recording-card">
              <div className="card-header">
                <h3 className="recording-title">
                  {recording.originalName || recording.filename}
                </h3>
                <button
                  className="btn-delete"
                  onClick={() => deleteRecording(recording.id)}
                  disabled={deletingId === recording.id}
                  title="Delete recording"
                >
                  {deletingId === recording.id ? "🔄" : "🗑️"}
                </button>
              </div>

              <div className="video-wrapper">
                <video 
                  src={getVideoUrl(recording.filename)}
                  controls 
                  className="recording-video"
                  preload="metadata"
                  poster="" // You can add a thumbnail if available
                />
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <span className="detail-label">📊 Size:</span>
                  <span className="detail-value">{formatFileSize(recording.size)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">📅 Created:</span>
                  <span className="detail-value">{formatDate(recording.createdAt)}</span>
                </div>

                {recording.mimetype && (
                  <div className="detail-item">
                    <span className="detail-label">🎞️ Type:</span>
                    <span className="detail-value">{recording.mimetype}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <a
                  href={getVideoUrl(recording.filename)}
                  download={recording.originalName || recording.filename}
                  className="btn btn-download-small"
                  title="Download recording"
                >
                  💾 Download
                </a>
                
                <button
                  className="btn btn-view"
                  onClick={() => window.open(getVideoUrl(recording.filename), '_blank')}
                  title="View in new tab"
                >
                  👁️ View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recordings.length > 0 && (
        <div className="recordings-footer">
          <button className="btn btn-refresh" onClick={fetchRecordings}>
            🔄 Refresh List
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordingList;