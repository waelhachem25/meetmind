import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createMeeting, uploadAudioFile } from "../lib/api";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  color: white;
  margin-bottom: 3rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-4px);
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;

  @media (max-width: 560px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.95;
  line-height: 1.6;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;

  @media (max-width: 560px) {
    padding: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const UploadArea = styled.div<{ $isDragging: boolean }>`
  border: 3px dashed ${props => props.$isDragging ? '#667eea' : '#e0e0e0'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(102, 126, 234, 0.05)' : '#f9f9f9'};
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const UploadHint = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const FileInput = styled.input`
  display: none;
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 8px;
  margin-top: 1rem;
`;

const FileName = styled.span`
  flex: 1;
  font-weight: 500;
  color: #333;
`;

const FileSize = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: #cc0000;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
`;

const InfoTitle = styled.h3`
  color: #1976d2;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const InfoText = styled.p`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
`;

const InfoList = styled.ul`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.8;
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
`;

const ProgressContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
`;

const StatusText = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin: 0.5rem 0;
  text-align: center;
`;

function UploadMeeting() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFileSelect = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'video/mp4'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      alert('Please upload a valid audio file (MP3, WAV, M4A, MP4)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 500MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a meeting title');
      return;
    }

    if (!selectedFile) {
      alert('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Create the meeting record
      setStatusMessage('Creating meeting...');
      const meeting = await createMeeting(title, new Date().toISOString());
      
      // Step 2: Upload the audio file with progress tracking
      setStatusMessage('Uploading audio file...');
      await uploadAudioFile(meeting.id, selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      setStatusMessage('Upload complete! Redirecting...');
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload meeting';
      alert(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      setStatusMessage('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Container>
      <Content>
        <BackButton onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </BackButton>

        <Header>
          <Title>Upload Meeting</Title>
          <Subtitle>
            Upload your meeting audio and we'll generate clean transcripts and AI-powered minutes
          </Subtitle>
        </Header>

        <Card>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Q4 Planning Meeting"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description (Optional)</Label>
              <TextArea
                id="description"
                placeholder="Brief description of the meeting topics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="participants">Participants (Optional)</Label>
              <Input
                id="participants"
                type="text"
                placeholder="e.g., John, Sarah, Mike"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Audio File *</Label>
              <UploadArea
                $isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon>🎤</UploadIcon>
                <UploadText>
                  {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </UploadText>
                <UploadHint>Supports MP3, WAV, M4A, MP4 (Max 500MB)</UploadHint>
              </UploadArea>
              <FileInput
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/mp4"
                onChange={handleFileInputChange}
              />
              
              {selectedFile && (
                <SelectedFile>
                  <span>📄</span>
                  <FileName>{selectedFile.name}</FileName>
                  <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                  <RemoveButton onClick={() => setSelectedFile(null)}>
                    Remove
                  </RemoveButton>
                </SelectedFile>
              )}
            </FormGroup>

            <SubmitButton type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload & Process'}
            </SubmitButton>
          </Form>

          {isUploading && (
            <ProgressContainer>
              <StatusText>{statusMessage}</StatusText>
              <ProgressBar>
                <ProgressFill $progress={uploadProgress} />
              </ProgressBar>
              <StatusText>{uploadProgress}% complete</StatusText>
            </ProgressContainer>
          )}

          <InfoBox>
            <InfoTitle>📊 What happens next?</InfoTitle>
            <InfoList>
              <li><strong>Transcription:</strong> Azure Speech Service transcribes your audio</li>
              <li><strong>AI Processing:</strong> GPT-4 extracts key insights, decisions, and action items</li>
              <li><strong>Minutes Generation:</strong> Professional meeting minutes are created</li>
              <li><strong>PDF Export:</strong> Download a polished PDF document</li>
            </InfoList>
            <InfoText style={{ marginTop: '0.5rem' }}>
              ⏱️ Processing time: 2-5 minutes depending on audio length
            </InfoText>
          </InfoBox>
        </Card>
      </Content>
    </Container>
  );
}

export default UploadMeeting;
