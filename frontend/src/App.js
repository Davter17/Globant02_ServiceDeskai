import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import './App.css';
import './styles/darkTheme.css';
import './styles/accessibility.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
        <PWAInstallPrompt />
      </Router>
    </ThemeProvider>
  );
}

export default App;
