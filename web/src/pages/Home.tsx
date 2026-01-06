import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  background: white;
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 600px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: moveBackground 20s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1));
  }

  @keyframes moveBackground {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  @media (max-width: 968px) {
    order: 1;
  }
`;

const HeroImage = styled.div`
  position: relative;
  
  @media (max-width: 968px) {
    order: 2;
    max-width: 500px;
    margin: 0 auto;
  }
`;

const MockupContainer = styled.div`
  position: relative;
  animation: floatImage 6s ease-in-out infinite;

  @keyframes floatImage {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
`;

const MockupCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to bottom, #f5f5f5, white);
    border-radius: 16px 16px 0 0;
  }
`;

const MockupDots = styled.div`
  position: absolute;
  top: 15px;
  left: 20px;
  display: flex;
  gap: 8px;
  z-index: 1;

  span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff5f56;

    &:nth-child(2) { background: #ffbd2e; }
    &:nth-child(3) { background: #27c93f; }
  }
`;

const MockupContent = styled.div`
  margin-top: 30px;
  color: #333;
  text-align: left;
`;

const MockupTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const MockupWave = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 60px;
  margin-bottom: 1.5rem;

  span {
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    opacity: 0.7;
    animation: waveAnimation 1.5s ease-in-out infinite;

    &:nth-child(1) { height: 30%; animation-delay: 0s; }
    &:nth-child(2) { height: 60%; animation-delay: 0.1s; }
    &:nth-child(3) { height: 90%; animation-delay: 0.2s; }
    &:nth-child(4) { height: 50%; animation-delay: 0.3s; }
    &:nth-child(5) { height: 70%; animation-delay: 0.4s; }
    &:nth-child(6) { height: 40%; animation-delay: 0.5s; }
    &:nth-child(7) { height: 80%; animation-delay: 0.6s; }
    &:nth-child(8) { height: 55%; animation-delay: 0.7s; }
    &:nth-child(9) { height: 65%; animation-delay: 0.8s; }
    &:nth-child(10) { height: 45%; animation-delay: 0.9s; }
  }

  @keyframes waveAnimation {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.6); }
  }
`;

const MockupText = styled.div`
  font-size: 0.85rem;
  line-height: 1.8;
  color: #666;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #667eea;
