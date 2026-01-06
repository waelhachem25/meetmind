import { useEffect, useState } from "react";
import { getMeeting, getTranscript, getMinutes, MeetingStatus, type Meeting, type Transcript, type Minutes, type ActionItem, API_URL } from "../lib/api";
import FileUpload from "../components/FileUpload";

interface MeetingDetailProps {
  meetingId: number;
  onBack: () => void;
}

export default function MeetingDetail({ meetingId, onBack }: MeetingDetailProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [minutes, setMinutes] = useState<Minutes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [polling, setPolling] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = async () => {
    try {
      // First, get the meeting data
      const meetingData = await getMeeting(meetingId);
      setMeeting(meetingData);
      
      // Status meanings:
      // 0 = Draft (no audio uploaded yet)
      // 1 = Processing (transcribing audio)
      // 2 = Summarizing (generating minutes from transcript)
      // 3 = Completed (both transcript and minutes ready)
      // 4 = Error
      
      if (meetingData.status === 0) {
        // Draft meeting - no audio, so no transcript/minutes
        setTranscript(null);
        setMinutes(null);
        setPolling(false);
      } else if (meetingData.status === 1) {
        // Processing - transcript might not be ready yet, don't fetch to avoid 404s
        // Just keep showing loading state and polling
        setPolling(true);
      } else if (meetingData.status === 2) {
        // Summarizing - transcript is ready, minutes might not be yet
        const transcriptData = await getTranscript(meetingId).catch(() => null);
        setTranscript(transcriptData);
        setMinutes(null); // Don't fetch minutes yet to avoid 404
        setPolling(true);
      } else if (meetingData.status === 3) {
        // Completed - both should be available
        const [transcriptData, minutesData] = await Promise.all([
          getTranscript(meetingId).catch(() => null),
          getMinutes(meetingId).catch(() => null),
        ]);
        setTranscript(transcriptData);
        setMinutes(minutesData);
        setPolling(false);
      } else {
        // Error state
        setTranscript(null);
        setMinutes(null);
        setPolling(false);
      }
      
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load meeting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // Poll for updates when processing
  useEffect(() => {
    if (!polling) return;
    
    // Poll every 5 seconds instead of 3
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling, meetingId]);

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    setPolling(true);
    setTimeout(() => setUploadSuccess(false), 3000);
    fetchData();
  };

  const handleEditTranscript = () => {
    if (transcript) {
      setEditedText(transcript.text);
      setEditingTranscript(true);
    }
  };

  const handleSaveTranscript = async () => {
    if (!editedText.trim()) return;
    
    setRegenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/meetings/${meetingId}/transcript`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editedText }),
      });
      
      if (!res.ok) throw new Error('Failed to update transcript');
      
      setEditingTranscript(false);
      setPolling(true);
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update transcript");
    } finally {
      setRegenerating(false);
    }
  };

  const handleUpdateActionItem = async (actionId: number, updates: { assignedTo?: string; dueDate?: string; status?: number }) => {
    try {
      const res = await fetch(`${API_URL}/api/action-items/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) throw new Error('Failed to update action item');
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update action item");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/meetings/${meetingId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meetingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleDownloadMarkdown = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/meetings/${meetingId}/markdown`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download Markdown');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meetingId}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading Markdown:', error);
      alert('Failed to download Markdown. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <div>Loading meeting...</div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div style={{ padding: "40px" }}>
        <button onClick={onBack} style={{ marginBottom: "20px" }}>← Back</button>
        <div style={{ color: "red" }}>{error || "Meeting not found"}</div>
      </div>
    );
  }

  const statusText = MeetingStatus[meeting.status as keyof typeof MeetingStatus];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <button 
          onClick={onBack} 
          style={{ 
            background: "none", 
            border: "1px solid #ccc", 
            padding: "8px 16px", 
            borderRadius: "6px", 
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          ← Back to Meetings
        </button>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: "0 0 8px 0" }}>{meeting.title}</h1>
            <div style={{ color: "#666", display: "flex", gap: "16px", alignItems: "center" }}>
              <span>📅 {new Date(meeting.dateUtc).toLocaleDateString()}</span>
              <span style={{ 
                padding: "4px 12px", 
                borderRadius: "12px", 
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: meeting.status === 3 ? "#e8f5e9" : meeting.status === 4 ? "#ffebee" : "#fff3e0",
                color: meeting.status === 3 ? "#2e7d32" : meeting.status === 4 ? "#c62828" : "#e65100"
              }}>
                {statusText}
              </span>
            </div>
          </div>
          
          {/* Export Buttons - Requirement #5 */}
          {meeting.status === 3 && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                📄 Export PDF
              </button>
              <button
                onClick={handleDownloadMarkdown}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#424242",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                📝 Export Markdown
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Success Message */}
      {uploadSuccess && (
        <div style={{
          backgroundColor: "#e8f5e9",
          border: "1px solid #4CAF50",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          color: "#2e7d32"
        }}>
          ✅ File uploaded successfully! Processing has started...
        </div>
      )}

      {/* File Upload Section */}
      {meeting.status === 0 && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            backgroundColor: "#e3f2fd",
            border: "1px solid #1976d2",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            color: "#0d47a1"
          }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>📁 No Audio File Yet</h3>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
              This meeting doesn't have an audio recording yet. Upload an audio file below to automatically generate a transcript and meeting minutes.
            </p>
          </div>
          <h2 style={{ marginBottom: "16px" }}>Upload Audio Recording</h2>
          <FileUpload
            meetingId={meetingId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(err) => setError(err)}
          />
        </div>
      )}

      {/* Processing Status */}
      {(meeting.status === 1 || meeting.status === 2) && (
        <div style={{
          backgroundColor: "#fff3e0",
          border: "1px solid #ff9800",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "32px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
          <h3 style={{ margin: "0 0 8px 0" }}>
            {meeting.status === 1 ? "Transcribing Audio..." : "Generating Summary..."}
          </h3>
          <p style={{ color: "#666", margin: "0 0 12px 0" }}>
            This usually takes a few moments. The page will update automatically.
          </p>
          <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
            💡 <strong>Tip:</strong> Local Whisper transcription can take 5-15 minutes for longer meetings. 
            {meeting.status === 1 && " The first transcription downloads the AI model (~75MB)."}
          </p>
        </div>
      )}

      {/* Transcript Section - Requirement #4: Edit Transcript */}
      {transcript && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>📝 Transcript</h2>
            {!editingTranscript && meeting.status === 3 && (
              <button
                onClick={handleEditTranscript}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#fff",
                  border: "1px solid #1976d2",
                  color: "#1976d2",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ✏️ Edit Transcript
              </button>
            )}
          </div>
          
          {editingTranscript ? (
            <div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "300px",
                  padding: "16px",
                  border: "2px solid #1976d2",
                  borderRadius: "8px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "14px",
                  lineHeight: "1.8",
                  resize: "vertical"
                }}
              />
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSaveTranscript}
                  disabled={regenerating}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: regenerating ? "#ccc" : "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: regenerating ? "not-allowed" : "pointer"
                  }}
                >
                  {regenerating ? "⚙️ Regenerating Minutes..." : "💾 Save & Regenerate Minutes"}
                </button>
                <button
                  onClick={() => setEditingTranscript(false)}
                  disabled={regenerating}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    cursor: regenerating ? "not-allowed" : "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "20px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
              {transcript.text}
            </div>
          )}
        </div>
      )}

      {/* Minutes/Summary Section - Requirement #2 */}
      {minutes && (
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ marginBottom: "16px" }}>📋 Meeting Minutes</h2>
          
          {/* Agenda */}
          {minutes.agenda && minutes.agenda.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", fontWeight: 600 }}>📌 Agenda</h3>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {minutes.agenda.map((item: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.6" }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Points */}
          {minutes.keyPoints && minutes.keyPoints.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", fontWeight: 600 }}>💡 Key Points</h3>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {minutes.keyPoints.map((point: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.6" }}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Decisions */}
          {minutes.decisions && minutes.decisions.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", fontWeight: 600 }}>✅ Decisions Made</h3>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {minutes.decisions.map((decision: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.6" }}>{decision}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items - Requirement #3: Assign Owners/Dates */}
          {minutes.actionItems && minutes.actionItems.length > 0 && (
            <div>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", fontWeight: 600 }}>🎯 Action Items</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {minutes.actionItems.map((action: ActionItem) => (
                  <ActionItemCard 
                    key={action.id} 
                    action={action} 
                    onUpdate={handleUpdateActionItem}
                    isEditable={meeting.status === 3}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {meeting.status === 4 && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            backgroundColor: "#ffebee",
            border: "1px solid #c62828",
            borderRadius: "8px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "16px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#c62828" }}>Processing Error</h3>
            <p style={{ color: "#666", margin: "0 0 16px 0" }}>
              There was an error processing your audio file. You can upload the audio again below.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              🔄 Refresh Page
            </button>
          </div>
          
          {/* Re-upload section */}
          <div>
            <h2 style={{ marginBottom: "16px" }}>Re-upload Audio</h2>
            <FileUpload
              meetingId={meetingId}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(err) => setError(err)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Requirement #3: Action Item Card with Inline Editing
interface ActionItemCardProps {
  action: ActionItem;
  onUpdate: (id: number, updates: { assignedTo?: string; dueDate?: string; status?: number }) => Promise<void>;
  isEditable: boolean;
}

function ActionItemCard({ action, onUpdate, isEditable }: ActionItemCardProps) {
  const [editing, setEditing] = useState(false);
  const [assignedTo, setAssignedTo] = useState(action.assignedTo || "");
  const [dueDate, setDueDate] = useState(action.dueDate ? action.dueDate.split('T')[0] : "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(action.id, { assignedTo, dueDate });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = action.status === 2 ? 0 : 2; // Toggle between Pending and Completed
    await onUpdate(action.id, { status: newStatus });
  };

  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <input
          type="checkbox"
          checked={action.status === 2}
          onChange={handleToggleStatus}
          disabled={!isEditable}
          style={{ width: "20px", height: "20px", marginTop: "2px", flexShrink: 0, cursor: isEditable ? "pointer" : "not-allowed" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: "8px", lineHeight: "1.5" }}>
            {action.description}
          </div>
          
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              <input
                type="text"
                placeholder="Assigned to..."
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "14px", color: "#666", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              {action.assignedTo && <span>👤 {action.assignedTo}</span>}
              {action.dueDate && <span>📅 Due: {new Date(action.dueDate).toLocaleDateString()}</span>}
              <span style={{
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                backgroundColor: action.status === 2 ? "#e8f5e9" : "#fff3e0",
                color: action.status === 2 ? "#2e7d32" : "#e65100"
              }}>
                {action.status === 0 ? "Pending" : action.status === 1 ? "In Progress" : "Completed"}
              </span>
              {isEditable && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#fff",
                    border: "1px solid #1976d2",
                    color: "#1976d2",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}