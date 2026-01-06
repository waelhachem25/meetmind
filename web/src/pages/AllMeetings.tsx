import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { listMeetings, type Meeting as APIMeeting } from "../lib/api";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 1200px;
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

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const SearchBar = styled.input`
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active ? '#667eea' : 'white'};

  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-2px);
  }
`;

const MeetingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const MeetingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const MeetingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const MeetingTitle = styled.h3`
  font-size: 1.25rem;
  color: #333;
  margin: 0;
  font-weight: 600;
  flex: 1;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#e8f5e9';
      case 'processing': return '#fff3e0';
      case 'failed': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#2e7d32';
      case 'processing': return '#f57c00';
      case 'failed': return '#c62828';
      default: return '#666';
    }
  }};
`;

const MeetingDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MeetingDescription = styled.p`
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const MeetingStats = styled.div`
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
`;

type FilterType = 'all' | 'completed' | 'processing' | 'failed';

function AllMeetings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [meetings, setMeetings] = useState<APIMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listMeetings();
      setMeetings(data);
    } catch (e) {
      console.error('Failed to load meetings:', e);
      setError(e instanceof Error ? e.message : "Failed to load meetings");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusName = (status: number): 'completed' | 'processing' | 'failed' | 'uploaded' => {
    const statusMap = {
      0: 'uploaded' as const,
      1: 'processing' as const,
      2: 'processing' as const,
      3: 'completed' as const,
      4: 'failed' as const,
    };
    return statusMap[status as keyof typeof statusMap] || 'uploaded';
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase());
    const statusName = getStatusName(meeting.status);
    const matchesFilter = filter === 'all' || statusName === filter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Container>
      <Content>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Dashboard
        </BackButton>

        <Header>
          <Title>All Meetings</Title>
          <Subtitle>
            View and manage all your meeting recordings, transcripts, and minutes
          </Subtitle>
        </Header>

        <Controls>
          <SearchBar
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            active={filter === 'completed'} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </FilterButton>
          <FilterButton 
            active={filter === 'processing'} 
            onClick={() => setFilter('processing')}
          >
            Processing
          </FilterButton>
          <FilterButton 
            active={filter === 'failed'} 
            onClick={() => setFilter('failed')}
          >
            Failed
          </FilterButton>
        </Controls>

        {loading ? (
          <EmptyState>
            <EmptyIcon>⏳</EmptyIcon>
            <EmptyTitle>Loading meetings...</EmptyTitle>
          </EmptyState>
        ) : error ? (
          <EmptyState>
            <EmptyIcon>❌</EmptyIcon>
            <EmptyTitle>Error loading meetings</EmptyTitle>
            <EmptyText>{error}</EmptyText>
            <UploadButton onClick={loadMeetings}>
              Try Again
            </UploadButton>
          </EmptyState>
        ) : filteredMeetings.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📁</EmptyIcon>
            <EmptyTitle>No meetings found</EmptyTitle>
            <EmptyText>
              {searchQuery ? 'Try adjusting your search' : 'Upload your first meeting to get started'}
            </EmptyText>
            {!searchQuery && (
              <UploadButton onClick={() => navigate('/upload')}>
                Upload Meeting
              </UploadButton>
            )}
          </EmptyState>
        ) : (
          <MeetingsGrid>
            {filteredMeetings.map(meeting => {
              const statusName = getStatusName(meeting.status);
              const statusConfig = {
                uploaded: { icon: '📤', label: 'Uploaded' },
                processing: { icon: '⟳', label: 'Processing' },
                completed: { icon: '✓', label: 'Completed' },
                failed: { icon: '✗', label: 'Failed' }
              };
              const config = statusConfig[statusName];
              
              return (
                <MeetingCard key={meeting.id} onClick={() => navigate('/dashboard')}>
                  <MeetingHeader>
                    <MeetingTitle>{meeting.title}</MeetingTitle>
                    <StatusBadge status={statusName}>
                      {config.icon} {config.label}
                    </StatusBadge>
                  </MeetingHeader>
                  
                  <MeetingDate>
                    📅 {formatDate(meeting.dateUtc)}
                  </MeetingDate>
                  
                  <MeetingDescription>
                    Meeting #{meeting.id} - {config.label}
                  </MeetingDescription>
                  
                  <MeetingStats>
                    <Stat>
                      <StatLabel>Created</StatLabel>
                      <StatValue>{new Date(meeting.createdAt).toLocaleDateString()}</StatValue>
                    </Stat>
                    <Stat>
                      <StatLabel>Status</StatLabel>
                      <StatValue>{config.label}</StatValue>
                    </Stat>
                    <Stat>
                      <StatLabel>ID</StatLabel>
                      <StatValue>#{meeting.id}</StatValue>
                    </Stat>
                  </MeetingStats>
                </MeetingCard>
              );
            })}
          </MeetingsGrid>
        )}
      </Content>
    </Container>
  );
}

export default AllMeetings;
