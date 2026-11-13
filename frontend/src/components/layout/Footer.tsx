import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, Code2, AlertTriangle } from 'lucide-react';
import { MANDATORY_DISCLAIMER_TEXT } from '../common/Disclaimer';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#253237] border-t border-[#5C6B73]/40 text-[#E0FBFC] mt-auto">
      {/* Disclaimer Strip */}
      <div className="bg-[#1b2529] border-b border-[#5C6B73]/30 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#9DB4C0] shrink-0 mt-0.5" />
          <p className="text-xs text-[#C2DFE3] leading-relaxed">
            <strong className="text-white">Research Disclaimer: </strong>
            {MANDATORY_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5C6B73] to-[#9DB4C0] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Pulmo<span className="text-[#9DB4C0]">Vision</span> AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#C2DFE3] max-w-md leading-relaxed">
              An explainable deep-learning healthcare research platform combining residual convolutional networks (ResNet50) with Gradient-weighted Class Activation Mapping (Grad-CAM) for lung CT scan classification.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E0FBFC] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#9DB4C0]" />
              <span>In-memory processing • Zero CT image persistence</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-[#E0FBFC] hover:text-[#9DB4C0] transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#E0FBFC] hover:text-[#9DB4C0] transition-colors">
                  Clinical Dashboard
                </Link>
              </li>
              <li>
                <Link to="/analyzer" className="text-[#E0FBFC] hover:text-[#9DB4C0] transition-colors">
                  CT Scan Analyzer
                </Link>
              </li>
              <li>
                <Link to="/model" className="text-[#E0FBFC] hover:text-[#9DB4C0] transition-colors">
                  ResNet50 Architecture
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#E0FBFC] hover:text-[#9DB4C0] transition-colors">
                  Project Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Technology Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Research Stack
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-[#C2DFE3]">
              <span className="px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                ResNet50
              </span>
              <span className="px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                Grad-CAM
              </span>
              <span className="px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                TensorFlow / Keras
              </span>
              <span className="px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                FastAPI
              </span>
              <span className="px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                Python 3.10+
              </span>
              <span className="px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                React & TypeScript
              </span>
            </div>
            <p className="text-[11px] text-[#C2DFE3]/80 pt-1">
              Architecture: Convolutional Feature Extraction → Global Average Pooling → 4-Class Softmax
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#5C6B73]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#C2DFE3] gap-4">
          <p>© {new Date().getFullYear()} PulmoVision AI Research Project. Academic & Research Prototype.</p>
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9DB4C0]"></span>
            Explainable AI (XAI) for Medical Imaging
          </p>
        </div>
      </div>
    </footer>
  );
};
