import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 900px;
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
  margin-bottom: 0.5rem;
  font-weight: 700;

  @media (max-width: 560px) {
    font-size: 2rem;
  }
`;

const LastUpdated = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin-top: 0.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;

  @media (max-width: 560px) {
    padding: 1.5rem;
  }
`;

const Section = styled.section`
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
`;

const SubSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SubTitle = styled.h3`
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const List = styled.ul`
  margin: 1rem 0;
  padding-left: 2rem;
`;

const ListItem = styled.li`
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  margin-bottom: 0.5rem;
`;

const HighlightBox = styled.div`
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
`;

const HighlightText = styled.p`
  font-size: 1rem;
  color: #333;
  line-height: 1.8;
  margin: 0;
  font-weight: 500;
`;

const ContactLink = styled.a`
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    color: #764ba2;
    text-decoration: underline;
  }
`;

function Privacy() {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Home
        </BackButton>

        <Header>
          <Title>Privacy Policy</Title>
          <LastUpdated>Last updated: November 5, 2025</LastUpdated>
        </Header>

        <Card>
          <Section>
            <Paragraph>
              At MeetMind, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our meeting transcription and
              minutes generation service.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>1. Information We Collect</SectionTitle>
            
            <SubSection>
              <SubTitle>Personal Information</SubTitle>
              <Paragraph>
                When you register for MeetMind, we collect:
              </Paragraph>
              <List>
                <ListItem>Full name</ListItem>
                <ListItem>Email address</ListItem>
                <ListItem>Password (encrypted)</ListItem>
                <ListItem>Account creation date</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>Meeting Data</SubTitle>
              <Paragraph>
                When you use our service, we collect:
              </Paragraph>
              <List>
                <ListItem>Audio recordings of your meetings</ListItem>
                <ListItem>Meeting titles, descriptions, and dates</ListItem>
                <ListItem>Transcripts generated from audio files</ListItem>
                <ListItem>AI-generated meeting minutes and summaries</ListItem>
                <ListItem>Action items and participant information</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>Usage Information</SubTitle>
              <List>
                <ListItem>Log data (IP address, browser type, device information)</ListItem>
                <ListItem>Usage statistics and analytics</ListItem>
                <ListItem>Performance data and error reports</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>2. How We Use Your Information</SectionTitle>
            <Paragraph>
              We use the collected information for the following purposes:
            </Paragraph>
            <List>
              <ListItem>
                <strong>Service Delivery:</strong> To transcribe audio, generate meeting minutes, and
                provide core functionality
              </ListItem>
              <ListItem>
                <strong>Account Management:</strong> To create and manage your account, authenticate
                users, and send service-related emails
              </ListItem>
              <ListItem>
                <strong>Improvements:</strong> To analyze usage patterns and improve our AI models and
                service quality
              </ListItem>
              <ListItem>
                <strong>Security:</strong> To detect and prevent fraud, unauthorized access, and technical
                issues
              </ListItem>
              <ListItem>
                <strong>Communication:</strong> To send updates, newsletters, and promotional materials
                (you can opt-out anytime)
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>3. Data Storage and Security</SectionTitle>
            
            <HighlightBox>
              <HighlightText>
                🔒 We use enterprise-grade security measures to protect your data, including AES-256
                encryption at rest and TLS 1.3 encryption in transit.
              </HighlightText>
            </HighlightBox>

            <Paragraph>
              Your data is stored securely on Microsoft Azure servers with the following protections:
            </Paragraph>
            <List>
              <ListItem>All audio files are encrypted and stored in Azure Blob Storage</ListItem>
              <ListItem>Database records are encrypted using SQL Server Transparent Data Encryption (TDE)</ListItem>
              <ListItem>Access to data is strictly controlled through role-based access control (RBAC)</ListItem>
              <ListItem>Regular security audits and penetration testing</ListItem>
              <ListItem>SOC 2 Type II compliant infrastructure</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>4. Third-Party Services</SectionTitle>
            <Paragraph>
              We use the following third-party services to operate MeetMind:
            </Paragraph>
            <List>
              <ListItem>
                <strong>Microsoft Azure:</strong> Cloud hosting and storage infrastructure
              </ListItem>
              <ListItem>
                <strong>Azure Speech Service:</strong> Audio transcription (Microsoft Privacy Policy applies)
              </ListItem>
              <ListItem>
                <strong>Azure OpenAI Service:</strong> AI-powered minutes generation (OpenAI Data Usage
                Policy applies)
              </ListItem>
              <ListItem>
                <strong>Gmail SMTP:</strong> Email delivery for verification and notifications
              </ListItem>
            </List>
            <Paragraph>
              These services may process your data according to their own privacy policies. We ensure
              all third-party providers meet strict data protection standards.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>5. Data Retention</SectionTitle>
            <Paragraph>
              We retain your data for as long as your account is active. You can request data deletion
              at any time:
            </Paragraph>
            <List>
              <ListItem>
                <strong>Active Accounts:</strong> Data is retained indefinitely while your account is active
              </ListItem>
              <ListItem>
                <strong>Account Deletion:</strong> You have 30 days to download your data after account
                deletion
              </ListItem>
              <ListItem>
                <strong>Permanent Deletion:</strong> All data is permanently deleted 30 days after account
                closure
              </ListItem>
              <ListItem>
                <strong>Legal Requirements:</strong> We may retain certain data to comply with legal
                obligations
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>6. Your Rights</SectionTitle>
            <Paragraph>
              Under GDPR, CCPA, and other data protection laws, you have the following rights:
            </Paragraph>
            <List>
              <ListItem>
                <strong>Right to Access:</strong> Request a copy of all data we hold about you
              </ListItem>
              <ListItem>
                <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
              </ListItem>
              <ListItem>
                <strong>Right to Erasure:</strong> Request deletion of your personal data
              </ListItem>
              <ListItem>
                <strong>Right to Restriction:</strong> Limit how we process your data
              </ListItem>
              <ListItem>
                <strong>Right to Portability:</strong> Export your data in a machine-readable format
              </ListItem>
              <ListItem>
                <strong>Right to Object:</strong> Opt-out of certain data processing activities
              </ListItem>
            </List>
            <Paragraph>
              To exercise any of these rights, contact us at{" "}
              <ContactLink href="mailto:privacy@meetmind.app">privacy@meetmind.app</ContactLink>
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>7. Cookies and Tracking</SectionTitle>
            <Paragraph>
              We use cookies and similar tracking technologies to enhance your experience:
            </Paragraph>
            <List>
              <ListItem>
                <strong>Essential Cookies:</strong> Required for authentication and core functionality
              </ListItem>
              <ListItem>
                <strong>Analytics Cookies:</strong> Help us understand how you use our service
              </ListItem>
              <ListItem>
                <strong>Preference Cookies:</strong> Remember your settings and preferences
              </ListItem>
            </List>
            <Paragraph>
              You can control cookies through your browser settings, but disabling essential cookies may
              affect service functionality.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>8. International Data Transfers</SectionTitle>
            <Paragraph>
              Your data may be transferred to and processed in countries outside your country of
              residence. We ensure adequate safeguards are in place:
            </Paragraph>
            <List>
              <ListItem>Standard Contractual Clauses (SCCs) for EU data transfers</ListItem>
              <ListItem>Privacy Shield frameworks where applicable</ListItem>
              <ListItem>Data Processing Agreements with all third-party processors</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>9. Children's Privacy</SectionTitle>
            <Paragraph>
              MeetMind is not intended for users under 18 years of age. We do not knowingly collect
              personal information from children. If you believe we have collected data from a child,
              please contact us immediately.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>10. Changes to This Policy</SectionTitle>
            <Paragraph>
              We may update this Privacy Policy periodically. We will notify you of significant changes
              via email or through our service. Continued use of MeetMind after changes constitutes
              acceptance of the updated policy.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>11. Contact Us</SectionTitle>
            <Paragraph>
              If you have questions or concerns about this Privacy Policy or our data practices:
            </Paragraph>
            <List>
              <ListItem>
                Email: <ContactLink href="mailto:privacy@meetmind.app">privacy@meetmind.app</ContactLink>
              </ListItem>
              <ListItem>
                Support: <ContactLink href="mailto:support@meetmind.app">support@meetmind.app</ContactLink>
              </ListItem>
              <ListItem>
                Address: MeetMind Inc., Adib Ishac street, Achrafieh, Building Hajjar
              </ListItem>
            </List>
          </Section>
        </Card>
      </Content>
    </Container>
  );
}

export default Privacy;
