import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Cpu,
  Layers,
  Eye,
  Wifi,
  WifiOff,
  History,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  Binary,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Settings,
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackendConfigModal } from '../components/common/BackendConfigModal';
import { BackendConnectionStatus, NormalizedPredictionResult } from '../types/api';

interface DashboardPageProps {
  backendStatus: BackendConnectionStatus;
  baseUrl: string;
  onRecheckBackend: () => void;
  recentAnalyses: Array<{
    id: string;
    fileName: string;
    predictedClass: string;
    confidence: number;
    timestamp: Date;
    inferenceTimeMs?: number;
  }>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  backendStatus,
  baseUrl,
  onRecheckBackend,
  recentAnalyses,
}) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Research Dashboard
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/30 font-medium">
              V1.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#C2DFE3] mt-1">
            System status, ResNet50 model specifications, and session activity tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#5C6B73] to-[#9DB4C0] hover:from-[#475359] hover:to-[#C2DFE3] text-white shadow-md shadow-[#9DB4C0]/20 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span>Launch CT Analyzer</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Regulatory / Safety Disclaimer */}
      <Disclaimer variant="card" />

      {/* Four Dashboard Information Cards (NO fabricated accuracy metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Model Architecture */}
        <div className="p-5 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 shadow-xl hover:border-[#9DB4C0] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#C2DFE3] uppercase tracking-wider">
              Architecture
            </span>
            <div className="p-2 rounded-xl bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">ResNet50</h3>
            <p className="text-xs text-[#E0FBFC] mt-0.5">
              50-layer deep residual network with bottleneck residual building blocks.
            </p>
          </div>
          <div className="pt-2 border-t border-[#5C6B73]/30 flex items-center justify-between text-[11px] text-[#C2DFE3]">
            <span>Input Size: 224×224×3</span>
            <Link to="/model" className="text-[#9DB4C0] hover:underline font-medium">
              Details →
            </Link>
          </div>
        </div>

        {/* Card 2: Supported Classes */}
        <div className="p-5 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 shadow-xl hover:border-[#9DB4C0] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#C2DFE3] uppercase tracking-wider">
              Classification
            </span>
            <div className="p-2 rounded-xl bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">4 Classes</h3>
            <p className="text-xs text-[#E0FBFC] mt-0.5">
              Adenocarcinoma, Large Cell, Normal, Squamous Cell.
            </p>
          </div>
          <div className="pt-2 border-t border-[#5C6B73]/30 flex items-center justify-between text-[11px] text-[#C2DFE3]">
            <span>Categorical Cross-Entropy</span>
            <span className="text-[#9DB4C0]">Softmax</span>
          </div>
        </div>

        {/* Card 3: Explainability */}
        <div className="p-5 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 shadow-xl hover:border-[#9DB4C0] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#C2DFE3] uppercase tracking-wider">
              Explainability
            </span>
            <div className="p-2 rounded-xl bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">Grad-CAM</h3>
            <p className="text-xs text-[#E0FBFC] mt-0.5">
              Gradient-weighted Class Activation Mapping for spatial transparency.
            </p>
          </div>
          <div className="pt-2 border-t border-[#5C6B73]/30 flex items-center justify-between text-[11px] text-[#C2DFE3]">
            <span>Target: conv5_block3_out</span>
            <span className="text-[#9DB4C0]">Saliency Map</span>
          </div>
        </div>

        {/* Card 4: Backend Status */}
        <div
          className={`p-5 rounded-2xl border shadow-xl transition-all space-y-3 ${
            backendStatus === 'connected'
              ? 'bg-[#253237] border-emerald-500/40 hover:border-emerald-400'
              : 'bg-[#253237] border-rose-500/40 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#C2DFE3] uppercase tracking-wider">
              Backend Status
            </span>
            <div
              className={`p-2 rounded-xl border ${
                backendStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {backendStatus === 'connected' ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
            </div>
          </div>
          <div>
            <h3
              className={`text-2xl font-extrabold ${
                backendStatus === 'connected' ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </h3>
            <p className="text-xs text-[#E0FBFC] mt-0.5 truncate font-mono">
              {baseUrl}
            </p>
          </div>
          <div className="pt-2 border-t border-[#5C6B73]/30 flex items-center justify-between text-[11px]">
            <button
              onClick={onRecheckBackend}
              className="text-[#C2DFE3] hover:text-white transition-colors"
            >
              Check Health
            </button>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="text-[#9DB4C0] hover:underline font-semibold"
            >
              Configure →
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content: Overview or Analysis History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#5C6B73]/40 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <History className="w-5 h-5 text-[#9DB4C0]" />
              Recent Analysis Activity
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#5C6B73]/30 text-[#C2DFE3]">
              Session History ({recentAnalyses.length})
            </span>
          </div>

          <div className="text-xs text-[#C2DFE3] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9DB4C0]" />
            <span>Zero Image Persistence Enforced</span>
          </div>
        </div>

        {/* Empty state or list */}
        {recentAnalyses.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-2xl bg-[#253237]/80 border border-[#5C6B73]/30 text-center space-y-4 max-w-xl mx-auto shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5C6B73]/20 border border-[#9DB4C0]/30 flex items-center justify-center text-[#9DB4C0]">
              <ScanLine className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Analyses Performed Yet</h3>
              <p className="text-xs sm:text-sm text-[#E0FBFC]/80 leading-relaxed max-w-md mx-auto">
                No CT scans have been processed during this session. To run an analysis, upload an axial chest CT slice in the CT Scan Analyzer.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/analyzer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#5C6B73] hover:bg-[#9DB4C0] text-white transition-colors shadow-md"
              >
                <span>Upload First CT Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-[11px] text-[#C2DFE3]/70 pt-2">
              Note: Uploaded CT scan images are processed in-memory and are never stored or persisted.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-[#5C6B73]/40 bg-[#253237]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1b2529] text-[#C2DFE3] font-semibold border-b border-[#5C6B73]/30 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Filename</th>
                    <th className="p-3.5">Predicted Class</th>
                    <th className="p-3.5">Model Output Score</th>
                    <th className="p-3.5">Inference Time</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5C6B73]/20 text-[#E0FBFC]">
                  {recentAnalyses.map((item) => (
                    <tr key={item.id} className="hover:bg-[#5C6B73]/15 transition-colors">
                      <td className="p-3.5 font-medium text-white flex items-center gap-2">
                        <ScanLine className="w-3.5 h-3.5 text-[#9DB4C0]" />
                        <span className="font-mono">{item.fileName}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#5C6B73]/30 text-white border border-[#9DB4C0]/30">
                          {item.predictedClass}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#9DB4C0]">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-3.5 font-mono text-[#C2DFE3]">
                        {item.inferenceTimeMs ? `${item.inferenceTimeMs}ms` : '—'}
                      </td>
                      <td className="p-3.5 text-[#C2DFE3]">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to="/analyzer"
                          className="text-xs text-[#9DB4C0] hover:underline font-medium"
                        >
                          View in Analyzer →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <BackendConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSaved={onRecheckBackend}
      />
    </div>
  );
};
