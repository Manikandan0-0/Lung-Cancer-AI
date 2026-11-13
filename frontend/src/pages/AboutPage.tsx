import React from 'react';
import {
  FileText,
  Target,
  AlertCircle,
  Network,
  Cpu,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Disclaimer } from '../components/common/Disclaimer';

export const AboutPage: React.FC = () => {
  const architectureSteps = [
    { label: 'CT Scan Upload', sub: 'PNG / JPEG 20MB' },
    { label: 'Preprocessing', sub: '224×224 Normalization' },
    { label: 'ResNet50', sub: 'Bottleneck Convolutions' },
    { label: 'Classification', sub: '4-Class Softmax' },
    { label: 'Grad-CAM', sub: 'conv5_block3_out Gradients' },
    { label: 'Results Dashboard', sub: 'Predictions & Overlays' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5C6B73]/20 border border-[#9DB4C0]/30 text-[#9DB4C0] text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Academic Research Prototype
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About PulmoVision AI
        </h1>
        <p className="text-sm sm:text-base text-[#E0FBFC] max-w-3xl leading-relaxed">
          An explainable artificial intelligence research initiative exploring deep residual convolutional networks and gradient-based interpretability for thoracic computer vision.
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <Disclaimer variant="card" />

      {/* Section 1: Overview & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-3">
          <div className="flex items-center gap-2.5 text-[#9DB4C0]">
            <Target className="w-5 h-5" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Project Overview
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            PulmoVision AI was conceptualized as an experimental computer vision research system to demonstrate the vital importance of explainability (XAI) in medical imaging. The platform pairs high-capacity convolutional neural networks with spatial saliency maps, providing researchers with visual feedback on which anatomical zones drive model classification decisions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              The Medical Problem Statement
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            Lung cancer accounts for significant clinical morbidity worldwide. While computed tomography (CT) remains the gold standard screening modality, high caseloads and subtle parenchymal textures create interpretation bottlenecks. Conventional deep-learning models often act as opaque &quot;black boxes&quot;, giving predictions without spatial context, severely hindering scientific validation and human auditability.
          </p>
        </div>
      </div>

      {/* Section 2: Research Objectives */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Core Research Objectives
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-[#E0FBFC]">
          <div className="p-4 rounded-xl bg-[#1b2529] border border-white/5 space-y-2">
            <div className="text-sm font-bold text-[#9DB4C0]">1. Multi-Class Discrimination</div>
            <p className="text-xs text-[#C2DFE3] leading-relaxed">
              Demonstrating 4-class categorical differentiation between major non-small cell subtypes (Adenocarcinoma, Large Cell, Squamous Cell) and normal pulmonary parenchyma.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#1b2529] border border-white/5 space-y-2">
            <div className="text-sm font-bold text-[#9DB4C0]">2. Spatial Interpretability</div>
            <p className="text-xs text-[#C2DFE3] leading-relaxed">
              Pioneering visual explanation through Grad-CAM to confirm whether deep network representations focus on legitimate parenchymal lesions versus image artifacts.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#1b2529] border border-white/5 space-y-2">
            <div className="text-sm font-bold text-[#9DB4C0]">3. Ephemeral Architecture</div>
            <p className="text-xs text-[#C2DFE3] leading-relaxed">
              Designing privacy-preserving, memory-resident pipelines where patient imagery is processed in volatile buffers without persisting medical records.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Architecture Diagram */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1b2529] border border-[#5C6B73]/50 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Network className="w-5 h-5 text-[#9DB4C0]" />
            End-to-End System Architecture
          </h2>
          <p className="text-xs text-[#C2DFE3]">
            Decoupled workflow linking browser frontend with asynchronous FastAPI and ResNet50 inference
          </p>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {architectureSteps.map((step, idx) => (
            <div
              key={step.label}
              className="relative p-4 rounded-xl bg-[#253237] border border-[#5C6B73]/40 flex flex-col justify-between text-center space-y-2 group hover:border-[#9DB4C0] transition-colors"
            >
              <div className="text-[10px] font-mono text-[#9DB4C0] font-bold">
                STEP 0{idx + 1}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{step.label}</h4>
                <p className="text-[10px] text-[#C2DFE3] mt-0.5">{step.sub}</p>
              </div>
              {idx < architectureSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-[#9DB4C0] z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-[#253237]/80 border border-white/5 text-xs text-[#E0FBFC] space-y-1">
          <p className="font-semibold text-white">Pipeline Summary:</p>
          <p className="text-[#C2DFE3] font-mono text-[11px]">
            CT Scan Upload → Preprocessing (224×224×3) → ResNet50 (conv5_block3_out) → Classification (Softmax) → Grad-CAM (Target Gradients) → Results Dashboard
          </p>
        </div>
      </div>

      {/* Section 4: Deep Learning & Grad-CAM Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-3">
          <div className="flex items-center gap-2 text-[#9DB4C0]">
            <Cpu className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Deep-Learning Approach</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            By adapting ResNet50 via transfer learning, the system leverages hierarchical representations trained on millions of parameters. Lower convolutional stages recognize edges and geometric curvatures; higher stages synthesize composite anatomical patterns corresponding to pulmonary nodule morphology and bronchovascular margins.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-3">
          <div className="flex items-center gap-2 text-[#9DB4C0]">
            <Eye className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Explainable AI Integration</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            Grad-CAM calculates the gradient of the winning category score with respect to the final convolutional feature activations (<code>conv5_block3_out</code>). This produces a visual heatmap indicating which quadrant of the lung parenchyma contributed most heavily to the prediction score, enabling transparent inspection.
          </p>
        </div>
      </div>

      {/* Section 5: Limitations and Future Improvements */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Research Limitations & Future Roadmap
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#E0FBFC]">
          <div className="p-4 rounded-xl bg-[#1b2529] border border-white/5 space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider text-[#C2DFE3]">
              Current Limitations
            </div>
            <ul className="space-y-1.5 text-xs text-[#E0FBFC]/90">
              <li>• Evaluates isolated 2D axial CT slices rather than complete volumetric 3D scans.</li>
              <li>• Does not integrate patient clinical history, smoking pack-years, or genetics.</li>
              <li>• Grad-CAM resolution is bounded by final feature map dimensions (7×7).</li>
              <li>• Not calibrated or validated for clinical diagnostic intervention.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#1b2529] border border-white/5 space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider text-[#9DB4C0]">
              Future Roadmap
            </div>
            <ul className="space-y-1.5 text-xs text-[#E0FBFC]/90">
              <li>• Volumetric 3D ResNet architectures (3D CNN) processing full DICOM series.</li>
              <li>• Multi-modal fusion with radiomics and patient biomarker data.</li>
              <li>• High-resolution Guided Grad-CAM and integrated gradients visualization.</li>
              <li>• Multi-institution clinical validation trials under IRB oversight.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="text-center pt-4">
        <Link
          to="/analyzer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#5C6B73] to-[#9DB4C0] text-white shadow-lg transition-all"
        >
          <span>Return to CT Scan Analyzer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
