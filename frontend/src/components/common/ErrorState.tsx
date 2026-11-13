import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Settings2 } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
  onConfigure?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Analysis Request Failed',
  message,
  onRetry,
  onReset,
  onConfigure,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-[#253237]/90 border border-rose-500/40 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        <p className="text-xs sm:text-sm text-[#E0FBFC] max-w-md leading-relaxed">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 w-full">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5C6B73] hover:bg-[#9DB4C0] text-white transition-colors shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          )}

          {onConfigure && (
            <button
              onClick={onConfigure}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#1b2529] hover:bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/30 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configure Backend</span>
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#C2DFE3] hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Choose Another Image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
