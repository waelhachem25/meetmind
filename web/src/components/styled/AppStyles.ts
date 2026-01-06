import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 50;
`;

export const HeaderContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const LogoIcon = styled.div`
  font-size: 2.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: ${float} 3s ease-in-out infinite;
`;

export const LogoText = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.fontSize['2xl']};
    font-weight: 800;
    color: white;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    letter-spacing: -0.5px;
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme, $size }) => {
    if ($size === 'sm') return `${theme.spacing.xs} ${theme.spacing.md}`;
    if ($size === 'lg') return `${theme.spacing.md} ${theme.spacing['2xl']}`;
    return `${theme.spacing.sm} ${theme.spacing.lg}`;
  }};
  font-size: ${({ theme, $size }) => {
    if ($size === 'sm') return theme.fontSize.sm;
    if ($size === 'lg') return theme.fontSize.lg;
    return theme.fontSize.base;
  }};
  font-weight: 600;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  ${({ theme, $variant }) =>
    $variant === 'primary'
      ? css`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `
      : css`
          background-color: white;
          color: ${theme.colors.textSecondary};
          border: 2px solid ${theme.colors.border};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.backgroundSecondary};
            border-color: ${theme.colors.borderDark};
          }
        `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Main = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing.lg}`};
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const Card = styled.div<{ $animated?: boolean; $clickable?: boolean; $delay?: number }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.base};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  ${({ $animated }) =>
    $animated &&
    css`
      animation: ${fadeIn} 0.3s ease-out forwards;
      animation-delay: var(--delay, 0ms);
    `}

  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 20px -5px rgba(102, 126, 234, 0.2);
        border-color: ${({ theme }) => theme.colors.primary}40;
        
        &::before {
          opacity: 1;
        }
      }
    `}
`;

export const ModalCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  animation: ${slideDown} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

export const CardHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg}`};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.xl};
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  
  > div:first-child {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

export const CardFooter = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fontSize.base};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.base};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: white;
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}15;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

export const Alert = styled.div<{ $variant: 'error' | 'success' | 'warning' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.3s ease-out;
  
  ${({ theme, $variant }) => {
    const colors = {
      error: {
        bg: `${theme.colors.error}10`,
        border: theme.colors.error,
        text: theme.colors.errorDark,
      },
      success: {
        bg: `${theme.colors.success}10`,
        border: theme.colors.success,
        text: theme.colors.successDark,
      },
      warning: {
        bg: `${theme.colors.warning}10`,
        border: theme.colors.warning,
        text: theme.colors.warningDark,
      },
      info: {
        bg: `${theme.colors.info}10`,
        border: theme.colors.info,
        text: theme.colors.infoDark,
      },
    };
    const { bg, border, text } = colors[$variant];
    return `
      background-color: ${bg};
      border-left: 4px solid ${border};
      color: ${text};
    `;
  }}

  strong {
    display: block;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  }

  p {
    margin: 0;
    margin-top: 4px;
  }
`;

export const Spinner = styled.div<{ $size?: 'sm' | 'md' | 'lg' }>`
  ${({ $size = 'md' }) => {
    const sizes = { sm: '16px', md: '20px', lg: '40px' };
    return `
      width: ${sizes[$size]};
      height: ${sizes[$size]};
    `;
  }}
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};

  p {
    margin-top: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const EmptyState = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  max-width: 600px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.backgroundSecondary} 0%, white 100%);

  h2 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.fontSize.lg};
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.borderLight};

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize['2xl']};
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const MeetingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const Badge = styled.span<{ $variant: 'gray' | 'info' | 'warning' | 'success' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ theme, $variant }) => {
    const variants = {
      gray: { bg: theme.colors.backgroundTertiary, text: theme.colors.textSecondary, border: theme.colors.border },
      info: { bg: `${theme.colors.info}10`, text: theme.colors.infoDark, border: `${theme.colors.info}30` },
      warning: { bg: `${theme.colors.warning}10`, text: theme.colors.warningDark, border: `${theme.colors.warning}30` },
      success: { bg: `${theme.colors.success}10`, text: theme.colors.successDark, border: `${theme.colors.success}30` },
      error: { bg: `${theme.colors.error}10`, text: theme.colors.errorDark, border: `${theme.colors.error}30` },
    };
    const { bg, text, border } = variants[$variant];
    return `
      background-color: ${bg};
      color: ${text};
      border: 1px solid ${border};
    `;
  }}
`;

export const MeetingTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const MeetingMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  margin-top: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};

  p {
    margin: 0;
  }
`;
