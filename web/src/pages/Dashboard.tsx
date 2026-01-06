import { useEffect, useState } from "react";
import { listMeetings, createMeeting, getSubscription, verifySubscription, type Meeting, type Subscription } from "../lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import MeetingDetail from "./MeetingDetail";
import {
  AppContainer,
  Button,
  Main,
  ModalOverlay,
  ModalCard,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Label,
  Input,
  ButtonGroup,
  Alert,
  Spinner,
  LoadingContainer,
  EmptyState,
  SectionHeader,
  MeetingsGrid,
  Card,
  Badge,
  MeetingTitle,
  MeetingMeta,
} from "../components/styled/AppStyles";

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDate, setNewMeetingDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    console.log('Dashboard mounted, loading meetings...');
    
    // Check if returning from Stripe checkout
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      console.log('Stripe checkout session detected, verifying subscription...');
      // Remove the session_id from URL
      setSearchParams({});
      
      // Verify subscription with Stripe
      verifySubscription()
        .then(() => {
          console.log('Subscription verified');
          setSuccessMessage('Payment successful! Your subscription has been upgraded.');
          // Reload subscription data
          loadSubscription();
        })
        .catch(err => {
          console.error('Failed to verify subscription:', err);
        });
    }
    
    loadMeetings();
    loadSubscription();
  }, []);

  const loadMeetings = async () => {
    console.log('loadMeetings called');
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching meetings from API...');
      const data = await listMeetings();
      console.log('Meetings loaded:', data);
      setMeetings(data);
    } catch (e) {
      console.error('Failed to load meetings:', e);
      setError(e instanceof Error ? e.message : "Failed to load meetings");
      setMeetings([]); // Set empty array on error
    } finally {
      console.log('Loading complete');
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const data = await getSubscription();
      setSubscription(data);
    } catch (e) {
      console.error('Failed to load subscription:', e);
      // Don't show error for subscription, just log it
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim() || !newMeetingDate) return;

    setCreating(true);
    setError(null); // Clear previous errors
    try {
      const meeting = await createMeeting(newMeetingTitle, new Date(newMeetingDate).toISOString());
      setMeetings([meeting, ...meetings]);
      setShowCreateForm(false);
      setNewMeetingTitle("");
      setNewMeetingDate("");
      setSelectedMeeting(meeting.id);
      // Reload subscription to update usage
      await loadSubscription();
      
      // Show success message with remaining meetings
      const updatedSub = await getSubscription();
      if (updatedSub && !updatedSub.isUnlimited) {
        setSuccessMessage(`Meeting created successfully! You have ${updatedSub.meetingsRemaining} meetings remaining this month.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to create meeting";
      setError(errorMessage);
      // Keep the form open on error so user can see the error
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { text: "Uploaded", variant: "gray" as const, icon: "📤" },
      1: { text: "Transcribing", variant: "info" as const, icon: "⚙️" },
      2: { text: "Summarizing", variant: "warning" as const, icon: "✍️" },
      3: { text: "Completed", variant: "success" as const, icon: "✅" },
      4: { text: "Failed", variant: "error" as const, icon: "❌" },
    };
    const info = statusMap[status as keyof typeof statusMap] || statusMap[0];
    return (
      <Badge $variant={info.variant}>
        <span>{info.icon}</span>
        {info.text}
      </Badge>
    );
  };

  if (selectedMeeting) {
    return (
      <MeetingDetail
        meetingId={selectedMeeting}
        onBack={() => {
          setSelectedMeeting(null);
          loadMeetings();
        }}
      />
    );
  }

  return (
    <AppContainer>
      {/* Main Content */}
      <Main style={{ paddingTop: '2rem' }}>
        {/* Subscription Status Banner */}
        {subscription && (
          <Alert $variant={subscription.meetingsRemaining <= 1 ? "error" : subscription.meetingsRemaining <= 2 ? "warning" : "info"}>
            <span style={{ fontSize: "1.25rem" }}>
              {subscription.meetingsRemaining === 0 ? '🚫' : subscription.meetingsRemaining <= 1 ? '⚠️' : '📊'}
            </span>
            <div>
              <strong>
                {subscription.plan === 'Free' ? 'Free Plan' : subscription.plan === 'Pro' ? 'Pro Plan' : 'Enterprise Plan'}
              </strong>
              <p>
                {subscription.isUnlimited ? (
                  <>✨ Unlimited meetings available</>
                ) : subscription.meetingsRemaining === 0 ? (
                  <>
                    You've used all {subscription.meetingsLimit} meetings this month. 
                    <Button 
                      $variant="primary" 
                      style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade Now
                    </Button>
                  </>
                ) : (
                  <>
                    {subscription.meetingsRemaining} of {subscription.meetingsLimit} meetings remaining this month
                    {subscription.plan === 'Free' && subscription.meetingsRemaining <= 2 && (
                      <Button 
                        $variant="primary" 
                        style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade for More
                      </Button>
                    )}
                  </>
                )}
              </p>
            </div>
          </Alert>
        )}

        {/* Create Meeting Modal */}
        {showCreateForm && (
          <ModalOverlay onClick={() => setShowCreateForm(false)}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <h2>Create New Meeting</h2>
              </CardHeader>
              <form onSubmit={handleCreateMeeting}>
                <CardBody>
                  <FormGroup>
                    <div>
                      <Label>Meeting Title *</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Weekly Team Sync"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label>Meeting Date & Time *</Label>
                      <Input
                        type="datetime-local"
                        value={newMeetingDate}
                        onChange={(e) => setNewMeetingDate(e.target.value)}
                        required
                      />
                    </div>
                  </FormGroup>
                </CardBody>
                <CardFooter>
                  <ButtonGroup>
                    <Button
                      type="button"
                      $variant="secondary"
                      onClick={() => setShowCreateForm(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" $variant="primary" disabled={creating}>
                      {creating ? (
                        <>
                          <Spinner />
                          Creating...
                        </>
                      ) : (
                        "Create Meeting"
                      )}
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </form>
            </ModalCard>
          </ModalOverlay>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert $variant="success">
            <span style={{ fontSize: "1.25rem" }}>✅</span>
            <div>
              <strong>Success!</strong>
              <p style={{ margin: "0.5rem 0 0" }}>{successMessage}</p>
            </div>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert $variant="error">
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
            <div>
              <strong>Error</strong>
              <p>{error}</p>
              {error.includes('monthly meeting limit') && (
                <Button 
                  $variant="primary" 
                  $size="sm" 
                  onClick={() => navigate('/pricing')}
                  style={{ marginTop: '0.5rem' }}
                >
                  View Plans & Upgrade
                </Button>
              )}
            </div>
          </Alert>
        )}

        {/* Limit Warning */}
        {subscription && !subscription.isUnlimited && subscription.meetingsRemaining === 0 && !error && (
          <Alert $variant="warning" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: "1.25rem" }}>📊</span>
            <div>
              <strong>Meeting Limit Reached</strong>
              <p>
                You've used all {subscription.meetingsLimit} meetings for this month on the {subscription.plan} plan. 
                Upgrade to Pro for unlimited meetings!
              </p>
              <Button 
                $variant="primary" 
                $size="sm" 
                onClick={() => navigate('/pricing')}
                style={{ marginTop: '0.5rem' }}
              >
                Upgrade to Pro
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <LoadingContainer>
            <Spinner $size="lg" style={{ margin: "0 auto" }} />
            <p>Loading meetings...</p>
          </LoadingContainer>
        ) : meetings.length === 0 ? (
          /* Empty State */
          <EmptyState>
            <div style={{ fontSize: "5rem" }}>📝</div>
            <h2>No meetings yet</h2>
            <p>
              Get started by creating your first meeting. Upload audio recordings to automatically
              generate transcripts and actionable meeting minutes.
            </p>
            <Button $variant="primary" $size="lg" onClick={() => setShowCreateForm(true)}>
              <span style={{ fontSize: "1.25rem" }}>+</span>
              Create Your First Meeting
            </Button>
          </EmptyState>
        ) : (
          /* Meetings Grid */
          <div>
            <SectionHeader>
              <div>
                <h2>Your Meetings</h2>
                <p>
                  {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
                </p>
              </div>
            </SectionHeader>
            <MeetingsGrid>
              {meetings.map((meeting, idx) => (
                <Card
                  key={meeting.id}
                  $animated
                  $clickable
                  style={{ '--delay': `${idx * 50}ms` } as React.CSSProperties}
                  onClick={() => setSelectedMeeting(meeting.id)}
                >
                  <CardBody>
                    <div>
                      {getStatusBadge(meeting.status)}
                    </div>
                    <MeetingTitle>{meeting.title}</MeetingTitle>
                    <MeetingMeta>
                      <span>📅 {new Date(meeting.dateUtc).toLocaleDateString()}</span>
                      <span>🕒 {new Date(meeting.dateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </MeetingMeta>
                  </CardBody>
                  <CardFooter>
                    <span>Created {new Date(meeting.createdAt).toLocaleDateString()}</span>
                  </CardFooter>
                </Card>
              ))}
            </MeetingsGrid>
          </div>
        )}
      </Main>
    </AppContainer>
  );
}

export default Dashboard;


