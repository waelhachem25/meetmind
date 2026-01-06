import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';

interface Subscription {
  plan: number;
  status: number;
  meetingsThisMonth: number;
  meetingsLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  subscription?: Subscription;
  meetingCount: number;
}

interface RevenuePlan {
  plan: string;
  count: number;
  monthlyRevenue: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalMeetings: number;
  freeUsers: number;
  subscriptionStats: { plan: string; count: number }[];
  revenueByPlan: RevenuePlan[];
  totalMonthlyRevenue: number;
}

interface Meeting {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface RecentUser {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

interface Activity {
  recentMeetings: Meeting[];
  recentUsers: RecentUser[];
}

const AdminPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/activity'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load admin data. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (userId: number) => {
    try {
      await api.patch(`/api/admin/users/${userId}/toggle-active`);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  if (loading) {
    return <Container><h2>Loading admin panel...</h2></Container>;
  }

  if (error) {
    return (
      <Container>
        <ErrorBox>
          <h2>⚠️ Error Loading Admin Panel</h2>
          <p>{error}</p>
          <RefreshButton onClick={loadData}>Try Again</RefreshButton>
        </ErrorBox>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>🎯 Admin Dashboard</h1>
        <RefreshButton onClick={loadData}>Refresh Data</RefreshButton>
      </Header>

      <Tabs>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </Tab>
        <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          Users ({users.length})
        </Tab>
        <Tab active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
          Recent Activity
        </Tab>
      </Tabs>

      {activeTab === 'overview' && stats && (
        <OverviewTab>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalUsers}</StatValue>
              <StatLabel>Total Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.activeUsers}</StatValue>
              <StatLabel>Active Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalMeetings}</StatValue>
              <StatLabel>Total Meetings</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>${stats.totalMonthlyRevenue}</StatValue>
              <StatLabel>Monthly Revenue</StatLabel>
            </StatCard>
          </StatsGrid>

          <Section>
            <h2>👥 Users by Subscription</h2>
            <Table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Users</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Badge color="#6c757d">Free</Badge></td>
                  <td>{stats.freeUsers}</td>
                  <td>$0</td>
                </tr>
                {stats.revenueByPlan.map((plan: RevenuePlan) => (
                  <tr key={plan.plan}>
                    <td>
                      <Badge color={plan.plan === 'Pro' ? '#007bff' : '#6f42c1'}>
                        {plan.plan}
                      </Badge>
                    </td>
                    <td>{plan.count}</td>
                    <td>${plan.monthlyRevenue}/month</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        </OverviewTab>
      )}

      {activeTab === 'users' && (
        <UsersTab>
          <Section>
            <h2>👥 All Users</h2>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Meetings</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.subscription ? (
                        <Badge color={user.subscription.plan === 1 ? '#007bff' : user.subscription.plan === 2 ? '#6f42c1' : '#6c757d'}>
                          {user.subscription.plan === 0 ? 'Free' : user.subscription.plan === 1 ? 'Pro' : 'Enterprise'}
                        </Badge>
                      ) : (
                        <Badge color="#6c757d">Free</Badge>
                      )}
                    </td>
                    <td>
                      <StatusBadge active={user.isActive}>
                        {user.isActive ? '✓ Active' : '✗ Inactive'}
                      </StatusBadge>
                    </td>
                    <td>
                      {user.subscription ? (
                        <span>
                          {user.subscription.meetingsThisMonth}/{user.subscription.meetingsLimit}
                        </span>
                      ) : (
                        <span>{user.meetingCount}/5</span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <ActionButton
                        onClick={() => toggleUserActive(user.id)}
                        danger={user.isActive}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        </UsersTab>
      )}

      {activeTab === 'activity' && activity && (
        <ActivityTab>
          <Section>
            <h2>📊 Recent Meetings</h2>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {activity.recentMeetings.map((meeting: Meeting) => (
                  <tr key={meeting.id}>
                    <td>{meeting.id}</td>
                    <td>{meeting.title}</td>
                    <td>
                      {meeting.user.fullName}<br />
                      <small style={{ color: '#6c757d' }}>{meeting.user.email}</small>
                    </td>
                    <td>
                      <Badge color={
                        meeting.status === 'Completed' ? '#28a745' :
                        meeting.status === 'Failed' ? '#dc3545' : '#ffc107'
                      }>
                        {meeting.status}
                      </Badge>
                    </td>
                    <td>{new Date(meeting.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section>
            <h2>🆕 Recent Users</h2>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {activity.recentUsers.map((user: RecentUser) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        </ActivityTab>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    color: #333;
  }
`;

const RefreshButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #0056b3;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 2rem;
  background: ${(props) => (props.active ? '#007bff' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#666')};
  border: none;
  border-bottom: ${(props) => (props.active ? 'none' : '2px solid transparent')};
  cursor: pointer;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? '#0056b3' : '#f0f0f0')};
  }
`;

const OverviewTab = styled.div``;
const UsersTab = styled.div``;
const ActivityTab = styled.div``;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #666;
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  h2 {
    margin-top: 0;
    color: #333;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }
`;

const Badge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${(props) => props.color};
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${(props) => (props.active ? '#28a745' : '#dc3545')};
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.danger ? '#dc3545' : '#28a745')};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorBox = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;

  h2 {
    color: #856404;
    margin-top: 0;
  }

  p {
    color: #856404;
    margin: 1rem 0;
  }
`;

export default AdminPage;
