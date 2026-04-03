import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('DEBUG: Main.tsx Imports successful, attempting render...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('CRITICAL: Root element not found!');
  } else {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('DEBUG: Render call complete.');
  }
} catch (e) {
  console.error('CRITICAL: Exception in main.tsx:', e);
}
