import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CompanyRegisterModal from './components/CompanyRegisterModal';
import RoleLoginModal from './components/RoleLoginModal';

import Dashboard from './pages/Dashboard';
import JobCards from './pages/JobCards';
import JobCardDetail from './pages/JobCardDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Billing from './pages/Billing';
import InvoiceEditor from './pages/InvoiceEditor';
import ServiceCatalog from './pages/ServiceCatalog';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import AdCampaigns from './pages/AdCampaigns';
import Accessories from './pages/Accessories';
import AccountsProfitLoss from './pages/AccountsProfitLoss';
import LandingPage from './pages/LandingPage';

import { AuthProvider, useAuth } from './context/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-amber-400">Application Error</h2>
            <p className="text-xs text-slate-400">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Go to Studio Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Studio CRM Internal Layout
function StudioLayout() {
  const { currentCompany } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-carbon-950 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <CompanyRegisterModal />
      <RoleLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Animated Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />

            {/* Studio Operations & CRM Dashboard */}
            <Route path="/dashboard" element={<StudioLayout />}>
              <Route index element={<Dashboard />} />
            </Route>

            <Route element={<StudioLayout />}>
              <Route path="/jobs" element={<JobCards />} />
              <Route path="/jobs/:id" element={<JobCardDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/new" element={<InvoiceEditor />} />
              <Route path="/services" element={<ServiceCatalog />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/ads" element={<AdCampaigns />} />
              <Route path="/accounts" element={<AccountsProfitLoss />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
