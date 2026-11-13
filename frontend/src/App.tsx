/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { BackendConfigModal } from './components/common/BackendConfigModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { ModelPage } from './pages/ModelPage';
import { AboutPage } from './pages/AboutPage';
import { useBackendHealth } from './hooks/useBackendHealth';

interface SessionAnalysis {
  id: string;
  fileName: string;
  predictedClass: string;
  confidence: number;
  timestamp: Date;
  inferenceTimeMs?: number;
}

function MainLayout() {
  const location = useLocation();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<SessionAnalysis[]>([]);

  // Reactive hook monitoring FastAPI backend health
  const {
    status: backendStatus,
    baseUrl,
    recheck: recheckBackend,
    pausePolling,
    resumePolling,
  } = useBackendHealth(true, 30000);

  const handleRecordAnalysis = (newAnalysis: SessionAnalysis) => {
    setRecentAnalyses((prev) => [newAnalysis, ...prev].slice(0, 10)); // keep last 10 in-memory
  };

  // Determine if current page uses the sidebar layout (Dashboard & Analyzer)
  const isDashboardArea =
    location.pathname === '/dashboard' || location.pathname === '/analyzer';

  return (
    <div className="min-h-screen flex flex-col bg-[#253237] text-white bg-grid-pattern selection:bg-[#9DB4C0] selection:text-[#253237]">
      {/* Primary Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
        baseUrl={baseUrl}
        onRecheckBackend={recheckBackend}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Render Sidebar for Dashboard & Analyzer */}
        {isDashboardArea && (
          <Sidebar
            backendStatus={backendStatus}
            onOpenSettings={() => setConfigModalOpen(true)}
            className="hidden lg:flex"
          />
        )}

        {/* Dynamic Route Pages */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden ${
            isDashboardArea ? 'w-full lg:max-w-[calc(100%-16rem)]' : 'w-full'
          }`}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  backendStatus={backendStatus}
                  baseUrl={baseUrl}
                  onRecheckBackend={recheckBackend}
                  recentAnalyses={recentAnalyses}
                />
              }
            />
            <Route
              path="/analyzer"
              element={
                <AnalyzerPage
                  backendStatus={backendStatus}
                  baseUrl={baseUrl}
                  onRecheckBackend={recheckBackend}
                  onRecordAnalysis={handleRecordAnalysis}
                  onAnalysisStart={pausePolling}
                  onAnalysisEnd={resumePolling}
                />
              }
            />
            <Route path="/model" element={<ModelPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Catch-all route */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>

      {/* Application Footer */}
      <Footer />

      {/* Global Backend Configuration Modal */}
      <BackendConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSaved={recheckBackend}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
