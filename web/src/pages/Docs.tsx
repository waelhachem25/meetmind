import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
`;

const Sidebar = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

const SidebarTitle = styled.h3`
  color: #667eea;
  margin: 0 0 20px 0;
  font-size: 18px;
`;

const NavSection = styled.div`
  margin-bottom: 24px;
`;

const NavTitle = styled.div`
  color: #333;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  padding: 8px 12px;
  color: ${props => props.$active ? '#667eea' : '#666'};
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
`;

const Main = styled.div`
  flex: 1;
  padding: 40px;
  max-width: 900px;

  @media (max-width: 900px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  background: #667eea;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 16px;
  transition: all 0.2s;

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
  }
`;

const Title = styled.h1`
  color: #333;
  margin: 0 0 12px 0;
  font-size: 32px;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
`;

const Content = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  h2 {
    color: #333;
    margin: 32px 0 16px 0;
    font-size: 24px;
    padding-bottom: 8px;
    border-bottom: 2px solid #667eea;
  }

  h3 {
    color: #444;
    margin: 24px 0 12px 0;
    font-size: 20px;
  }

  p {
    color: #666;
    line-height: 1.8;
    margin: 0 0 16px 0;
  }

  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    color: #d63384;
  }

  pre {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  ul, ol {
    color: #666;
    line-height: 1.8;
    margin: 0 0 16px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
  }
`;

const CodeBlock = styled.pre`
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 4px;

  strong {
    color: #1976d2;
  }
`;

const WarningBox = styled.div`
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 4px;

  strong {
    color: #f57c00;
  }
`;

