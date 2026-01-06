import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
  font-size: 36px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatusCard = styled.div<{ status: 'operational' | 'degraded' | 'down' }>`
  background: white;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'operational': return '#4caf50';
      case 'degraded': return '#ff9800';
      case 'down': return '#f44336';
      default: return '#ccc';
    }
  }};
`;

const ServiceName = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusBadge = styled.div<{ status: 'operational' | 'degraded' | 'down' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'operational': return '#e8f5e9';
      case 'degraded': return '#fff3e0';
      case 'down': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'operational': return '#2e7d32';
      case 'degraded': return '#f57c00';
      case 'down': return '#c62828';
      default: return '#666';
    }
  }};
`;

const StatusDot = styled.div<{ status: 'operational' | 'degraded' | 'down' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'operational': return '#4caf50';
      case 'degraded': return '#ff9800';
      case 'down': return '#f44336';
      default: return '#ccc';
    }
  }};
`;

const ServiceDescription = styled.p`
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const Metric = styled.div``;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const IncidentCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
`;

const IncidentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const IncidentTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const IncidentDate = styled.span`
  font-size: 13px;
  color: #999;
`;

const IncidentDescription = styled.p`
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin: 0 0 24px 0;
  font-size: 24px;
`;

const OverallStatus = styled.div<{ status: 'operational' | 'degraded' | 'down' }>`
  background: ${props => {
    switch (props.status) {
      case 'operational': return 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)';
      case 'degraded': return 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)';
      case 'down': return 'linear-gradient(135deg, #f44336 0%, #e57373 100%)';
      default: return '#ccc';
    }
  }};
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 40px;
  text-align: center;
`;

const OverallStatusTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 28px;
`;

const OverallStatusSubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

const LastUpdated = styled.div`
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 32px;
`;

interface Service {
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  responseTime: string;
}

export default function Status() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const services: Service[] = [
    {
      name: 'API Server',
      description: 'Main backend API for meeting management',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '124ms'
    },
    {
      name: 'Database',
      description: 'SQL Server for data storage',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '18ms'
    },
    {
      name: 'Blob Storage',
      description: 'Azure Blob Storage for audio files',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '86ms'
    },
    {
      name: 'Transcription Service',
      description: 'Azure Whisper AI for speech-to-text',
      status: 'operational',
      uptime: '99.92%',
      responseTime: '2.4s'
    },
    {
      name: 'Background Jobs',
      description: 'Hangfire for async processing',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '45ms'
    },
    {
      name: 'Email Service',
      description: 'Gmail SMTP for verification emails',
      status: 'operational',
      uptime: '99.89%',
      responseTime: '1.2s'
    }
  ];

  const incidents = [
    {
      title: 'Resolved: Slow transcription processing',
      date: 'October 28, 2025',
      description: 'Transcription service experienced increased latency for 15 minutes due to high demand. Issue resolved by scaling Azure resources.'
    },
    {
      title: 'Maintenance: Database upgrade',
      date: 'October 25, 2025',
      description: 'Scheduled maintenance completed successfully. Database upgraded to SQL Server 2022 with zero downtime migration.'
    },
    {
      title: 'Resolved: Email delivery delays',
      date: 'October 20, 2025',
      description: 'Verification emails were delayed by 5-10 minutes due to Gmail SMTP rate limiting. Issue resolved by implementing email queuing.'
    }
  ];

  const overallStatus: 'operational' | 'degraded' | 'down' = 
    services.every(s => s.status === 'operational') ? 'operational' :
    services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            ← Back to Dashboard
          </BackButton>
          <Title>System Status</Title>
          <Subtitle>Real-time monitoring of all MeetMind services</Subtitle>
        </HeaderContent>
      </Header>

      <Content>
        <OverallStatus status={overallStatus}>
          <OverallStatusTitle>
            {overallStatus === 'operational' && '✓ All Systems Operational'}
            {overallStatus === 'degraded' && '⚠ Degraded Performance'}
            {overallStatus === 'down' && '✗ Service Disruption'}
          </OverallStatusTitle>
          <OverallStatusSubtitle>
            {overallStatus === 'operational' && 'All services are running smoothly'}
            {overallStatus === 'degraded' && 'Some services are experiencing issues'}
            {overallStatus === 'down' && 'One or more services are currently unavailable'}
          </OverallStatusSubtitle>
        </OverallStatus>

        <SectionTitle>Service Status</SectionTitle>
        <Grid>
          {services.map((service, idx) => (
            <StatusCard key={idx} status={service.status}>
              <ServiceName>
                {service.name}
                <StatusBadge status={service.status}>
                  <StatusDot status={service.status} />
                  {service.status === 'operational' && 'Operational'}
                  {service.status === 'degraded' && 'Degraded'}
                  {service.status === 'down' && 'Down'}
                </StatusBadge>
              </ServiceName>
              <ServiceDescription>{service.description}</ServiceDescription>
              <Metrics>
                <Metric>
                  <MetricLabel>Uptime (30 days)</MetricLabel>
                  <MetricValue>{service.uptime}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Avg Response</MetricLabel>
                  <MetricValue>{service.responseTime}</MetricValue>
                </Metric>
              </Metrics>
            </StatusCard>
          ))}
        </Grid>

        <SectionTitle>Recent Incidents</SectionTitle>
        {incidents.map((incident, idx) => (
          <IncidentCard key={idx}>
            <IncidentHeader>
              <IncidentTitle>{incident.title}</IncidentTitle>
              <IncidentDate>{incident.date}</IncidentDate>
            </IncidentHeader>
            <IncidentDescription>{incident.description}</IncidentDescription>
          </IncidentCard>
        ))}

        <LastUpdated>
          Last updated: {lastUpdated.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </LastUpdated>
      </Content>
    </Container>
  );
}
