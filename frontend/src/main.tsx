import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
import { I18nProvider } from './i18n';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/negocio.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <Root />
    </I18nProvider>
  </StrictMode>,
);
