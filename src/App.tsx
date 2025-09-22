import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { MetaMaskProvider } from './contexts/MetaMaskContext';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ParticipantList from './pages/ParticipantList';
import InputScores from './pages/InputScores';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <HeroUIProvider>
      <MetaMaskProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/participants" element={
                  <ProtectedRoute>
                    <Layout>
                      <ParticipantList />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/input-scores/:address" element={
                  <ProtectedRoute>
                    <Layout>
                      <InputScores />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </MetaMaskProvider>
    </HeroUIProvider>
  );
}

export default App;