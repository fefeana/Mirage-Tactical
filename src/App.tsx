import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminDashboard from './AdminDashboard';
import ClientPortal from './ClientPortal';
import MirageDashboard from './components/MirageDashboard';
import CyberLogin from './components/CyberLogin';
import IdentityGate from './components/IdentityGate';
import { ErrorBoundary } from './ErrorBoundary';
import MiragePanel from './MiragePanel';

export default function App() {
  const openSettingsModal = () => {
    console.log("Opening Mirage Settings...");
    // You can add logic here to open a global settings modal if needed
  };

  return (
    <ErrorBoundary>
      <Toaster position="top-center" theme="dark" richColors toastOptions={{ style: { background: 'rgba(5, 11, 20, 0.9)', border: '1px solid rgba(255, 0, 68, 0.5)', color: '#fff', backdropFilter: 'blur(10px)' } }} />
      <Router>
        <Routes>
          <Route path="/" element={<MiragePanel />} />
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/sso" element={<CyberLogin />} />
          <Route path="/gate" element={<IdentityGate />} />
          <Route path="/hq/:key" element={<AdminDashboard />} />
          <Route path="/console" element={<MirageDashboard />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
