import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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
  margin-bottom: 2rem;
`;

const BillingToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const ToggleLabel = styled.span<{ active?: boolean }>`
  color: white;
  font-size: 1.1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  opacity: ${props => props.active ? '1' : '0.7'};
`;

const Toggle = styled.button<{ isYearly?: boolean }>`
  width: 60px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  &::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    top: 4px;
    left: ${props => props.isYearly ? '32px' : '4px'};
    transition: all 0.3s;
  }
`;

const SaveBadge = styled.span`
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PricingCard = styled.div<{ featured?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: ${props => props.featured ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  position: relative;
  transition: all 0.3s;
  transform: ${props => props.featured ? 'scale(1.05)' : 'scale(1)'};

  &:hover {
    transform: ${props => props.featured ? 'scale(1.08)' : 'scale(1.03)'};
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 900px) {
    transform: scale(1);
    
    &:hover {
      transform: scale(1.02);
    }
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PlanDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const Price = styled.div`
  margin-bottom: 2rem;
`;

const PriceAmount = styled.div`
  font-size: 3rem;
  color: #333;
  font-weight: 700;
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
`;

const Currency = styled.span`
  font-size: 1.5rem;
  margin-top: 0.5rem;
`;

const Period = styled.span`
  font-size: 1rem;
  color: #666;
  font-weight: 400;
  margin-left: 0.5rem;
  align-self: flex-end;
  margin-bottom: 0.75rem;
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
  margin-top: 0.5rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const Feature = styled.li`
  padding: 0.75rem 0;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;

  &::before {
    content: '✓';
    color: #4caf50;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const CTAButton = styled.button<{ featured?: boolean }>`
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.featured 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#f5f5f5'};
  color: ${props => props.featured ? 'white' : '#333'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.featured 
      ? '0 8px 20px rgba(102, 126, 234, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FAQSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const FAQTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const FAQItem = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const Question = styled.h3`
  font-size: 1.1rem;
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

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  features: string[];
  featured?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Perfect for trying out MeetMind',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 meetings per month',
      'Up to 30 minutes per meeting',
      'Basic transcription',
      'AI-generated minutes',
      'PDF export',
      'Email support'
    ],
    cta: 'Get Started'
  },
  {
    name: 'Pro',
    description: 'For professionals and small teams',
    monthlyPrice: 5,
    yearlyPrice: 50,
    monthlyPriceId: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID,
    yearlyPriceId: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID,
    features: [
      'Unlimited meetings',
      'Up to 2 hours per meeting',
      'Premium transcription',
      'Advanced AI minutes',
      'Custom templates',
      'Action item tracking',
      'Priority support',
      'Team collaboration'
    ],
    featured: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 15,
    yearlyPrice: 150,
    monthlyPriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    yearlyPriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    features: [
      'Everything in Pro',
      'Unlimited meeting length',
      'Custom AI models',
      'Advanced security',
      'SSO integration',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ],
    cta: 'Contact Sales'
  }
];

function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCTA = async (plan: Plan) => {
    if (plan.name === 'Free') {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        // User is already logged in, go to dashboard
        navigate('/dashboard');
      } else {
        // User is not logged in, go to register
        navigate('/register');
      }
      return;
    }

    // Get the appropriate price ID based on billing period
    const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;

    if (!priceId) {
      alert('Stripe integration not configured yet. Please contact support.');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login/register
      navigate('/register');
      return;
    }

    setLoading(plan.name);

    try {
      const response = await fetch('http://localhost:5237/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId: priceId,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout using the session URL
      window.location.href = data.url || data.sessionUrl;
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Container>
      <Content>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Home
        </BackButton>

        <Header>
          <Title>Simple, Transparent Pricing</Title>
          <Subtitle>
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </Subtitle>
          
          <BillingToggle>
            <ToggleLabel active={!isYearly}>Monthly</ToggleLabel>
            <Toggle isYearly={isYearly} onClick={() => setIsYearly(!isYearly)} />
            <ToggleLabel active={isYearly}>
              Yearly
              <SaveBadge>Save 17%</SaveBadge>
            </ToggleLabel>
          </BillingToggle>
        </Header>

        <PricingGrid>
          {plans.map(plan => (
            <PricingCard key={plan.name} featured={plan.featured}>
              {plan.featured && <FeaturedBadge>Most Popular</FeaturedBadge>}
              
              <PlanName>{plan.name}</PlanName>
              <PlanDescription>{plan.description}</PlanDescription>
              
              <Price>
                <PriceAmount>
                  <Currency>$</Currency>
                  {isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice}
                  <Period>/month</Period>
                </PriceAmount>
                {isYearly && plan.yearlyPrice > 0 && (
                  <OriginalPrice>
                    ${plan.monthlyPrice * 12}/year (was ${plan.monthlyPrice}/mo)
                  </OriginalPrice>
                )}
              </Price>

              <FeatureList>
                {plan.features.map((feature, idx) => (
                  <Feature key={idx}>{feature}</Feature>
                ))}
              </FeatureList>

              <CTAButton 
                featured={plan.featured}
                onClick={() => handleCTA(plan)}
                disabled={loading === plan.name}
              >
                {loading === plan.name 
                  ? 'Processing...' 
                  : plan.name === 'Free'
                    ? 'Get Started'
                    : plan.name === 'Pro'
                      ? 'Start Free Trial'
                      : 'Subscribe Now'}
              </CTAButton>
            </PricingCard>
          ))}
        </PricingGrid>

        <FAQSection>
          <FAQTitle>Frequently Asked Questions</FAQTitle>
          
          <FAQItem>
            <Question>Can I change plans later?</Question>
            <Answer>
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate any charges or credits.
            </Answer>
          </FAQItem>

          <FAQItem>
            <Question>What payment methods do you accept?</Question>
            <Answer>
              We accept all major credit cards (Visa, Mastercard, American Express) and offer 
              invoice billing for Enterprise customers.
            </Answer>
          </FAQItem>

          <FAQItem>
            <Question>Is there a free trial?</Question>
            <Answer>
              Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required 
              to start your trial.
            </Answer>
          </FAQItem>

          <FAQItem>
            <Question>How secure is my data?</Question>
            <Answer>
              We use enterprise-grade encryption (AES-256) for all data at rest and in transit. 
              All audio files and transcripts are stored securely in Azure with SOC 2 compliance.
            </Answer>
          </FAQItem>

          <FAQItem>
            <Question>What happens to my meetings if I cancel?</Question>
            <Answer>
              You'll have 30 days to download your data after cancellation. After that period, 
              all data is permanently deleted according to our data retention policy.
            </Answer>
          </FAQItem>

          <FAQItem>
            <Question>Do you offer refunds?</Question>
            <Answer>
              We offer a 30-day money-back guarantee. If you're not satisfied with MeetMind, 
              contact us within 30 days of purchase for a full refund.
            </Answer>
          </FAQItem>
        </FAQSection>
      </Content>
    </Container>
  );
}

export default Pricing;
