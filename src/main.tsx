import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CoreProvider } from './core/useCore';
import { initPwa } from './pwa';
import './styles/global.css';

initPwa();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('عنصر #root غير موجود');

createRoot(rootEl).render(
  <StrictMode>
    <CoreProvider>
      <App />
    </CoreProvider>
  </StrictMode>,
);
