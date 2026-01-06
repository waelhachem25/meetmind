import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSize.base};
    line-height: ${({ theme }) => theme.lineHeight.normal};
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 400px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.03;
      z-index: -1;
      pointer-events: none;
    }
  }

  button {
    font-family: inherit;
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSize['3xl']};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    line-height: ${({ theme }) => theme.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    line-height: ${({ theme }) => theme.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSize.xl};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    line-height: ${({ theme }) => theme.lineHeight.snug};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  input,
  textarea,
  select {
    font-family: inherit;
  }
`;
