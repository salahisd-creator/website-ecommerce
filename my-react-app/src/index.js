import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './theme.css';
import './palette.css';
import { PrefsProvider } from './prefs';
import { StoreSettingsProvider } from './settings';
import { CartProvider } from './cartStore';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrefsProvider>
      <StoreSettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </StoreSettingsProvider>
    </PrefsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// PWA: تسريع الزيارات المتكررة وإمكانية تثبيت الموقع على الهاتف (في النسخة المنشورة فقط)
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
