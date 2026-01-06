import { useState, useRef, type DragEvent } from "react";

interface FileUploadProps {
  meetingId: number;
  onUploadStart?: () => void;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ 
  meetingId, 
  onUploadStart, 
  onUploadSuccess, 
  onUploadError 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave"];
    const validExtensions = [".mp3", ".wav"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      onUploadError?.("Please select an MP3 or WAV file");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      onUploadError?.("File size must be less than 500MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      const { uploadAudioFile } = await import("../lib/api");
      await uploadAudioFile(meetingId, selectedFile, (p) => setProgress(p));
      
      onUploadSuccess?.();
      setSelectedFile(null);
      setProgress(0);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div style={{ width: "100%" }}>
      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#4CAF50" : "#ccc"}`,
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragging ? "#f0f8f0" : "#fafafa",
            transition: "all 0.3s ease",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎤</div>
          <div style={{ fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
            {isDragging ? "Drop your audio file here" : "Upload Audio File"}
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>
            Drag & drop or click to browse<br />
            Supports MP3 and WAV files (max 500MB)
          </div>
        </div>
      ) : (
        <div
          style={{
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "32px", marginRight: "12px" }}>🎵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
            {!uploading && (
              <button
                onClick={() => setSelectedFile(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {uploading && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", color: "#666" }}>Uploading...</span>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{progress}%</span>
              </div>
              <div
                style={{
                  height: "8px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#4CAF50",
                    width: `${progress}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <button
              onClick={handleUpload}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Upload & Process
            </button>
          )}
        </div>
      )}
    </div>
  );
}
