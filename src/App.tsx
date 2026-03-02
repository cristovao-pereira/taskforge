/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { StrategicProvider } from './contexts/StrategicContext';
import { EventProvider } from './contexts/EventContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MetricsProvider } from './contexts/MetricsContext';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { UpgradeProvider } from './contexts/UpgradeContext';
import { Toaster } from 'sonner';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StrategicDNAPage = lazy(() => import('./pages/StrategicDNAPage'));
const DecisionMapPage = lazy(() => import('./pages/DecisionMapPage'));
const StrategicSessionsPage = lazy(() => import('./pages/StrategicSessionsPage'));
const ExecutionPlansPage = lazy(() => import('./pages/ExecutionPlansPage'));
const RiskAlertsPage = lazy(() => import('./pages/RiskAlertsPage'));
const DecisionForgePage = lazy(() => import('./pages/DecisionForgePage'));
const ClarityForgePage = lazy(() => import('./pages/ClarityForgePage'));
const LeverageForgePage = lazy(() => import('./pages/LeverageForgePage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const SystemStatusPage = lazy(() => import('./pages/SystemStatusPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const PlanCreatePage = lazy(() => import('./pages/PlanCreatePage'));

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
                <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
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
              </Suspense>
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
