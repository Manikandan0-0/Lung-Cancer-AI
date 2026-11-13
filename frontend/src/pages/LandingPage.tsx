import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Cpu,
  Eye,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Binary,
  Share2,
  Zap,
  Server,
  Code2,
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';
import heroVisualImg from '../assets/images/lung_ai_visual_1794340456373.jpg';

export const LandingPage: React.FC = () => {
  const features = [
    {
      title: 'ResNet50 Image Classification',
      description:
        'Leverages a 50-layer deep residual neural network pretrained with transfer learning and fine-tuned for high-resolution axial chest CT pattern recognition.',
      icon: Cpu,
      tag: 'Residual Networks',
    },
    {
      title: 'Explainable AI with Grad-CAM',
      description:
        'Calculates gradients of the predicted class score with respect to feature maps in the final convolutional layer, producing transparent spatial visual explanations.',
      icon: Eye,
      tag: 'Interpretability',
    },
    {
      title: 'Four-Class Prediction Analysis',
      description:
        'Differentiates among Adenocarcinoma, Large Cell Carcinoma, Normal lung parenchyma, and Squamous Cell Carcinoma with full softmax posterior distributions.',
      icon: Layers,
      tag: 'Multi-Class Categorization',
    },
    {
      title: 'Privacy-Focused Image Processing',
      description:
        'Ephemeral memory-only image handling architecture. Uploaded CT slices are never persisted to disk or external patient databases.',
      icon: ShieldCheck,
      tag: 'Clinical Privacy',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload CT Scan',
      desc: 'Select or drop a standard axial chest CT scan slice in PNG or JPEG format.',
    },
    {
      step: '02',
      title: 'Image Preprocessing',
      desc: 'Standardized resolution scaling to 224×224 and tensor normalization.',
    },
    {
      step: '03',
      title: 'AI Classification',
      desc: 'Forward pass through ResNet50 extracting multi-scale hierarchical feature maps.',
    },
    {
      step: '04',
      title: 'Grad-CAM Explanation',
      desc: 'Gradient backpropagation generates heatmap and overlay highlighting salient regions.',
    },
  ];

  const techStack = [
    { name: 'Python', role: 'Inference runtime & data processing' },
    { name: 'TensorFlow', role: 'Machine learning graph execution' },
    { name: 'Keras', role: 'High-level deep learning model definition' },
    { name: 'ResNet50', role: 'Residual network backbone with skip connections' },
    { name: 'FastAPI', role: 'Asynchronous high-performance REST API backend' },
    { name: 'React & Vite', role: 'Modern responsive clinical frontend architecture' },
    { name: 'Grad-CAM', role: 'Gradient-weighted Class Activation Mapping' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Top Research Disclaimer Banner */}
      <Disclaimer variant="banner" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5C6B73]/20 border border-[#9DB4C0]/30 text-[#C2DFE3] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#9DB4C0] animate-pulse" />
              <span>Deep Learning & Explainable AI Research Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              See Beyond the Scan.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9DB4C0] via-[#C2DFE3] to-[#E0FBFC]">
                Understand the Prediction.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#E0FBFC] max-w-2xl leading-relaxed">
              An explainable AI research platform that analyses lung CT images using deep learning and visualizes the image regions influencing model predictions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/analyzer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#5C6B73] to-[#9DB4C0] hover:from-[#475359] hover:to-[#C2DFE3] text-white shadow-lg shadow-[#9DB4C0]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Analyze CT Scan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/model"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#253237] hover:bg-[#5C6B73]/30 text-[#E0FBFC] border border-[#9DB4C0]/40 transition-colors"
              >
                <span>Explore Technology</span>
              </Link>
            </div>

            {/* Quick Specs Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#5C6B73]/30 max-w-lg">
              <div>
                <p className="text-xs text-[#C2DFE3]">Backbone</p>
                <p className="text-sm sm:text-base font-bold text-white">ResNet50</p>
              </div>
              <div>
                <p className="text-xs text-[#C2DFE3]">Explainability</p>
                <p className="text-sm sm:text-base font-bold text-white">Grad-CAM</p>
              </div>
              <div>
                <p className="text-xs text-[#C2DFE3]">Categories</p>
                <p className="text-sm sm:text-base font-bold text-white">4 Subtypes</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#9DB4C0]/40 shadow-2xl shadow-[#9DB4C0]/15 bg-[#1b2529] group">
              <img
                src={heroVisualImg}
                alt="Medical Lung AI Visualization and Grad-CAM"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#253237]/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-[#253237]/85 border border-[#9DB4C0]/40 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9DB4C0] animate-pulse" />
                    <span className="font-semibold text-white">PulmoVision AI Model</span>
                  </div>
                  <span className="font-mono text-[#C2DFE3]">conv5_block3_out</span>
                </div>
                <p className="text-[11px] text-[#E0FBFC] mt-1">
                  Gradient-weighted class activations mapped directly onto axial lung CT coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C6B73]/20 text-[#9DB4C0] text-xs font-semibold uppercase tracking-wider">
            Core Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for Rigorous Clinical AI Research
          </h2>
          <p className="text-xs sm:text-sm text-[#E0FBFC]">
            Built with modern computer vision architectures and clinical explainability standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 hover:border-[#9DB4C0] transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5C6B73]/30 border border-[#9DB4C0]/30 flex items-center justify-center text-[#9DB4C0] group-hover:scale-110 group-hover:bg-[#5C6B73]/50 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#C2DFE3]">
                      {feature.tag}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-[#9DB4C0] transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#E0FBFC]/90 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#1b2529] border border-[#5C6B73]/40 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#9DB4C0] uppercase tracking-wider">
              Inference Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Four-Step Visual Process
            </h2>
            <p className="text-xs sm:text-sm text-[#E0FBFC]">
              From patient CT slice upload to interpretable Grad-CAM saliency maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((item, idx) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/30 space-y-3"
              >
                <div className="text-3xl font-extrabold text-[#9DB4C0] font-mono opacity-80">
                  {item.step}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-[#C2DFE3] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-[#5C6B73] hover:bg-[#9DB4C0] text-white transition-colors shadow-md"
            >
              <span>Test the CT Analyzer Interface</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#9DB4C0] uppercase tracking-wider">
            Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Integrated ML & Research Stack
          </h2>
          <p className="text-xs sm:text-sm text-[#E0FBFC]">
            Built with production-grade scientific computing and web frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-xl bg-[#253237] border border-[#5C6B73]/40 flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#5C6B73]/20 border border-[#9DB4C0]/30 flex items-center justify-center text-[#9DB4C0] shrink-0 font-bold text-sm">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                <p className="text-xs text-[#C2DFE3]">{tech.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research Disclaimer Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Disclaimer variant="card" />
      </section>
    </div>
  );
};
