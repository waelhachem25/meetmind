import styled from 'styled-components';

const TestDiv = styled.div`
  background: red;
  padding: 20px;
  color: white;
`;

export default function AppTest() {
  return (
    <TestDiv>
      <h1>Hello World - Test</h1>
      <p>If you see this, styled-components is working!</p>
    </TestDiv>
  );
}
