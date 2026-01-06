import { theme } from './styles/theme'

export default function TestApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Testing styled-components</h1>
      <p>Theme primary color: {theme.colors.primary}</p>
    </div>
  )
}
