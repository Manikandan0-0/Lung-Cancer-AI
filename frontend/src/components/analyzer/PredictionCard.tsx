import React from 'react';
import { Activity, CheckCircle2, Clock, AlertTriangle, Layers, Info } from 'lucide-react';
import { NormalizedPredictionResult } from '../../types/api';

interface PredictionCardProps {
  result: NormalizedPredictionResult;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ result }) => {
  const isNormal = result.predictedClass === 'Normal';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#253237] border border-[#9DB4C0]/40 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
      {/* Decorative accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5C6B73] via-[#9DB4C0] to-[#C2DFE3]" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Model Prediction Class */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#5C6B73]/30 text-[#C2DFE3] border border-[#9DB4C0]/30 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#9DB4C0]" />
              ResNet50 Classification
            </span>
            <span className="text-xs font-mono text-[#E0FBFC]/70">
              Status: <span className="text-emerald-400 capitalize">{result.status}</span>
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-[#C2DFE3] uppercase tracking-wider">
              Predicted Class
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              {result.predictedClass}
            </h2>
            <p className="text-xs text-[#E0FBFC] mt-1">
              Raw backend label: <code className="text-[#9DB4C0] font-mono">{result.rawPredictedClass}</code>
            </p>
          </div>

          {/* Subtype descriptive context */}
          <div className="text-xs text-[#C2DFE3] max-w-lg leading-relaxed">
            {result.predictedClass === 'Adenocarcinoma' && (
              <span>Non-small cell lung cancer (NSCLC) subtype typically originating in peripheral lung epithelial tissue.</span>
            )}
            {result.predictedClass === 'Large Cell Carcinoma' && (
              <span>Rapid-growing undifferentiated non-small cell lung carcinoma with large abnormal cellular morphology.</span>
            )}
            {result.predictedClass === 'Squamous Cell Carcinoma' && (
              <span>Non-small cell lung carcinoma typically developing in the central airways or proximal bronchus epithelium.</span>
            )}
            {result.predictedClass === 'Normal' && (
              <span>No malignant morphology detected by the ResNet50 feature extractors in the evaluated CT slice.</span>
            )}
          </div>
        </div>

        {/* Right: Metrics / Model Output Score */}
        <div className="flex flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-white/10 shrink-0 gap-4">
          <div className="md:text-right">
            <p className="text-xs font-medium text-[#C2DFE3] uppercase tracking-wider">
              Model Output Score
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#9DB4C0] tracking-tight">
              {(result.confidence * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-[#E0FBFC]/70 mt-0.5">
              Softmax posterior output
            </p>
          </div>

          {result.inferenceTimeMs !== undefined && (
            <div className="md:text-right">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#C2DFE3] font-mono bg-[#1b2529] px-3 py-1.5 rounded-lg border border-[#5C6B73]/40">
                <Clock className="w-3.5 h-3.5 text-[#9DB4C0]" />
                Inference: {result.inferenceTimeMs}ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice Footer on Card */}
      <div className="mt-5 pt-4 border-t border-[#5C6B73]/30 flex items-start gap-2 text-xs text-[#E0FBFC]">
        <Info className="w-4 h-4 text-[#9DB4C0] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Research Note:</strong> This output represents model prediction scores and feature localization, not a verified clinical diagnosis. Always correlate with clinical findings and histopathology.
        </p>
      </div>
    </div>
  );
};
