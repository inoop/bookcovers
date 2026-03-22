import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { injectFontFaces } from './theme/fonts';

injectFontFaces();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
