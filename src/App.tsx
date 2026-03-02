/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import StrategicDNAPage from './pages/StrategicDNAPage';
import DecisionMapPage from './pages/DecisionMapPage';
import StrategicSessionsPage from './pages/StrategicSessionsPage';
import ExecutionPlansPage from './pages/ExecutionPlansPage';
import RiskAlertsPage from './pages/RiskAlertsPage';
import DecisionForgePage from './pages/DecisionForgePage';
import ClarityForgePage from './pages/ClarityForgePage';
import LeverageForgePage from './pages/LeverageForgePage';
import BillingPage from './pages/BillingPage';
import SystemStatusPage from './pages/SystemStatusPage';
import DocumentsPage from './pages/DocumentsPage';
import PlanCreatePage from './pages/PlanCreatePage';
import AppLayout from './layouts/AppLayout';
import { StrategicProvider } from './contexts/StrategicContext';
import { EventProvider } from './contexts/EventContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MetricsProvider } from './contexts/MetricsContext';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { UpgradeProvider } from './contexts/UpgradeContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <EventProvider>
          <NotificationProvider>
            <StrategicProvider>
              <MetricsProvider>
                <UpgradeProvider>
                <AppProvider>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/como-funciona" element={<HowItWorksPage />} />
                <Route path="/precos" element={<PricingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Routes (App) */}
                <Route path="/app" element={<AppLayout><Navigate to="/app/dashboard" replace /></AppLayout>} />
                <Route path="/app/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
                <Route path="/app/chat" element={<AppLayout><ChatPage /></AppLayout>} />
                <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                <Route path="/app/dna" element={<AppLayout><StrategicDNAPage /></AppLayout>} />
                <Route path="/app/map" element={<AppLayout><DecisionMapPage /></AppLayout>} />
                <Route path="/app/sessions" element={<AppLayout><StrategicSessionsPage /></AppLayout>} />
                <Route path="/app/plans" element={<AppLayout><ExecutionPlansPage /></AppLayout>} />
                <Route path="/app/plans/create" element={<AppLayout><PlanCreatePage /></AppLayout>} />
                <Route path="/app/risks" element={<AppLayout><RiskAlertsPage /></AppLayout>} />
                <Route path="/app/agent/decision" element={<AppLayout><DecisionForgePage /></AppLayout>} />
                <Route path="/app/agent/clarity" element={<AppLayout><ClarityForgePage /></AppLayout>} />
                <Route path="/app/agent/leverage" element={<AppLayout><LeverageForgePage /></AppLayout>} />
                <Route path="/app/billing" element={<AppLayout><BillingPage /></AppLayout>} />
                <Route path="/app/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
                <Route path="/app/status" element={<AppLayout><SystemStatusPage /></AppLayout>} />
                
                {/* Placeholders for other routes */}
                <Route path="/app/agents" element={<AppLayout><div className="p-8 text-white">Agentes (Em breve)</div></AppLayout>} />
                <Route path="/app/analytics" element={<AppLayout><div className="p-8 text-white">Relatórios (Em breve)</div></AppLayout>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster 
                position="top-right" 
                theme="dark"
                toastOptions={{
                  style: {
                    background: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #3b82f6',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  },
                  duration: 3000,
                }}
              />
                </AppProvider>
              </UpgradeProvider>
            </MetricsProvider>
          </StrategicProvider>
          </NotificationProvider>
        </EventProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
