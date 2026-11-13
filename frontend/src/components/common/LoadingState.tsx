import React, { useEffect, useState } from 'react';
import { Loader2, Cpu, Eye, Layers, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  currentStage?: string;
  fileName?: string;
}

const STAGES = [
  {
    id: 1,
    title: 'Preparing CT Image',
    description: 'Validating image resolution, color space, and normalizing matrix tensors',
    icon: Layers,
  },
  {
    id: 2,
    title: 'Processing Image Pipeline',
    description: 'Rescaling to 224×224 input dimension compatible with ResNet50',
    icon: Cpu,
  },
  {
    id: 3,
    title: 'Running ResNet50 Classification',
    description: 'Deep convolutional feature extraction across residual bottleneck layers',
    icon: Cpu,
  },
  {
    id: 4,
    title: 'Generating Grad-CAM Visualization',
    description: 'Computing target gradients with respect to the final convolutional feature maps',
    icon: Eye,
  },
];

export const LoadingState: React.FC<LoadingStateProps> = ({ currentStage, fileName }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Progressive UI step simulator to give clear visual feedback during API call
  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStepIndex(1), 1200);
    const timer2 = setTimeout(() => setActiveStepIndex(2), 2600);
    const timer3 = setTimeout(() => setActiveStepIndex(3), 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-[#253237]/90 border border-[#9DB4C0]/30 shadow-2xl backdrop-blur-md">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/40 mb-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#9DB4C0]" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          Analyzing Lung CT Scan
        </h3>
        <p className="text-xs sm:text-sm text-[#C2DFE3]">
          {currentStage || 'Communicating with ResNet50 inference server...'}
        </p>
        {fileName && (
          <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono bg-[#1b2529] text-[#E0FBFC] border border-white/10">
            Source: {fileName}
          </div>
        )}
      </div>

      {/* Step Indicators */}
      <div className="space-y-3.5">
        {STAGES.map((step, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;
          const isPending = idx > activeStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-[#5C6B73]/30 border-[#9DB4C0] shadow-md shadow-[#9DB4C0]/10'
                  : isDone
                  ? 'bg-[#1b2529]/80 border-emerald-500/30 text-slate-300'
                  : 'bg-[#1b2529]/40 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isCurrent
                      ? 'bg-[#9DB4C0]/20 text-[#9DB4C0] border-[#9DB4C0]'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <StepIcon className="w-5 h-5 animate-pulse text-[#9DB4C0]" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent ? 'text-white' : isDone ? 'text-[#E0FBFC]' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#C2DFE3] mt-0.5">{step.description}</p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {isDone && (
                  <span className="text-[11px] font-medium text-emerald-400">Done</span>
                )}
                {isCurrent && (
                  <div className="flex items-center gap-1.5 text-xs text-[#9DB4C0]">
                    <span className="w-2 h-2 rounded-full bg-[#9DB4C0] animate-ping" />
                    <span>Active</span>
                  </div>
                )}
                {isPending && (
                  <span className="text-[11px] text-slate-500">Queued</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-[11px] text-[#C2DFE3]/80 italic">
          UI progression stages provide visual feedback during server-side model execution.
        </p>
      </div>
    </div>
  );
};
