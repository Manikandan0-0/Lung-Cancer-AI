import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Settings2, Server } from 'lucide-react';
import { BackendConnectionStatus } from '../../types/api';
import { BackendConfigModal } from './BackendConfigModal';

interface BackendStatusProps {
  status: BackendConnectionStatus;
  baseUrl: string;
  onRecheck: () => void;
  compact?: boolean;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({
  status,
  baseUrl,
  onRecheck,
  compact = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModalOpen(true)}
            title={`Backend: ${baseUrl} (${status})`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              status === 'connected'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
                : status === 'checking'
                ? 'bg-[#5C6B73]/30 text-[#C2DFE3] border border-[#9DB4C0]/30 hover:border-[#9DB4C0]'
                : 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:border-rose-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : status === 'checking'
                  ? 'bg-[#9DB4C0] animate-ping'
                  : 'bg-rose-400'
              }`}
            />
            <span className="hidden sm:inline">
              {status === 'connected'
                ? 'Backend Connected'
                : status === 'checking'
                ? 'Connecting...'
                : 'Backend Disconnected'}
            </span>
            <Settings2 className="w-3 h-3 text-[#C2DFE3] ml-0.5 opacity-80 hover:opacity-100" />
          </button>
        </div>

        <BackendConfigModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={() => onRecheck()}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`p-4 rounded-xl border transition-all ${
          status === 'connected'
            ? 'bg-[#253237]/80 border-emerald-500/40 shadow-sm'
            : status === 'checking'
            ? 'bg-[#253237]/80 border-[#9DB4C0]/40 shadow-sm'
            : 'bg-[#253237]/90 border-rose-500/40 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : status === 'checking'
                  ? 'bg-[#5C6B73]/20 text-[#9DB4C0] border-[#9DB4C0]/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {status === 'connected' ? (
                <Wifi className="w-5 h-5" />
              ) : status === 'checking' ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">
                  {status === 'connected'
                    ? 'FastAPI ML Backend Online'
                    : status === 'checking'
                    ? 'Testing Backend Connection...'
                    : 'Backend Disconnected'}
                </h4>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    status === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : status === 'checking'
                      ? 'bg-[#5C6B73]/30 text-[#C2DFE3]'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-[#C2DFE3] font-mono mt-0.5">
                Target: {baseUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecheck}
              disabled={status === 'checking'}
              className="p-2 rounded-lg text-[#C2DFE3] hover:text-white hover:bg-[#5C6B73]/30 border border-white/5 transition-colors disabled:opacity-50"
              title="Re-check health"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5C6B73]/40 hover:bg-[#5C6B73] text-[#E0FBFC] border border-[#9DB4C0]/30 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {status === 'disconnected' && (
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-[#E0FBFC]/90 flex items-start justify-between gap-3">
            <span>
              The application cannot reach <code className="text-[#9DB4C0] font-mono">{baseUrl}</code>. Start your local FastAPI server to enable live ResNet50 predictions and Grad-CAM generation.
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="shrink-0 text-xs text-[#9DB4C0] hover:underline font-medium"
            >
              Setup Guide →
            </button>
          </div>
        )}
      </div>

      <BackendConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => onRecheck()}
      />
    </>
  );
};
