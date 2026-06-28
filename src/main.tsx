import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuntieProvider } from './context/AuntieContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuntieProvider>
      <App />
    </AuntieProvider>
  </StrictMode>,
);
