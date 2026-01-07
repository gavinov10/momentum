import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { JobTracker } from './pages/JobTracker';
import { ResumeGenerator } from './pages/ResumeGenerator';
import './App.css';

function App() {
  const { isAuthenticated, loadUser, token, isLoading } = useAuthStore();

  // Load user data on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }
    return <Login />;
  }

  // Show main app with routing if authenticated
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/job-tracker" element={<JobTracker />} />
            <Route path="/resume-generator" element={<ResumeGenerator />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;