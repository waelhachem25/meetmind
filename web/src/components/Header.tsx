import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const HeaderWrap = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Inner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoIcon = styled.div`
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;

const LogoText = styled.div`
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  p {
    margin: 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.25rem;
    }
    p {
      display: none;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 960px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled.a<{ $active?: boolean }>`
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 15px;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 0.4rem 0.75rem;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 1.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding-left: 0.75rem;
    gap: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem;
    gap: 0.5rem;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const UserName = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 1rem;
    font-size: 13px;
  }
`;

// Mobile Menu Styles
const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  @media (max-width: 960px) {
    display: flex;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 960px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 126, 234, 0.98);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 2rem;
    gap: 1rem;
    overflow-y: auto;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MobileNavLink = styled.a<{ $active?: boolean }>`
  color: white;
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 18px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(4px);
  }
`;

const MobileUserSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const MobileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const MobileUserName = styled.span`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

const MobileLogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <HeaderWrap>
      <Inner>
        <LogoSection onClick={() => handleNavClick('/')}>
          <LogoIcon>🧠</LogoIcon>
          <LogoText>
            <h1>MeetMind</h1>
            <p>Transform meetings into insights</p>
          </LogoText>
        </LogoSection>

        {/* Desktop Navigation */}
        <Nav>
          <NavLinks>
            <NavLink $active={isActive('/')} onClick={() => navigate('/')}>
              🏠 Home
            </NavLink>
            {user && (
              <NavLink $active={isActive('/dashboard')} onClick={() => navigate('/dashboard')}>
                📊 Dashboard
              </NavLink>
            )}
            <NavLink $active={isActive('/upload')} onClick={() => navigate('/upload')}>
              📤 Upload Meeting
            </NavLink>
            <NavLink $active={isActive('/meetings')} onClick={() => navigate('/meetings')}>
              📁 All Meetings
            </NavLink>
            <NavLink $active={isActive('/pricing')} onClick={() => navigate('/pricing')}>
              💎 Pricing
            </NavLink>
            {user && (
              <NavLink $active={isActive('/account')} onClick={() => navigate('/account')}>
                ⚙️ Account
              </NavLink>
            )}
            {user && user.role === 'Admin' && (
              <NavLink $active={isActive('/admin')} onClick={() => navigate('/admin')}>
                👑 Admin
              </NavLink>
            )}
          </NavLinks>

          {user && (
            <UserSection>
              <UserInfo>
                <Avatar>
                  {user.fullName?.charAt(0).toUpperCase() || '👤'}
                </Avatar>
                <UserName>{user.fullName}</UserName>
              </UserInfo>
              <LogoutButton onClick={handleLogout}>
                🚪 Logout
              </LogoutButton>
            </UserSection>
          )}
        </Nav>

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
      </Inner>

      {/* Mobile Menu */}
      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavLink $active={isActive('/')} onClick={() => handleNavClick('/')}>
          🏠 Home
        </MobileNavLink>
        {user && (
          <MobileNavLink $active={isActive('/dashboard')} onClick={() => handleNavClick('/dashboard')}>
            📊 Dashboard
          </MobileNavLink>
        )}
        <MobileNavLink $active={isActive('/upload')} onClick={() => handleNavClick('/upload')}>
          📤 Upload Meeting
        </MobileNavLink>
        <MobileNavLink $active={isActive('/meetings')} onClick={() => handleNavClick('/meetings')}>
          📁 All Meetings
        </MobileNavLink>
        <MobileNavLink $active={isActive('/pricing')} onClick={() => handleNavClick('/pricing')}>
          💎 Pricing
        </MobileNavLink>
        {user && (
          <MobileNavLink $active={isActive('/account')} onClick={() => handleNavClick('/account')}>
            ⚙️ Account
          </MobileNavLink>
        )}
        {user && user.role === 'Admin' && (
          <MobileNavLink $active={isActive('/admin')} onClick={() => handleNavClick('/admin')}>
            👑 Admin
          </MobileNavLink>
        )}

        {user && (
          <MobileUserSection>
            <MobileUserInfo>
              <MobileAvatar>
                {user.fullName?.charAt(0).toUpperCase() || '👤'}
              </MobileAvatar>
              <MobileUserName>{user.fullName}</MobileUserName>
            </MobileUserInfo>
            <MobileLogoutButton onClick={handleLogout}>
              🚪 Logout
            </MobileLogoutButton>
          </MobileUserSection>
        )}
      </MobileMenu>
    </HeaderWrap>
  );
}
