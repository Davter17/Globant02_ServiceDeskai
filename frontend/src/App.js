import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from './contexts/ThemeContext';
import { loadUser } from './redux/slices/authSlice';
import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import './App.css';
import './styles/darkTheme.css';
import './styles/accessibility.css';

function App() {
  const dispatch = useDispatch();

  // Load user on app initialization if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

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
