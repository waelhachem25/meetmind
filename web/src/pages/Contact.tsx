import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import emailjs from "@emailjs/browser";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 1000px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  @media (max-width: 560px) {
    padding: 1.5rem;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  min-height: 150px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
`;

const IconBox = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const InfoText = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const InfoLink = styled.a`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: #764ba2;
    text-decoration: underline;
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 2px solid #c3e6cb;
  color: #155724;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
`;

const FAQSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const FAQTitle = styled.h2`
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FAQItem = styled.div`
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }
`;

const Question = styled.h3`
  font-size: 1.05rem;
  color: #333;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const Answer = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.7;
  margin: 0;
`;

function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // EmailJS Configuration
  const EMAILJS_SERVICE_ID = "service_fg9f86r";
  const EMAILJS_TEMPLATE_ID = "template_6rrfga9";
  const EMAILJS_PUBLIC_KEY = "6Sg7cjxx9fabyvzyZ";

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, [EMAILJS_PUBLIC_KEY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subjectLabelMap: Record<string, string> = {
      general: "General Inquiry",
      support: "Technical Support",
      billing: "Billing Question",
      feature: "Feature Request",
      bug: "Bug Report",
      enterprise: "Enterprise Sales",
      partnership: "Partnership Opportunity",
    };

    const subjectReadable = subjectLabelMap[formData.subject] || formData.subject;

    try {
      // Send email via EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: `MeetMind: ${subjectReadable}`,
          message: formData.message,
        }
      );

      console.log("Email sent successfully:", response);
      
      // Success!
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", subject: "general", message: "" });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Email send failed:", error);
      setIsSubmitting(false);
      alert("Failed to send message. Please try again or email us directly at waelhachem80@gmail.com");
    }
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Container>
      <Content>
        <BackButton onClick={() => navigate("/")}>
          ← Back to Home
        </BackButton>

        <Header>
          <Title>Contact Us</Title>
          <Subtitle>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Subtitle>
        </Header>

        <Grid>
          <Card>
            <CardTitle>Send us a Message</CardTitle>

            {showSuccess && (
              <SuccessMessage>
                ✓ Message sent successfully! We'll get back to you soon.
              </SuccessMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="enterprise">Enterprise Sales</option>
                  <option value="partnership">Partnership Opportunity</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="message">Message *</Label>
                <TextArea
                  id="message"
                  name="message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </SubmitButton>
            </Form>
          </Card>

          <Card>
            <CardTitle>Get in Touch</CardTitle>
            <ContactInfo>
              <InfoItem>
                <IconBox>📧</IconBox>
                <InfoContent>
                  <InfoTitle>Email</InfoTitle>
                  <InfoText>
                    <InfoLink href="mailto:waelhachem80@gmail.com">waelhachem80@gmail.com</InfoLink>
                  </InfoText>
                  <InfoText style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                    We typically respond within 24 hours
                  </InfoText>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <IconBox>📍</IconBox>
                <InfoContent>
                  <InfoTitle>Office</InfoTitle>
                  <InfoText>
                    MeetMind Inc.<br />
                    Adib Ishac Street<br />
                    Achrafieh , Building Hajjar<br />
                    Lebanon
                  </InfoText>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <IconBox>💬</IconBox>
                <InfoContent>
                  <InfoTitle>Connect With Us</InfoTitle>
                  <InfoText>
                    <InfoLink href="https://mail.google.com/mail/?view=cm&fs=1&to=waelhachem80@gmail.com" target="_blank" rel="noreferrer">Gmail</InfoLink>
                    {" • "}
                    <InfoLink href="https://wa.me/96176713484" target="_blank" rel="noreferrer">WhatsApp</InfoLink>
                  </InfoText>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <IconBox>🚨</IconBox>
                <InfoContent>
                  <InfoTitle>Security Issues</InfoTitle>
                  <InfoText>
                    Report security vulnerabilities to{" "}
                    <InfoLink href="mailto:waelps4hachem@hotmail.com">waelps4hachem@hotmail.com</InfoLink>
                  </InfoText>
                  <InfoText style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                    We take security seriously and respond promptly
                  </InfoText>
                </InfoContent>
              </InfoItem>
            </ContactInfo>
          </Card>
        </Grid>

        <FAQSection>
          <FAQTitle>Common Questions</FAQTitle>
          <FAQGrid>
            <FAQItem>
              <Question>What's your response time?</Question>
              <Answer>
                We typically respond to all inquiries within 24 hours during business days. Enterprise
                customers receive priority support.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Do you offer phone support?</Question>
              <Answer>
                Phone support is available for Enterprise plan customers. Pro and Free plan users can
                reach us via email.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Can I schedule a demo?</Question>
              <Answer>
                Absolutely! Contact our sales team at sales@meetmind.app to schedule a personalized
                demo of MeetMind's features.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Where is my data stored?</Question>
              <Answer>
                All data is securely stored in Microsoft Azure data centers with enterprise-grade
                encryption and SOC 2 compliance.
              </Answer>
            </FAQItem>
          </FAQGrid>
        </FAQSection>
      </Content>
    </Container>
  );
}

export default Contact;
