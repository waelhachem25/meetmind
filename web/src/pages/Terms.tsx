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

const SubTitle = styled.h3`
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
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

const WarningBox = styled.div`
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
`;

const WarningText = styled.p`
  font-size: 1rem;
  color: #856404;
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

function Terms() {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Home
        </BackButton>

        <Header>
          <Title>Terms of Service</Title>
          <LastUpdated>Last updated: November 5, 2025</LastUpdated>
        </Header>

        <Card>
          <Section>
            <Paragraph>
              Welcome to MeetMind! These Terms of Service ("Terms") govern your access to and use of
              MeetMind's meeting transcription and AI-powered minutes generation service. By using
              MeetMind, you agree to be bound by these Terms.
            </Paragraph>
            <WarningBox>
              <WarningText>
                ⚠️ Please read these Terms carefully. By creating an account or using our service, you
                acknowledge that you have read, understood, and agree to be bound by these Terms.
              </WarningText>
            </WarningBox>
          </Section>

          <Section>
            <SectionTitle>1. Acceptance of Terms</SectionTitle>
            <Paragraph>
              By accessing or using MeetMind, you agree to comply with and be legally bound by these
              Terms. If you do not agree to these Terms, you may not access or use our service.
            </Paragraph>
            <Paragraph>
              These Terms constitute a legally binding agreement between you and MeetMind Inc.
              ("MeetMind", "we", "us", or "our").
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>2. Eligibility</SectionTitle>
            <Paragraph>
              To use MeetMind, you must:
            </Paragraph>
            <List>
              <ListItem>Be at least 18 years of age</ListItem>
              <ListItem>Have the legal capacity to enter into a binding contract</ListItem>
              <ListItem>Not be prohibited from using the service under applicable laws</ListItem>
              <ListItem>Provide accurate and complete registration information</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>3. Account Registration and Security</SectionTitle>
            
            <SubTitle>Account Creation</SubTitle>
            <Paragraph>
              To access certain features, you must create an account by providing:
            </Paragraph>
            <List>
              <ListItem>A valid email address</ListItem>
              <ListItem>Your full name</ListItem>
              <ListItem>A secure password</ListItem>
            </List>

            <SubTitle>Account Security</SubTitle>
            <Paragraph>
              You are responsible for:
            </Paragraph>
            <List>
              <ListItem>Maintaining the confidentiality of your account credentials</ListItem>
              <ListItem>All activities that occur under your account</ListItem>
              <ListItem>Notifying us immediately of any unauthorized access</ListItem>
              <ListItem>Ensuring your account information remains accurate and up-to-date</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>4. Service Description</SectionTitle>
            <Paragraph>
              MeetMind provides:
            </Paragraph>
            <List>
              <ListItem>
                <strong>Audio Transcription:</strong> Converting meeting audio files to text using Azure
                Speech Service
              </ListItem>
              <ListItem>
                <strong>AI Minutes Generation:</strong> Creating structured meeting minutes with key
                points, decisions, and action items using GPT-4
              </ListItem>
              <ListItem>
                <strong>Document Export:</strong> Generating downloadable PDF documents of meeting minutes
              </ListItem>
              <ListItem>
                <strong>Meeting Management:</strong> Organizing and accessing your meeting history
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>5. Subscription Plans and Billing</SectionTitle>
            
            <SubTitle>Free Plan</SubTitle>
            <List>
              <ListItem>3 meetings per month</ListItem>
              <ListItem>30-minute maximum per meeting</ListItem>
              <ListItem>Basic features included</ListItem>
            </List>

            <SubTitle>Paid Plans (Pro & Enterprise)</SubTitle>
            <Paragraph>
              Paid subscriptions are billed on a recurring basis (monthly or annually):
            </Paragraph>
            <List>
              <ListItem>Charges are non-refundable except as required by law</ListItem>
              <ListItem>Subscriptions auto-renew unless canceled before the renewal date</ListItem>
              <ListItem>Price changes will be communicated 30 days in advance</ListItem>
              <ListItem>Failed payments may result in service suspension</ListItem>
            </List>

            <SubTitle>Cancellation</SubTitle>
            <Paragraph>
              You may cancel your subscription at any time. Upon cancellation:
            </Paragraph>
            <List>
              <ListItem>You retain access until the end of your billing period</ListItem>
              <ListItem>No refund will be issued for the remaining period</ListItem>
              <ListItem>Your data remains accessible for 30 days</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>6. Acceptable Use Policy</SectionTitle>
            <Paragraph>
              You agree NOT to use MeetMind to:
            </Paragraph>
            <List>
              <ListItem>Upload illegal, harmful, or offensive content</ListItem>
              <ListItem>Violate any laws or regulations</ListItem>
              <ListItem>Infringe on intellectual property rights</ListItem>
              <ListItem>Transmit malware, viruses, or harmful code</ListItem>
              <ListItem>Attempt to gain unauthorized access to our systems</ListItem>
              <ListItem>Reverse engineer or copy our software</ListItem>
              <ListItem>Harass, threaten, or harm others</ListItem>
              <ListItem>Upload audio without consent of all participants (where required by law)</ListItem>
              <ListItem>Resell or redistribute our service without authorization</ListItem>
            </List>
            <WarningBox>
              <WarningText>
                ⚠️ Violation of this Acceptable Use Policy may result in immediate account suspension or
                termination without refund.
              </WarningText>
            </WarningBox>
          </Section>

          <Section>
            <SectionTitle>7. Content Ownership and Rights</SectionTitle>
            
            <SubTitle>Your Content</SubTitle>
            <Paragraph>
              You retain all ownership rights to the content you upload (audio, meeting data, etc.). By
              uploading content, you grant MeetMind a limited license to:
            </Paragraph>
            <List>
              <ListItem>Process and transcribe your audio files</ListItem>
              <ListItem>Generate meeting minutes using AI</ListItem>
              <ListItem>Store your content securely</ListItem>
              <ListItem>Display your content back to you through our service</ListItem>
            </List>

            <SubTitle>Our Rights</SubTitle>
            <Paragraph>
              MeetMind owns all rights to:
            </Paragraph>
            <List>
              <ListItem>The MeetMind platform, software, and technology</ListItem>
              <ListItem>Our logos, trademarks, and branding</ListItem>
              <ListItem>Any improvements or modifications we make to the service</ListItem>
            </List>

            <SubTitle>AI-Generated Content</SubTitle>
            <Paragraph>
              AI-generated minutes and summaries are provided to you, but we retain the right to use
              aggregated, anonymized data to improve our AI models.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>8. Recording Consent Requirements</SectionTitle>
            <WarningBox>
              <WarningText>
                ⚠️ IMPORTANT: You are solely responsible for ensuring you have legal consent to record
                and transcribe meetings. Recording laws vary by jurisdiction.
              </WarningText>
            </WarningBox>
            <Paragraph>
              By uploading audio recordings, you represent and warrant that:
            </Paragraph>
            <List>
              <ListItem>You have obtained all necessary consents from meeting participants</ListItem>
              <ListItem>Your recordings comply with applicable recording laws (one-party, two-party, or all-party consent)</ListItem>
              <ListItem>You have informed participants about the recording and transcription</ListItem>
            </List>
            <Paragraph>
              MeetMind is not liable for any legal consequences resulting from unauthorized recordings.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>9. Disclaimer of Warranties</SectionTitle>
            <Paragraph>
              MeetMind is provided "AS IS" and "AS AVAILABLE" without warranties of any kind:
            </Paragraph>
            <List>
              <ListItem>We do not guarantee 100% transcription accuracy</ListItem>
              <ListItem>AI-generated content may contain errors or inaccuracies</ListItem>
              <ListItem>Service may be interrupted or unavailable at times</ListItem>
              <ListItem>We are not responsible for third-party services (Azure, OpenAI)</ListItem>
            </List>
            <Paragraph>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
                INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </strong>
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>10. Limitation of Liability</SectionTitle>
            <Paragraph>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEETMIND SHALL NOT BE LIABLE FOR:
              </strong>
            </Paragraph>
            <List>
              <ListItem>Indirect, incidental, special, or consequential damages</ListItem>
              <ListItem>Loss of profits, data, or business opportunities</ListItem>
              <ListItem>Damages arising from transcription errors or AI inaccuracies</ListItem>
              <ListItem>Unauthorized access to your account or data breaches beyond our control</ListItem>
            </List>
            <Paragraph>
              <strong>
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING
                THE CLAIM, OR $100, WHICHEVER IS GREATER.
              </strong>
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>11. Indemnification</SectionTitle>
            <Paragraph>
              You agree to indemnify and hold MeetMind harmless from any claims, damages, losses, or
              expenses (including legal fees) arising from:
            </Paragraph>
            <List>
              <ListItem>Your violation of these Terms</ListItem>
              <ListItem>Your violation of any laws or third-party rights</ListItem>
              <ListItem>Your content or recordings uploaded to MeetMind</ListItem>
              <ListItem>Your failure to obtain proper recording consent</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>12. Data Privacy</SectionTitle>
            <Paragraph>
              Your privacy is important to us. Our{" "}
              <ContactLink href="/privacy">Privacy Policy</ContactLink> explains how we collect, use,
              and protect your data. By using MeetMind, you also agree to our Privacy Policy.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>13. Termination</SectionTitle>
            
            <SubTitle>Termination by You</SubTitle>
            <Paragraph>
              You may terminate your account at any time through your account settings or by contacting
              support.
            </Paragraph>

            <SubTitle>Termination by Us</SubTitle>
            <Paragraph>
              We may suspend or terminate your account immediately if:
            </Paragraph>
            <List>
              <ListItem>You violate these Terms or our Acceptable Use Policy</ListItem>
              <ListItem>Your account is inactive for more than 12 months</ListItem>
              <ListItem>We reasonably believe your account poses a security risk</ListItem>
              <ListItem>Required by law or court order</ListItem>
            </List>

            <SubTitle>Effect of Termination</SubTitle>
            <List>
              <ListItem>Your access to the service will be immediately revoked</ListItem>
              <ListItem>You have 30 days to download your data</ListItem>
              <ListItem>After 30 days, all your data will be permanently deleted</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>14. Modifications to Terms</SectionTitle>
            <Paragraph>
              We may update these Terms from time to time. When we make changes:
            </Paragraph>
            <List>
              <ListItem>We will update the "Last updated" date at the top</ListItem>
              <ListItem>Material changes will be communicated via email</ListItem>
              <ListItem>Continued use after changes constitutes acceptance</ListItem>
              <ListItem>You may terminate if you disagree with the new Terms</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>15. Dispute Resolution</SectionTitle>
            
            <SubTitle>Governing Law</SubTitle>
            <Paragraph>
              These Terms are governed by the laws of the State of California, USA, without regard to
              conflict of law principles.
            </Paragraph>

            <SubTitle>Arbitration</SubTitle>
            <Paragraph>
              Any disputes arising from these Terms shall be resolved through binding arbitration in
              San Francisco, California, except for claims that may be brought in small claims court.
            </Paragraph>

            <SubTitle>Class Action Waiver</SubTitle>
            <Paragraph>
              You agree to resolve disputes individually and waive the right to participate in class
              actions or class arbitrations.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>16. Miscellaneous</SectionTitle>
            <List>
              <ListItem>
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between
                you and MeetMind
              </ListItem>
              <ListItem>
                <strong>Severability:</strong> If any provision is unenforceable, the remaining provisions
                remain in effect
              </ListItem>
              <ListItem>
                <strong>No Waiver:</strong> Our failure to enforce any right does not waive that right
              </ListItem>
              <ListItem>
                <strong>Assignment:</strong> You may not assign these Terms; we may assign them to any
                successor
              </ListItem>
              <ListItem>
                <strong>Force Majeure:</strong> We are not liable for failures beyond our reasonable control
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>17. Contact Information</SectionTitle>
            <Paragraph>
              For questions about these Terms, contact us:
            </Paragraph>
            <List>
              <ListItem>
                Email: <ContactLink href="mailto:legal@meetmind.app">legal@meetmind.app</ContactLink>
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

export default Terms;
