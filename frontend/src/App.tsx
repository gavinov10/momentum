import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { Login } from "./components/Login";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { OAuthCallback } from "./components/OAuthCallback";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { JobTracker } from "./pages/JobTracker";
import { ResumeGenerator } from "./pages/ResumeGenerator";
import "./App.css";

function App() {
  const { isAuthenticated, loadUser, token, isLoading } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        {/* Auth routes */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          /* Protected routes */
          <Route
            element={
              <div className="app">
                <Navbar />
                <main className="app-main">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/job-tracker" element={<JobTracker />} />
                    <Route
                      path="/resume-generator"
                      element={<ResumeGenerator />}
                    />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </main>
              </div>
            }
            path="*"
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
