import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom'; // <-- Import BrowserRouter
import { AuthProvider } from './context/AuthContext'; // <-- Import AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* --- Wrap App with BrowserRouter and AuthProvider --- */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    {/* --- End Wrappers --- */}
  </StrictMode>,
);
