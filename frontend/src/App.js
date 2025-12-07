import React from 'react';
import './App.css';

function App() {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const [status, setStatus] = React.useState('Checking...');

  React.useEffect(() => {
    fetch(`${apiUrl.replace('/api', '')}/health`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Backend not available'));
  }, [apiUrl]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎫 Service Desk Application</h1>
        <p>Welcome to the Service Desk Management System</p>
        
        <div className="status-card">
          <h2>System Status</h2>
          <p>Backend: <span className={status === 'OK' ? 'status-ok' : 'status-error'}>{status}</span></p>
          <p>Frontend: <span className="status-ok">Running</span></p>
        </div>

        <div className="info-card">
          <h3>📋 Project Features (Coming Soon)</h3>
          <ul>
            <li>✅ User Authentication (JWT)</li>
            <li>✅ Three User Profiles (Standard, Service Desk, Admin)</li>
            <li>✅ Report Submission with Geolocation</li>
            <li>✅ Image/Video Upload with AI Analysis</li>
            <li>✅ Real-time Chat (Socket.io)</li>
            <li>✅ Mobile-First Responsive Design</li>
            <li>✅ PWA Support</li>
            <li>✅ WCAG AA Accessibility</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>🛠️ Technology Stack</h3>
          <div className="tech-grid">
            <div>
              <h4>Backend</h4>
              <p>Node.js + Express + MongoDB</p>
            </div>
            <div>
              <h4>Frontend</h4>
              <p>React + Redux</p>
            </div>
            <div>
              <h4>DevOps</h4>
              <p>Docker + Docker Compose</p>
            </div>
          </div>
        </div>

        <p className="next-step">
          📝 Next Step: Configure backend base (MongoDB connection, models, JWT auth)
        </p>
      </header>
    </div>
  );
}

export default App;