export default function Docs() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('quick-start');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Container>
      <Sidebar>
        <SidebarTitle>Documentation</SidebarTitle>
        
        <NavSection>
          <NavTitle>Getting Started</NavTitle>
          <NavItem $active={activeSection === 'quick-start'} onClick={() => scrollToSection('quick-start')}>
            Quick Start
          </NavItem>
          <NavItem $active={activeSection === 'installation'} onClick={() => scrollToSection('installation')}>
            Installation
          </NavItem>
        </NavSection>

        <NavSection>
          <NavTitle>Core Features</NavTitle>
          <NavItem $active={activeSection === 'upload'} onClick={() => scrollToSection('upload')}>
            Upload Audio
          </NavItem>
          <NavItem $active={activeSection === 'transcription'} onClick={() => scrollToSection('transcription')}>
            Transcription
          </NavItem>
          <NavItem $active={activeSection === 'minutes'} onClick={() => scrollToSection('minutes')}>
            Meeting Minutes
          </NavItem>
        </NavSection>

        <NavSection>
          <NavTitle>API Reference</NavTitle>
          <NavItem $active={activeSection === 'api-auth'} onClick={() => scrollToSection('api-auth')}>
            Authentication
          </NavItem>
          <NavItem $active={activeSection === 'api-meetings'} onClick={() => scrollToSection('api-meetings')}>
            Meetings API
          </NavItem>
        </NavSection>

        <NavSection>
          <NavTitle>Advanced</NavTitle>
          <NavItem $active={activeSection === 'deployment'} onClick={() => scrollToSection('deployment')}>
            Deployment
          </NavItem>
          <NavItem $active={activeSection === 'troubleshooting'} onClick={() => scrollToSection('troubleshooting')}>
            Troubleshooting
          </NavItem>
        </NavSection>
      </Sidebar>

      <Main>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            ← Back to Dashboard
          </BackButton>
          <Title>MeetMind Documentation</Title>
          <Subtitle>
            Complete guide to using MeetMind for intelligent meeting management
          </Subtitle>
        </Header>

        <Content>
          <h2 id="quick-start">🚀 Quick Start</h2>
          <p>
            Get started with MeetMind in just a few minutes. This guide will walk you through the
            basics of uploading audio, viewing transcripts, and exporting meeting minutes.
          </p>

          <h3>1. Create Your Account</h3>
          <p>
            Sign up with your email address and verify your account. You'll receive a 6-digit
            verification code to complete registration.
          </p>

          <h3>2. Create a Meeting</h3>
          <p>
            Click "New Meeting" on your dashboard and fill in the meeting details:
          </p>
          <ul>
            <li><strong>Title:</strong> Name your meeting</li>
            <li><strong>Date & Time:</strong> When the meeting took place</li>
            <li><strong>Duration:</strong> Estimated length in minutes</li>
            <li><strong>Location:</strong> Physical or virtual meeting location</li>
            <li><strong>Participants:</strong> Who attended the meeting</li>
          </ul>

          <h3 id="upload">3. Upload Audio</h3>
          <p>
            Drag and drop your audio file or click to browse. Supported formats include:
          </p>
          <CodeBlock>
            Supported: MP3, WAV, M4A, FLAC, OGG
            Max Size: 500MB
            Recommended: Clear audio with minimal background noise
          </CodeBlock>

          <InfoBox>
            <strong>💡 Pro Tip:</strong> For best results, use audio recorded with a good microphone
            in a quiet environment. Speaker clarity significantly impacts transcription accuracy.
          </InfoBox>

          <h2 id="installation">⚙️ Installation</h2>
          <p>
            MeetMind is a web-based application - no installation required! Simply:
          </p>
          <ol>
            <li>Visit the MeetMind website</li>
            <li>Create your account</li>
            <li>Start uploading meetings</li>
          </ol>
          <InfoBox>
            <strong>💡 Self-Hosting:</strong> Want to run MeetMind on your own infrastructure? 
            Check out the <a href="#deployment" onClick={(e) => { e.preventDefault(); scrollToSection('deployment'); }} style={{ color: '#667eea', cursor: 'pointer' }}>Deployment</a> section for detailed setup instructions.
          </InfoBox>

          <h2 id="transcription">📝 Transcription</h2>
          <p>
            MeetMind uses Azure Whisper AI for highly accurate speech-to-text transcription.
            The process is fully automated:
          </p>
          <ol>
            <li>Upload completes → Status changes to "Transcribing"</li>
            <li>AI processes audio (typically 1-2 minutes per hour of audio)</li>
            <li>Transcript appears in the meeting detail view</li>
            <li>Minutes are automatically generated from the transcript</li>
          </ol>

          <h3>Editing Transcripts</h3>
          <p>
            You can edit any transcript to correct errors or add missing context. Changes are
            saved automatically and versioned for your records.
          </p>

          <h2 id="minutes">📊 Meeting Minutes</h2>
          <p>
            AI-generated meeting minutes include:
          </p>
          <ul>
            <li><strong>Agenda:</strong> Main topics discussed</li>
            <li><strong>Key Points:</strong> Important discussion highlights</li>
            <li><strong>Decisions:</strong> Conclusions and agreements reached</li>
            <li><strong>Action Items:</strong> Tasks with assignees and due dates</li>
          </ul>

          <h3>Action Item Management</h3>
          <p>
            Track action items with status indicators:
          </p>
          <ul>
            <li>🟡 <strong>Pending:</strong> Not started</li>
            <li>🔵 <strong>In Progress:</strong> Currently being worked on</li>
            <li>🟢 <strong>Completed:</strong> Finished</li>
            <li>🔴 <strong>Cancelled:</strong> No longer needed</li>
          </ul>

          <h2 id="api-auth">🔌 API Reference</h2>
          <p>
            MeetMind provides a RESTful API for programmatic access. All endpoints require
            JWT authentication.
          </p>

          <h3>Authentication</h3>
          <CodeBlock>{`POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-verification-code
POST /api/auth/verify-email

// Example Login Request
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}`}</CodeBlock>

          <h3 id="api-meetings">Meetings Endpoints</h3>
          <CodeBlock>{`GET    /api/meetings           // List all meetings
POST   /api/meetings           // Create new meeting
GET    /api/meetings/{id}      // Get meeting details
PUT    /api/meetings/{id}      // Update meeting
DELETE /api/meetings/{id}      // Delete meeting
POST   /api/meetings/{id}/upload  // Upload audio

// All requests require Authorization header:
Authorization: Bearer YOUR_JWT_TOKEN`}</CodeBlock>

          <WarningBox>
            <strong>⚠️ Security:</strong> Never expose your JWT tokens in client-side code or
            public repositories. Store tokens securely and use HTTPS in production.
          </WarningBox>

          <h2 id="deployment">🚀 Deployment</h2>
          <p>
            MeetMind is designed to run anywhere. Recommended setup:
          </p>
          <ul>
            <li><strong>Backend:</strong> .NET 9.0 on Azure App Service or Docker</li>
            <li><strong>Database:</strong> SQL Server (Azure SQL or on-premise)</li>
            <li><strong>Storage:</strong> Azure Blob Storage for audio files</li>
            <li><strong>Frontend:</strong> Static hosting (Vercel, Netlify, Azure Static Web Apps)</li>
          </ul>

          <h3>Environment Variables</h3>
          <CodeBlock>{`# Backend (.NET API)
ConnectionStrings__DefaultConnection="Your SQL Server connection"
Storage__ConnectionString="Azure Blob Storage connection"
JwtSettings__SecretKey="Your secret key"
Email__SmtpHost="smtp.gmail.com"
Email__SmtpPort="587"
Email__Username="your@email.com"
Email__Password="app_password"

# Frontend (React/Vite)
VITE_API_URL="https://your-api.azurewebsites.net"`}</CodeBlock>

          <h2 id="troubleshooting">🔧 Troubleshooting</h2>
          
          <h3>Upload Fails</h3>
          <p>
            If file upload fails, check:
          </p>
          <ul>
            <li>File size is under 500MB</li>
            <li>File format is supported (MP3, WAV, M4A)</li>
            <li>Internet connection is stable</li>
            <li>Backend API is running and accessible</li>
          </ul>

          <h3>Transcription Stuck</h3>
          <p>
            If transcription takes too long:
          </p>
          <ul>
            <li>Check Hangfire dashboard at <code>/hangfire</code></li>
            <li>Verify Azure Whisper credentials are configured</li>
            <li>Check backend logs for errors</li>
            <li>Ensure background job server is running</li>
          </ul>

          <h3>Login Issues</h3>
          <p>
            Cannot log in? Try:
          </p>
          <ul>
            <li>Verify email address is correct</li>
            <li>Check if account is verified (check email for code)</li>
            <li>Reset password if forgotten</li>
            <li>Clear browser cache and cookies</li>
          </ul>

          <InfoBox>
            <strong>📧 Need More Help?</strong> Contact support at support@meetmind.app or
            visit our Help Center for detailed guides and FAQs.
          </InfoBox>
        </Content>
      </Main>
    </Container>
  );
}
