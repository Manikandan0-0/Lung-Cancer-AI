import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'banner' | 'card' | 'inline' | 'compact';
  className?: string;
}

export const MANDATORY_DISCLAIMER_TEXT =
  "This application is an experimental AI research prototype. Its predictions and Grad-CAM visualizations are not medical diagnoses. Results must not be used to make clinical decisions. Interpretation by a qualified medical professional is required.";

export const Disclaimer: React.FC<DisclaimerProps> = ({
  variant = 'card',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs text-[#C2DFE3] bg-[#253237]/80 border border-[#C2DFE3]/30 px-3 py-2 rounded-lg ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#9DB4C0] shrink-0" />
        <span className="leading-relaxed">
          <strong>Research Prototype:</strong> Predictions and Grad-CAM are not medical diagnoses. For research demonstration only.
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full bg-[#253237] border-y border-[#9DB4C0]/30 py-2.5 px-4 sm:px-6 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <div className="p-1 rounded bg-[#5C6B73]/30 text-[#9DB4C0] shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-[#E0FBFC] font-normal leading-relaxed">
            <span className="font-semibold text-white mr-1.5">Medical Safety Notice:</span>
            {MANDATORY_DISCLAIMER_TEXT}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#C2DFE3]/25 bg-gradient-to-r from-[#253237] to-[#5C6B73]/30 p-4 sm:p-5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-[#5C6B73]/40 text-[#9DB4C0] border border-[#9DB4C0]/30 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            Experimental AI Research Prototype
            <span className="text-[11px] font-normal text-[#9DB4C0] bg-[#253237] px-2 py-0.5 rounded border border-[#9DB4C0]/40">
              Non-Diagnostic
            </span>
          </h4>
          <p className="text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            {MANDATORY_DISCLAIMER_TEXT}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-[#C2DFE3]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9DB4C0]" />
              Zero Image Persistence
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9DB4C0]"></span>
              Academic ResNet50 & Grad-CAM Study
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
