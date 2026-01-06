import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscription, type Subscription } from "../lib/api";
import styled from "styled-components";
import {
  AppContainer,
  Button,
  Main,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  LoadingContainer,
  Alert,
} from "../components/styled/AppStyles";

const AccountContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
`;

const PlanBadge = styled.div<{ $plan: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  background: ${props => {
    switch (props.$plan.toLowerCase()) {
      case 'pro':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'enterprise':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      default:
        return '#e5e7eb';
    }
  }};
  color: ${props => props.$plan.toLowerCase() === 'free' ? '#1a1a1a' : 'white'};
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'active':
        return '#d1fae5';
      case 'canceled':
        return '#fee2e2';
      case 'past_due':
        return '#fef3c7';
      default:
        return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'active':
        return '#065f46';
      case 'canceled':
        return '#991b1b';
      case 'past_due':
        return '#92400e';
      default:
        return '#1a1a1a';
    }
  }};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  color: #666;
  font-weight: 500;
`;

const InfoValue = styled.div`
  color: #1a1a1a;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

function Account() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscription();
      setSubscription(data);
    } catch (e) {
      console.error('Failed to load subscription:', e);
      setError(e instanceof Error ? e.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // TODO: Implement portal session creation
      navigate('/pricing');
    } catch (e) {
      console.error('Failed to open billing portal:', e);
    }
  };

  const getTimeRemaining = () => {
    if (!subscription?.currentPeriodEnd) return null;
    
    const end = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.isUnlimited) return 0;
    return (subscription.meetingsThisMonth / subscription.meetingsLimit) * 100;
  };

  return (
    <AppContainer>
      {/* Main Content */}
      <Main style={{ paddingTop: '2rem' }}>
        <AccountContainer>
          <BackButton onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </BackButton>

          <div style={{ marginTop: '2rem' }}>
            <PageTitle>Account & Subscription</PageTitle>
            <PageSubtitle>Manage your subscription and view usage details</PageSubtitle>
          </div>

          {loading ? (
            <LoadingContainer>
              <Spinner $size="lg" />
              <p>Loading subscription details...</p>
            </LoadingContainer>
          ) : error ? (
            <Alert $variant="error">
              <span style={{ fontSize: "1.25rem" }}>⚠️</span>
              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </Alert>
          ) : subscription ? (
            <>
              {/* Stats Grid */}
              <StatsGrid>
                <StatCard>
                  <StatLabel>Current Plan</StatLabel>
                  <StatValue>{subscription.plan}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Meetings This Month</StatLabel>
                  <StatValue>
                    {subscription.isUnlimited ? '∞' : subscription.meetingsThisMonth}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Meetings Remaining</StatLabel>
                  <StatValue>
                    {subscription.isUnlimited ? '∞' : subscription.meetingsRemaining}
                  </StatValue>
                </StatCard>
              </StatsGrid>

              {/* Subscription Details */}
              <Grid>
                <Card>
                  <CardHeader>
                    <h2>Subscription Details</h2>
                  </CardHeader>
                  <CardBody>
                    <InfoRow>
                      <InfoLabel>Plan</InfoLabel>
                      <InfoValue>
                        <PlanBadge $plan={subscription.plan}>
                          {subscription.plan === 'Free' && '🎁'}
                          {subscription.plan === 'Pro' && '⭐'}
                          {subscription.plan === 'Enterprise' && '🚀'}
                          {subscription.plan}
                        </PlanBadge>
                      </InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Status</InfoLabel>
                      <InfoValue>
                        <StatusBadge $status={subscription.status}>
                          {subscription.status === 'Active' && '✓'}
                          {subscription.status}
                        </StatusBadge>
                      </InfoValue>
                    </InfoRow>
                    {subscription.currentPeriodEnd && (
                      <InfoRow>
                        <InfoLabel>Current Period Ends</InfoLabel>
                        <InfoValue>
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                            {getTimeRemaining()} remaining
                          </div>
                        </InfoValue>
                      </InfoRow>
                    )}
                    {subscription.currentPeriodStart && (
                      <InfoRow>
                        <InfoLabel>Period Started</InfoLabel>
                        <InfoValue>
                          {new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </InfoValue>
                      </InfoRow>
                    )}
                  </CardBody>
                </Card>

                {/* Usage */}
                <Card>
                  <CardHeader>
                    <h2>Usage This Month</h2>
                  </CardHeader>
                  <CardBody>
                    {subscription.isUnlimited ? (
                      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>∞</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a' }}>
                          Unlimited Meetings
                        </div>
                        <div style={{ color: '#666', marginTop: '0.5rem' }}>
                          Create as many meetings as you need
                        </div>
                      </div>
                    ) : (
                      <>
                        <InfoRow>
                          <InfoLabel>Meetings Used</InfoLabel>
                          <InfoValue>
                            {subscription.meetingsThisMonth} of {subscription.meetingsLimit}
                          </InfoValue>
                        </InfoRow>
                        <ProgressBar>
                          <ProgressFill $percentage={getUsagePercentage()} />
                        </ProgressBar>
                        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
                          {subscription.meetingsRemaining > 0 ? (
                            <>
                              You have <strong>{subscription.meetingsRemaining}</strong> meeting
                              {subscription.meetingsRemaining !== 1 ? 's' : ''} remaining this month.
                            </>
                          ) : (
                            <Alert $variant="warning" style={{ marginTop: '1rem' }}>
                              <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                              <div>
                                <strong>Limit Reached</strong>
                                <p>
                                  You've used all {subscription.meetingsLimit} meetings for this month. 
                                  Your limit will reset on{' '}
                                  {subscription.currentPeriodEnd && 
                                    new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                                </p>
                              </div>
                            </Alert>
                          )}
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <h2>Manage Subscription</h2>
                  </CardHeader>
                  <CardBody>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                      {subscription.plan === 'Free' 
                        ? 'Upgrade to Pro or Enterprise for unlimited meetings and premium features.'
                        : 'Manage your billing, payment methods, and subscription settings.'}
                    </p>
                    <ButtonGroup>
                      {subscription.plan === 'Free' ? (
                        <Button 
                          $variant="primary" 
                          onClick={() => navigate('/pricing')}
                        >
                          🚀 Upgrade Plan
                        </Button>
                      ) : (
                        <Button 
                          $variant="primary" 
                          onClick={handleManageSubscription}
                        >
                          ⚙️ Manage Billing
                        </Button>
                      )}
                      <Button 
                        $variant="secondary" 
                        onClick={() => navigate('/pricing')}
                      >
                        View All Plans
                      </Button>
                    </ButtonGroup>
                  </CardBody>
                </Card>
              </Grid>
            </>
          ) : null}
        </AccountContainer>
      </Main>
    </AppContainer>
  );
}

export default Account;
