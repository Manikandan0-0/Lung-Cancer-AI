import React, { useState } from 'react';
import {
  ScanLine,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Download,
  Info,
  Server,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ImageUploader } from '../components/analyzer/ImageUploader';
import { PredictionCard } from '../components/analyzer/PredictionCard';
import { ProbabilityChart } from '../components/analyzer/ProbabilityChart';
import { GradCAMViewer } from '../components/analyzer/GradCAMViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackendConfigModal } from '../components/common/BackendConfigModal';
import {
  BackendConnectionStatus,
  ImageFileDetails,
  NormalizedPredictionResult,
} from '../types/api';
import { apiService } from '../services/api';

interface AnalyzerPageProps {
  backendStatus: BackendConnectionStatus;
  baseUrl: string;
  onRecheckBackend: () => void;
  onRecordAnalysis: (result: {
    id: string;
    fileName: string;
    predictedClass: string;
    confidence: number;
    timestamp: Date;
    inferenceTimeMs?: number;
  }) => void;
  /** Called right before Grad-CAM inference starts — pauses health polling */
  onAnalysisStart?: () => void;
  /** Called after inference completes or errors — resumes health polling */
  onAnalysisEnd?: () => void;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({
  backendStatus,
  baseUrl,
  onRecheckBackend,
  onRecordAnalysis,
  onAnalysisStart,
  onAnalysisEnd,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageFileDetails | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('Preparing CT scan...');
  const [analysisResult, setAnalysisResult] = useState<NormalizedPredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [apiDocOpen, setApiDocOpen] = useState(false);

  const handleImageSelected = (details: ImageFileDetails) => {
    setSelectedImage(details);
    // Clear previous results when a new image is picked
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleClearImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;

    if (backendStatus !== 'connected') {
      setErrorMessage(
        `Cannot connect to FastAPI backend at ${baseUrl}. Ensure your server is running with 'uvicorn main:app --reload --port 8000' and allows CORS.`
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // Pause health polling so Grad-CAM inference doesn't trigger a false disconnect
    onAnalysisStart?.();

    try {
      const result = await apiService.analyzeAndExplain(
        selectedImage.file,
        (stage) => setProgressStage(stage)
      );

      setAnalysisResult(result);

      // Record to current session history
      onRecordAnalysis({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        fileName: selectedImage.name,
        predictedClass: String(result.predictedClass),
        confidence: result.confidence,
        timestamp: new Date(),
        inferenceTimeMs: result.inferenceTimeMs,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis request failed.';
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
      // Resume health polling (triggers an immediate recheck)
      onAnalysisEnd?.();
    }
  };

  const isConnected = backendStatus === 'connected';

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ScanLine className="w-7 h-7 text-[#9DB4C0]" />
              CT Scan Analyzer Workspace
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#C2DFE3] mt-1">
            Axial pulmonary CT slice classification and Grad-CAM interpretability visualization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {analysisResult && (
            <button
              onClick={handleClearImage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5C6B73]/30 hover:bg-[#5C6B73] text-[#E0FBFC] border border-[#9DB4C0]/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#9DB4C0]" />
              <span>New Analysis</span>
            </button>
          )}

          <button
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#1b2529] hover:bg-[#5C6B73]/20 text-[#C2DFE3] border border-[#5C6B73]/40 transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-[#9DB4C0]" />
            <span>Backend Config</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory / Safety Disclaimer */}
      <Disclaimer variant="banner" />

      {/* Main Analysis Workspace */}
      <div className="space-y-6">
        {/* Upload Zone & Pre-analysis card */}
        {!analysisResult && !isAnalyzing && !errorMessage && (
          <div className="space-y-6">
            <ImageUploader
              selectedImage={selectedImage}
              onImageSelected={handleImageSelected}
              onClearImage={handleClearImage}
              onAnalyze={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
              isBackendConnected={isConnected}
              onOpenSettings={() => setConfigModalOpen(true)}
            />

            {/* Backend Integration Info Banner if Disconnected */}
            {!isConnected && (
              <div className="rounded-2xl bg-[#253237] border border-amber-500/40 p-5 sm:p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      FastAPI Backend Offline ({baseUrl})
                    </h3>
                    <p className="text-xs text-[#E0FBFC] leading-relaxed">
                      In accordance with clinical safety principles, PulmoVision AI does not generate mock predictions or fake Grad-CAM images. Image upload and in-browser preview remain fully active. Connect your local FastAPI server to trigger real ResNet50 inference.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setConfigModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#5C6B73] hover:bg-[#9DB4C0] text-white transition-colors"
                  >
                    <span>Inspect Connection Settings</span>
                  </button>
                  <button
                    onClick={() => setApiDocOpen(!apiDocOpen)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#9DB4C0] hover:underline"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>View Expected FastAPI Contract</span>
                    {apiDocOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Collapsible API Contract Documentation */}
                {apiDocOpen && (
                  <div className="mt-3 p-4 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 text-xs font-mono space-y-3">
                    <div className="text-[#C2DFE3] font-sans font-semibold">
                      FastAPI Implementation Guide (`main.py`):
                    </div>
                    <pre className="text-[11px] text-[#9DB4C0] bg-black/40 p-3 rounded-lg overflow-x-auto leading-relaxed border border-white/5">
{`from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PulmoVision AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "healthy", "model": "ResNet50", "architecture": "ResNet50 (Keras)"}

@app.post("/explain")
async def explain(file: UploadFile = File(...)):
    # 1. Read image bytes and preprocess
    # 2. Run ResNet50.predict()
    # 3. Generate Grad-CAM heatmap & overlay
    return {
        "predicted_class": "Adenocarcinoma",
        "confidence": 0.892,
        "probabilities": {
            "Adenocarcinoma": 0.892,
            "Large Cell Carcinoma": 0.054,
            "Normal": 0.012,
            "Squamous Cell Carcinoma": 0.042
        },
        "heatmap_base64": "<base64_string>",
        "overlay_base64": "<base64_string>",
        "gradcam_note": "Grad-CAM computed from conv5_block3_out"
    }`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State during inference */}
        {isAnalyzing && (
          <LoadingState
            currentStage={progressStage}
            fileName={selectedImage?.name}
          />
        )}

        {/* Error State */}
        {errorMessage && (
          <ErrorState
            title="Inference Request Failed"
            message={errorMessage}
            onRetry={handleRunAnalysis}
            onReset={handleClearImage}
            onConfigure={() => setConfigModalOpen(true)}
          />
        )}

        {/* Post-Analysis Results Dashboard */}
        {analysisResult && selectedImage && !isAnalyzing && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Prediction Card */}
            <PredictionCard result={analysisResult} />

            {/* 2. Probability Distribution Horizontal Chart */}
            <ProbabilityChart
              probabilities={analysisResult.probabilities}
              predictedClass={String(analysisResult.predictedClass)}
            />

            {/* 3. Grad-CAM Explainability Viewer (Original, Heatmap, Overlay) */}
            <GradCAMViewer
              originalImage={selectedImage.previewUrl}
              heatmapImage={analysisResult.heatmapImage}
              overlayImage={analysisResult.overlayImage}
              gradcamNote={analysisResult.gradcamNote}
              predictedClass={String(analysisResult.predictedClass)}
            />
          </div>
        )}
      </div>

      <BackendConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSaved={onRecheckBackend}
      />
    </div>
  );
};
