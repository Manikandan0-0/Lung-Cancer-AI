import React, { useState } from 'react';
import { X, Server, RefreshCw, CheckCircle2, AlertCircle, Terminal, HelpCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState(apiService.getBaseUrl());
  const [fieldName, setFieldName] = useState(apiService.getUploadFieldName());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Temporarily point apiService to test URL
    const originalUrl = apiService.getBaseUrl();
    apiService.setBaseUrl(url);

    try {
      const res = await apiService.checkHealth();
      if (res.isConnected) {
        setTestResult({
          success: true,
          message: `Successfully connected to FastAPI server! Model: ${res.data?.model || 'ResNet50'} (${res.data?.status})`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Server did not respond to /health or / request.',
        });
        // restore original if test failed
        apiService.setBaseUrl(originalUrl);
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection failed',
      });
      apiService.setBaseUrl(originalUrl);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    apiService.setBaseUrl(url);
    apiService.setUploadFieldName(fieldName);
    onSaved();
    onClose();
  };

  const handleReset = () => {
    apiService.resetBaseUrl();
    apiService.setUploadFieldName('file');
    setUrl(apiService.getBaseUrl());
    setFieldName('file');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#253237] border border-[#9DB4C0]/40 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#253237] via-[#9DB4C0] to-[#C2DFE3]" />

        <div className="flex items-center justify-between pb-4 border-b border-[#5C6B73]/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#5C6B73]/30 text-[#9DB4C0]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">FastAPI Backend Connection</h3>
              <p className="text-xs text-[#C2DFE3]">Configure integration with local ResNet50 ML server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#C2DFE3] hover:text-white hover:bg-[#5C6B73]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-5 text-sm text-[#E0FBFC]">
          {/* Base URL input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white flex items-center justify-between">
              <span>Backend Base URL</span>
              <span className="text-[11px] text-[#C2DFE3]">Default: http://localhost:8000</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b2529] border border-[#5C6B73]/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#9DB4C0] transition-colors"
            />
          </div>

          {/* Multipart Form Field Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white flex items-center justify-between">
              <span>Upload Multipart Field Name</span>
              <span className="text-[11px] text-[#C2DFE3]">Usually: file or image</span>
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="file"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b2529] border border-[#5C6B73]/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#9DB4C0] transition-colors"
            />
          </div>

          {/* Test connection output */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Quick Terminal Guide for FastAPI */}
          <div className="p-3.5 rounded-xl bg-[#1b2529]/80 border border-[#5C6B73]/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#C2DFE3]">
              <Terminal className="w-3.5 h-3.5 text-[#9DB4C0]" />
              <span>How to run your local FastAPI backend:</span>
            </div>
            <pre className="text-xs font-mono bg-black/40 p-2.5 rounded-lg text-[#9DB4C0] overflow-x-auto border border-[#5C6B73]/30">
              uvicorn main:app --reload --port 8000
            </pre>
            <p className="text-[11px] text-[#C2DFE3]/80">
              Ensure FastAPI enables CORS with: <code className="text-white">allow_origins=[&quot;*&quot;]</code>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#5C6B73]/40">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#5C6B73] hover:bg-[#9DB4C0] text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#C2DFE3] hover:text-white px-2.5 py-2 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-[#E0FBFC] hover:bg-white/5 border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-semibold bg-[#9DB4C0] hover:bg-[#C2DFE3] text-[#253237] shadow-md transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
