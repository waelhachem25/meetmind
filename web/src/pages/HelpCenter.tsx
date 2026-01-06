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
  max-width: 1200px;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const SearchBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const CardIcon = styled.div`
  font-size: 40px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  color: #333;
  margin: 0 0 12px 0;
  font-size: 20px;
`;

const CardDescription = styled.p`
  color: #666;
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
`;

const FAQSection = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const FAQTitle = styled.h2`
  color: #333;
  margin: 0 0 24px 0;
  font-size: 24px;
`;

const FAQItem = styled.div`
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #333;
  font-weight: 600;
  font-size: 16px;

  &:hover {
    color: #667eea;
  }
`;

const Answer = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  color: #666;
  line-height: 1.7;
  padding-top: ${props => props.isOpen ? '12px' : '0'};
`;

const Arrow = styled.span<{ isOpen: boolean }>`
  transition: transform 0.3s;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const categories = [
    {
      icon: '🚀',
      title: 'Getting Started',
      description: 'Learn the basics of MeetMind and how to upload your first meeting audio.'
    },
    {
      icon: '🎤',
      title: 'Audio Upload',
      description: 'Supported formats, file size limits, and best practices for audio quality.'
    },
    {
      icon: '📝',
      title: 'Transcription',
      description: 'How our AI transcription works and tips for better accuracy.'
    },
    {
      icon: '📊',
      title: 'Meeting Minutes',
      description: 'Understanding AI-generated summaries, decisions, and action items.'
    },
    {
      icon: '✏️',
      title: 'Editing',
      description: 'How to edit transcripts and minutes to perfect your meeting records.'
    },
    {
      icon: '📄',
      title: 'Export & Share',
      description: 'Download PDFs, share meeting minutes with your team.'
    }
  ];

  const faqs = [
    {
      question: 'What audio formats are supported?',
      answer: 'MeetMind supports MP3, WAV, M4A, and most common audio formats. Maximum file size is 500MB per upload.'
    },
    {
      question: 'How accurate is the transcription?',
      answer: 'Our AI transcription service (Azure Whisper) achieves 95%+ accuracy for clear audio in English. Accuracy may vary based on audio quality, accents, and background noise.'
    },
    {
      question: 'Can I edit the generated minutes?',
      answer: 'Yes! You can edit both the transcript and the AI-generated minutes. Click the "Edit" button next to any section to make changes.'
    },
    {
      question: 'How long does processing take?',
      answer: 'Transcription typically takes 1-2 minutes per hour of audio. Minutes generation is usually complete within 30 seconds after transcription.'
    },
    {
      question: 'Can I delete a meeting?',
      answer: 'Yes, you can delete meetings from your dashboard. Note that this action cannot be undone.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All audio files are encrypted in transit and at rest. We use Azure Blob Storage with enterprise-grade security. Your data is never shared with third parties.'
    },
    {
      question: 'Can I export meetings as PDF?',
      answer: 'Yes! Every completed meeting has an "Export PDF" button that generates a professional, formatted PDF with all meeting details, transcript, and minutes.'
    },
    {
      question: 'What languages are supported?',
      answer: 'Currently, MeetMind supports English transcription. We\'re working on adding more languages soon!'
    }
  ];

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            ← Back to Dashboard
          </BackButton>
          <Title>Help Center</Title>
        </HeaderContent>
      </Header>

      <Content>
        <SearchBox>
          <SearchInput
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>

        <Grid>
          {categories.map((cat, idx) => (
            <Card key={idx}>
              <CardIcon>{cat.icon}</CardIcon>
              <CardTitle>{cat.title}</CardTitle>
              <CardDescription>{cat.description}</CardDescription>
            </Card>
          ))}
        </Grid>

        <FAQSection>
          <FAQTitle>Frequently Asked Questions</FAQTitle>
          {faqs.map((faq, idx) => (
            <FAQItem key={idx}>
              <Question onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}>
                {faq.question}
                <Arrow isOpen={openFAQ === idx}>▼</Arrow>
              </Question>
              <Answer isOpen={openFAQ === idx}>
                {faq.answer}
              </Answer>
            </FAQItem>
          ))}
        </FAQSection>
      </Content>
    </Container>
  );
}
