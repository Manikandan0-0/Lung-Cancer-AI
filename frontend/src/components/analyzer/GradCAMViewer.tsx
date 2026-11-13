import React, { useState } from 'react';
import {
  Eye,
  Maximize2,
  X,
  Layers,
  Sparkles,
  Info,
  Sliders,
  ZoomIn,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface GradCAMViewerProps {
  originalImage: string;
  heatmapImage?: string;
  overlayImage?: string;
  gradcamNote?: string;
  predictedClass: string;
}

export const GradCAMViewer: React.FC<GradCAMViewerProps> = ({
  originalImage,
  heatmapImage,
  overlayImage,
  gradcamNote,
  predictedClass,
}) => {
  const [fullscreenImage, setFullscreenImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [comparisonSliderValue, setComparisonSliderValue] = useState(50);
  const [viewMode, setViewMode] = useState<'panels' | 'slider'>('panels');

  const panels = [
    {
      id: 'original',
      title: 'Original CT Scan',
      badge: 'Input Slice',
      description: 'Axial lung CT scan windowed for pulmonary parenchyma visualization.',
      src: originalImage,
      alt: 'Original axial CT scan input',
    },
    {
      id: 'heatmap',
      title: 'Grad-CAM Heatmap',
      badge: 'Gradient Activation',
      description: 'Coarse 2D localization map calculated from the final convolutional layer gradients.',
      src: heatmapImage || originalImage,
      alt: 'Grad-CAM attention heatmap',
      isPlaceholder: !heatmapImage,
    },
    {
      id: 'overlay',
      title: 'Grad-CAM Overlay',
      badge: 'Visual Explanation',
      description: 'Translucent blend of attention intensity directly superimposed onto CT anatomy.',
      src: overlayImage || originalImage,
      alt: 'Grad-CAM overlay on CT scan',
      isPlaceholder: !overlayImage,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#5C6B73]/30 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Grad-CAM Explainability Viewer
            </h3>
          </div>
          <p className="text-xs text-[#C2DFE3]">
            Gradient-weighted Class Activation Mapping for class{' '}
            <span className="text-white font-semibold">{predictedClass}</span>
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 text-xs">
          <button
            onClick={() => setViewMode('panels')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'panels'
                ? 'bg-[#5C6B73] text-white shadow-sm'
                : 'text-[#C2DFE3] hover:text-white'
            }`}
          >
            3-Panel Matrix
          </button>
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-[#5C6B73] text-white shadow-sm'
                : 'text-[#C2DFE3] hover:text-white'
            }`}
          >
            Interactive Comparison Slider
          </button>
        </div>
      </div>

      {/* 3-Panel View Mode */}
      {viewMode === 'panels' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panels.map((panel, index) => (
            <div
              key={panel.id}
              className="group rounded-2xl bg-[#253237] border border-[#5C6B73]/50 overflow-hidden shadow-xl hover:border-[#9DB4C0] transition-all flex flex-col justify-between"
            >
              {/* Panel Header */}
              <div className="p-4 bg-[#1b2529]/90 border-b border-[#5C6B73]/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#5C6B73]/30 text-[#9DB4C0] border border-[#9DB4C0]/30 uppercase">
                      Panel {index + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {panel.title}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setFullscreenImage({
                      src: panel.src,
                      title: panel.title,
                    })
                  }
                  title="Expand to Fullscreen"
                  className="p-1.5 rounded-lg text-[#C2DFE3] hover:text-white hover:bg-[#5C6B73]/30 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Image Container */}
              <div className="relative aspect-square w-full bg-black/90 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={panel.src}
                  alt={panel.alt}
                  className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                />

                {panel.isPlaceholder && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <Layers className="w-8 h-8 text-[#9DB4C0] mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-white">
                      Waiting for backend heatmap
                    </p>
                    <p className="text-[11px] text-[#C2DFE3] mt-1 max-w-[200px]">
                      Grad-CAM tensor will render when backend `/explain` generates activation weights.
                    </p>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      setFullscreenImage({
                        src: panel.src,
                        title: panel.title,
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#253237]/80 text-[#E0FBFC] border border-[#9DB4C0]/40 px-2.5 py-1 rounded-lg backdrop-blur-sm"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#9DB4C0]" />
                    <span>Zoom</span>
                  </button>
                </div>
              </div>

              {/* Panel Footer Description */}
              <div className="p-3.5 bg-[#1b2529]/60 border-t border-[#5C6B73]/30">
                <p className="text-xs text-[#E0FBFC]/80 leading-relaxed">
                  {panel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Interactive Comparison Slider Mode */
        <div className="rounded-2xl bg-[#253237] border border-[#5C6B73]/50 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9DB4C0]" />
                Interactive Overlay Split Slider
              </h4>
              <p className="text-xs text-[#C2DFE3]">
                Drag slider to inspect anatomical structures vs Grad-CAM attention overlay
              </p>
            </div>
            <div className="text-xs text-[#E0FBFC] font-mono">
              Overlay Blend: {comparisonSliderValue}%
            </div>
          </div>

          {/* Slider visual container */}
          <div className="relative aspect-square max-w-lg mx-auto bg-black rounded-xl overflow-hidden border border-[#9DB4C0]/40 select-none shadow-2xl">
            {/* Base: Original image */}
            <img
              src={originalImage}
              alt="Original CT scan"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Top: Overlay image clipped by slider value */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${comparisonSliderValue}%` }}
            >
              <img
                src={overlayImage || originalImage}
                alt="Grad-CAM Overlay"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#9DB4C0] pointer-events-none shadow-[0_0_10px_#9DB4C0]"
              style={{ left: `${comparisonSliderValue}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#9DB4C0] border-2 border-white flex items-center justify-center text-[#253237] shadow-md">
                <Sliders className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Slider input control */}
          <div className="max-w-md mx-auto pt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={comparisonSliderValue}
              onChange={(e) => setComparisonSliderValue(Number(e.target.value))}
              className="w-full accent-[#9DB4C0] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#C2DFE3] mt-1 font-mono">
              <span>0% (Original CT)</span>
              <span>50% Split</span>
              <span>100% (Full Overlay)</span>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Colormap Color Legend */}
      <div className="p-4 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#E0FBFC]">
          <span className="font-semibold text-white">Attention Scale:</span>
          <span className="text-[#C2DFE3]">Jet / Viridis Colormap (0.0 to 1.0)</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-[#C2DFE3]">Low Influence</span>
          <div className="w-36 sm:w-48 h-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600 border border-white/20 shadow-inner" />
          <span className="text-[11px] text-red-400 font-semibold">High Influence</span>
        </div>
      </div>

      {/* Mandatory Grad-CAM Explanation Panel */}
      <div className="p-5 rounded-xl bg-[#253237] border border-[#9DB4C0]/50 shadow-lg space-y-2">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#5C6B73]/30 text-[#9DB4C0] shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <h4 className="font-semibold text-white flex items-center gap-2">
              Explainable AI Principle & Limitations
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-[#5C6B73]/40 text-[#C2DFE3]">
                Methodology Notice
              </span>
            </h4>
            <p className="text-[#E0FBFC] leading-relaxed">
              &quot;Grad-CAM uses gradient information to highlight image regions that influenced the model&apos;s prediction. These regions represent model attention and must not be interpreted as confirmed tumour locations.&quot;
            </p>
            {gradcamNote && gradcamNote !== "Grad-CAM uses gradient information to highlight image regions that influenced the model's prediction. These regions represent model attention and must not be interpreted as confirmed tumour locations." && (
              <p className="text-[#C2DFE3] text-xs pt-1 border-t border-[#5C6B73]/30 italic">
                Backend note: {gradcamNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <h3 className="text-sm font-semibold">{fullscreenImage.title}</h3>
              <button
                onClick={() => setFullscreenImage(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full flex items-center justify-center bg-black/95 rounded-2xl overflow-hidden border border-[#9DB4C0]/40 p-2">
              <img
                src={fullscreenImage.src}
                alt={fullscreenImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
