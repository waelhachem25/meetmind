import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const HeaderContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 28px;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active ? '#667eea' : 'white'};
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-1px);
  }
`;

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const VersionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  margin-left: 60px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    left: -42px;
    top: 32px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #667eea;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #667eea;
  }
`;

const VersionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const VersionNumber = styled.h2`
  color: #333;
  margin: 0;
  font-size: 24px;
`;

const VersionDate = styled.span`
  color: #999;
  font-size: 14px;
`;

const Badge = styled.span<{ type: 'new' | 'improvement' | 'fix' }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  margin-top: 8px;
  background: ${props => {
    switch (props.type) {
      case 'new': return '#e3f2fd';
      case 'improvement': return '#f3e5f5';
      case 'fix': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'new': return '#1976d2';
      case 'improvement': return '#7b1fa2';
      case 'fix': return '#388e3c';
      default: return '#666';
    }
  }};
`;

const ChangeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
`;

const ChangeItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  line-height: 1.6;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #333;
  }
`;

export default function Changelog() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'new' | 'improvement' | 'fix'>('all');

  const versions = [
    {
      version: 'v2.1.0',
      date: 'October 31, 2025',
      changes: [
        { type: 'new' as const, text: 'Added React Native mobile app with full feature parity' },
        { type: 'new' as const, text: 'Email verification system with 6-digit codes via Gmail SMTP' },
        { type: 'improvement' as const, text: 'Enhanced authentication with JWT token security' },
        { type: 'improvement' as const, text: 'Mobile app uses expo-secure-store for encrypted token storage' },
        { type: 'fix' as const, text: 'Fixed registration flow to properly verify emails before account creation' }
      ]
    },
    {
      version: 'v2.0.0',
      date: 'October 29, 2025',
      changes: [
        { type: 'new' as const, text: 'Complete authentication system with user accounts' },
        { type: 'new' as const, text: 'Multi-user support with personal meeting dashboards' },
        { type: 'new' as const, text: 'Profile management and logout functionality' },
        { type: 'improvement' as const, text: 'Redesigned UI with purple gradient theme' },
        { type: 'improvement' as const, text: 'Added user-specific meeting lists and permissions' }
      ]
    },
    {
      version: 'v1.5.0',
      date: 'October 25, 2025',
      changes: [
        { type: 'new' as const, text: 'PDF export feature for meeting minutes' },
        { type: 'new' as const, text: 'Professional PDF templates with branding' },
        { type: 'improvement' as const, text: 'Enhanced minutes generation with GPT-4' },
        { type: 'fix' as const, text: 'Fixed action item status updates not saving' }
      ]
    },
    {
      version: 'v1.4.0',
      date: 'October 22, 2025',
      changes: [
        { type: 'new' as const, text: 'Drag & drop file upload interface' },
        { type: 'new' as const, text: 'Upload progress tracking with real-time percentage' },
        { type: 'improvement' as const, text: 'Better error handling for large files (500MB limit)' },
        { type: 'improvement' as const, text: 'Status badges with color coding for meeting states' },
        { type: 'fix' as const, text: 'Fixed polling causing duplicate API calls' }
      ]
    },
    {
      version: 'v1.3.0',
      date: 'October 20, 2025',
      changes: [
        { type: 'new' as const, text: 'AI-powered meeting minutes generation' },
        { type: 'new' as const, text: 'Automatic extraction of agenda, key points, decisions' },
        { type: 'new' as const, text: 'Action item tracking with assignees and due dates' },
        { type: 'improvement' as const, text: 'Improved transcript editing experience' },
        { type: 'fix' as const, text: 'Fixed minutes not regenerating after transcript edits' }
      ]
    },
    {
      version: 'v1.2.0',
      date: 'October 18, 2025',
      changes: [
        { type: 'new' as const, text: 'Azure Whisper AI integration for transcription' },
        { type: 'new' as const, text: 'Background job processing with Hangfire' },
        { type: 'improvement' as const, text: 'Real-time transcription status updates' },
        { type: 'improvement' as const, text: 'Better handling of long audio files (up to 500MB)' },
        { type: 'fix' as const, text: 'Fixed database connection pooling issues' }
      ]
    },
    {
      version: 'v1.1.0',
      date: 'October 15, 2025',
      changes: [
        { type: 'new' as const, text: 'Meeting creation with metadata (title, date, participants)' },
        { type: 'new' as const, text: 'Audio file upload to Azure Blob Storage' },
        { type: 'improvement' as const, text: 'Added file type validation (MP3, WAV, M4A)' },
        { type: 'fix' as const, text: 'Fixed timezone handling for meeting dates' }
      ]
    },
    {
      version: 'v1.0.0',
      date: 'October 10, 2025',
      changes: [
        { type: 'new' as const, text: 'Initial release of MeetMind' },
        { type: 'new' as const, text: 'Basic meeting list and detail views' },
        { type: 'new' as const, text: '.NET 9.0 backend with SQL Server database' },
        { type: 'new' as const, text: 'React 19 frontend with TypeScript' }
      ]
    }
  ];

  const filteredVersions = versions.map(version => ({
    ...version,
    changes: filter === 'all' 
      ? version.changes 
      : version.changes.filter(change => change.type === filter)
  })).filter(version => version.changes.length > 0);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            ← Back to Dashboard
          </BackButton>
          <Title>Changelog</Title>
        </HeaderContent>
      </Header>

      <Content>
        <FilterBar>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All Changes
          </FilterButton>
          <FilterButton active={filter === 'new'} onClick={() => setFilter('new')}>
            🎉 New Features
          </FilterButton>
          <FilterButton active={filter === 'improvement'} onClick={() => setFilter('improvement')}>
            ⚡ Improvements
          </FilterButton>
          <FilterButton active={filter === 'fix'} onClick={() => setFilter('fix')}>
            🐛 Bug Fixes
          </FilterButton>
        </FilterBar>

        <Timeline>
          {filteredVersions.map((version, idx) => (
            <VersionCard key={idx}>
              <VersionHeader>
                <VersionNumber>{version.version}</VersionNumber>
                <VersionDate>{version.date}</VersionDate>
              </VersionHeader>
              <div>
                {version.changes.map((change, changeIdx) => (
                  <Badge key={changeIdx} type={change.type}>
                    {change.type === 'new' && '🎉 New'}
                    {change.type === 'improvement' && '⚡ Improved'}
                    {change.type === 'fix' && '🐛 Fixed'}
                  </Badge>
                ))}
              </div>
              <ChangeList>
                {version.changes.map((change, changeIdx) => (
                  <ChangeItem key={changeIdx}>
                    <strong>•</strong> {change.text}
                  </ChangeItem>
                ))}
              </ChangeList>
            </VersionCard>
          ))}
        </Timeline>
      </Content>
    </Container>
  );
}