`;

const FloatingCard = styled.div<{ $delay?: number; $top?: string; $right?: string }>`
  position: absolute;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: floatCard 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  top: ${props => props.$top || 'auto'};
  right: ${props => props.$right || 'auto'};
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
  white-space: nowrap;

  @keyframes floatCard {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 968px) {
    font-size: 2.5rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.95;
  line-height: 1.6;

  @media (max-width: 968px) {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;

  ${props => props.$variant === 'primary' ? `
    background: white;
    color: #667eea;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }
  ` : `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-3px);
    }
  `}
`;

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background: #f9f9f9;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 700;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 4rem;
  color: #666;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  text-align: center;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
`;

const HowItWorksSection = styled.section`
  padding: 6rem 2rem;
  background: white;
`;

const StepsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Step = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
  align-items: center;

  &:nth-child(even) {
    flex-direction: row-reverse;
  }

  @media (max-width: 768px) {
    flex-direction: column !important;
    text-align: center;
  }
`;

const StepNumber = styled.div`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
`;

const StepDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
`;

const StatsSection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const StatsGrid = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  text-align: center;
`;

const StatCard = styled.div``;

const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const CTASection = styled.section`
  padding: 6rem 2rem;
  background: #f9f9f9;
  text-align: center;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 700;
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 3rem;
  color: #666;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLearnMore = () => {
    navigate('/docs');
  };

  return (
    <Container>
      {/* Hero Section */}
      <Hero>
        <HeroContent>
          <HeroText>
            <Logo>🧠</Logo>
            <HeroTitle>Welcome to MeetMind</HeroTitle>
            <HeroSubtitle>
              Transform your meeting recordings into actionable insights with AI-powered transcription and intelligent minutes generation
            </HeroSubtitle>
            <CTAButtons>
              <Button $variant="primary" onClick={handleGetStarted}>
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
              <Button $variant="secondary" onClick={handleLearnMore}>
                Learn More
              </Button>
            </CTAButtons>
          </HeroText>

          <HeroImage>
            <MockupContainer>
              <MockupCard>
                <MockupDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </MockupDots>
                <MockupContent>
                  <MockupTitle>🎤 Meeting Recording</MockupTitle>
                  <MockupWave>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </MockupWave>
                  <MockupText>
                    "Let's discuss the Q4 strategy. First, we need to review the current metrics..."
                  </MockupText>
                </MockupContent>
              </MockupCard>
              <FloatingCard $delay={0} $top="-20px" $right="-40px">
                ✅ 95% Accurate
              </FloatingCard>
              <FloatingCard $delay={1} $top="auto" $right="-50px" style={{ bottom: '20px' }}>
                ⚡ 5min Processing
              </FloatingCard>
            </MockupContainer>
          </HeroImage>
        </HeroContent>
      </Hero>

      {/* Features Section */}
      <FeaturesSection>
        <SectionTitle>Why Choose MeetMind?</SectionTitle>
        <SectionSubtitle>
          Everything you need to capture, organize, and act on your meetings
        </SectionSubtitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🎤</FeatureIcon>
            <FeatureTitle>Smart Transcription</FeatureTitle>
            <FeatureDescription>
              Upload audio files and get accurate transcriptions powered by Azure Speech Service. 
              Support for multiple formats including MP3, WAV, and M4A.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🤖</FeatureIcon>
            <FeatureTitle>AI-Powered Minutes</FeatureTitle>
            <FeatureDescription>
              GPT-4 automatically generates structured meeting minutes with key points, decisions, 
              and action items. Save hours of manual work.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Action Item Tracking</FeatureTitle>
            <FeatureDescription>
              Never miss a follow-up. Track action items with assignees, due dates, and completion 
              status across all your meetings.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📄</FeatureIcon>
            <FeatureTitle>PDF Export</FeatureTitle>
            <FeatureDescription>
              Generate professional PDF documents of your meeting minutes. Perfect for sharing 
              with stakeholders or archiving.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Secure & Private</FeatureTitle>
            <FeatureDescription>
              Enterprise-grade security with AES-256 encryption. SOC 2 compliant infrastructure 
              ensures your data is always protected.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTitle>Fast Processing</FeatureTitle>
            <FeatureDescription>
              Get your transcripts and minutes in minutes, not hours. Our optimized pipeline 
              processes meetings 10x faster than manual methods.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* How It Works Section */}
      <HowItWorksSection>
        <SectionTitle>How It Works</SectionTitle>
        <SectionSubtitle>
          Get from meeting recording to actionable minutes in 4 simple steps
        </SectionSubtitle>
        <StepsContainer>
          <Step>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Upload Your Recording</StepTitle>
              <StepDescription>
                Drag and drop your meeting audio file or select it from your device. 
                We support all major audio formats up to 500MB.
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>AI Transcription</StepTitle>
              <StepDescription>
                Our Azure Speech Service transcribes your audio with high accuracy, 
                handling multiple speakers and technical terminology.
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Smart Summarization</StepTitle>
              <StepDescription>
                GPT-4 analyzes the transcript to extract key points, decisions, action items, 
                and generates structured meeting minutes automatically.
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle>Review & Share</StepTitle>
              <StepDescription>
                Review your AI-generated minutes, make any edits, and export as PDF. 
                Share with your team or integrate with your workflow.
              </StepDescription>
            </StepContent>
          </Step>
        </StepsContainer>
      </HowItWorksSection>

      {/* Stats Section */}
      <StatsSection>
        <SectionTitle style={{ color: 'white', marginBottom: '4rem' }}>
          Trusted by Teams Worldwide
        </SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>10,000+</StatNumber>
            <StatLabel>Meetings Processed</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>95%</StatNumber>
            <StatLabel>Transcription Accuracy</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>5min</StatNumber>
            <StatLabel>Average Processing Time</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>50+</StatNumber>
            <StatLabel>Hours Saved per Team</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* Final CTA Section */}
      <CTASection>
        <CTATitle>Ready to Transform Your Meetings?</CTATitle>
        <CTADescription>
          Join thousands of teams using MeetMind to capture every detail and turn conversations into action.
        </CTADescription>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CTAButtons>
            <Button $variant="primary" onClick={handleGetStarted}>
              {user ? 'Go to Dashboard' : 'Start Free Trial'}
            </Button>
            <Button $variant="primary" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </CTAButtons>
        </div>
      </CTASection>
    </Container>
  );
}

export default Home;
