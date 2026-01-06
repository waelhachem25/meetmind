
import styled from 'styled-components';

const FooterWrap = styled.footer`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #b9c0d0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 40px 0 24px;
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr;
  gap: 28px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Brand = styled.div``;

const BrandName = styled.h3`
  color: #ffffff;
  margin: 0 0 8px 0;
  font-size: 20px;
  letter-spacing: 0.2px;
`;

const Tagline = styled.p`
  margin: 0;
  color: #9aa4b2;
  line-height: 1.6;
`;

const Col = styled.div``;

const Title = styled.h4`
  color: #e5e9f0;
  margin: 0 0 12px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const LinkItem = styled.a`
  display: block;
  color: #c7d0dd;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 0;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }
`;

const Muted = styled.p`
  color: #9aa4b2;
  font-size: 14px;
  margin: 0;
  line-height: 1.7;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;

  a {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    color: #e5e9f0;
    text-decoration: none;
    transition: transform 0.12s ease, background 0.12s ease;

    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.12);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const BottomBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  nav {
    display: flex;
    gap: 16px;
  }

  a {
    color: #9aa4b2;
    text-decoration: none;
    font-size: 13px;
  }

  a:hover {
    color: #ffffff;
  }

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <FooterWrap>
      <Inner>
        <Grid>
          <Brand>
            <BrandName>MeetMind</BrandName>
            <Tagline>
              Your meeting co‑pilot. Upload audio and get clean minutes, decisions, action items,
              and a polished PDF—so teams can focus on the conversation.
            </Tagline>
          </Brand>

          <Col>
            <Title>Resources</Title>
            <LinkItem href="/help">Help Center</LinkItem>
            <LinkItem href="/docs">Docs</LinkItem>
            <LinkItem href="/changelog">Changelog</LinkItem>
            <LinkItem href="/status">Status</LinkItem>
          </Col>

          <Col>
            <Title>Contact</Title>
            <Muted>waelhachem80@gmail.com</Muted>
            <Muted>Mon–Fri · 9:00–18:00</Muted>
            <SocialRow>
              <a aria-label="Email" href="https://mail.google.com/mail/?view=cm&fs=1&to=waelhachem80@gmail.com">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a aria-label="WhatsApp" href="https://wa.me/96176713484" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </SocialRow>
          </Col>
        </Grid>

        <BottomBar>
          <Muted>© {year} MeetMind. All rights reserved.</Muted>
          <nav>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </nav>
        </BottomBar>
      </Inner>
    </FooterWrap>
  );
}