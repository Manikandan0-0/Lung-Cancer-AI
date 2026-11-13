import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, FileCheck, X, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { ImageFileDetails } from '../../types/api';
import { formatBytes } from '../../lib/utils';

interface ImageUploaderProps {
  onImageSelected: (details: ImageFileDetails) => void;
  selectedImage: ImageFileDetails | null;
  onClearImage: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isBackendConnected: boolean;
  onOpenSettings: () => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  onClearImage,
  onAnalyze,
  isAnalyzing,
  isBackendConnected,
  onOpenSettings,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setValidationError(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError(
        `Unsupported file type (${file.type || 'unknown'}). Please upload a valid PNG or JPEG CT scan image.`
      );
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(
        `File size exceeds 20MB limit (${formatBytes(file.size)}). Please select a standard medical slice image.`
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      onImageSelected({
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        width: img.naturalWidth,
        height: img.naturalHeight,
        uploadedAt: new Date(),
      });
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Upload Zone or Active Preview */}
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-[#9DB4C0] bg-[#5C6B73]/25 scale-[1.01] shadow-xl shadow-[#9DB4C0]/20'
              : 'border-[#9DB4C0]/50 hover:border-[#9DB4C0] bg-[#253237]/70 hover:bg-[#5C6B73]/15'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#5C6B73]/30 border border-[#9DB4C0]/40 flex items-center justify-center text-[#9DB4C0] group-hover:scale-110 group-hover:bg-[#5C6B73]/50 transition-all duration-200 shadow-lg shadow-[#9DB4C0]/10">
              <Upload className="w-8 h-8 text-[#9DB4C0]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Drag and drop your lung CT scan image here
              </h3>
              <p className="text-xs sm:text-sm text-[#C2DFE3]">
                or <span className="text-[#9DB4C0] underline font-medium">browse local files</span> from your computer
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-[#E0FBFC]">
              <span className="px-2.5 py-1 rounded-full bg-[#1b2529] border border-white/10">
                Format: PNG or JPEG
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1b2529] border border-white/10">
                Max Size: 20 MB
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1b2529] border border-white/10">
                In-Memory Only
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="rounded-2xl border border-[#9DB4C0]/40 bg-[#253237]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Image Thumbnail & Meta */}
            <div className="flex items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black border border-[#9DB4C0]/50 shrink-0 group">
                <img
                  src={selectedImage.previewUrl}
                  alt="Selected CT scan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#253237]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    Ready for Analysis
                  </span>
                  <span className="text-[11px] text-[#C2DFE3] uppercase font-mono">
                    {selectedImage.type.split('/')[1]?.toUpperCase() || 'CT SLICE'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-white truncate max-w-sm">
                  {selectedImage.name}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#E0FBFC]/80 font-mono">
                  <span>Size: {formatBytes(selectedImage.size)}</span>
                  {selectedImage.width && selectedImage.height && (
                    <span>
                      Resolution: {selectedImage.width} × {selectedImage.height}px
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#E0FBFC] hover:text-white bg-[#5C6B73]/30 hover:bg-[#5C6B73]/50 border border-[#9DB4C0]/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#9DB4C0]" />
                <span>Replace</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={onClearImage}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 flex items-start gap-3 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{validationError}</div>
          <button
            onClick={() => setValidationError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Backend Disconnected Notice (when file selected but backend offline) */}
      {selectedImage && !isBackendConnected && (
        <div className="p-4 rounded-xl bg-[#253237] border border-amber-500/40 text-[#E0FBFC] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              FastAPI Inference Backend Not Reachable
            </span>
            <button
              onClick={onOpenSettings}
              className="text-xs text-[#9DB4C0] underline hover:text-[#C2DFE3]"
            >
              Configure Connection
            </button>
          </div>
          <p className="text-[#E0FBFC]/90 leading-relaxed">
            The frontend is working properly and your CT image is validated in-memory. However, live ResNet50 classification and Grad-CAM generation require the FastAPI backend at <code className="text-[#9DB4C0] font-mono">http://localhost:8000</code>. To avoid generating fabricated or false predictions, the analysis button remains disabled until the server connects.
          </p>
        </div>
      )}

      {/* Main Analyze Button */}
      {selectedImage && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!isBackendConnected || isAnalyzing}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-3 ${
              isBackendConnected && !isAnalyzing
                ? 'bg-gradient-to-r from-[#5C6B73] via-[#9DB4C0] to-[#5C6B73] hover:brightness-110 text-white shadow-[#9DB4C0]/30 hover:scale-[1.005] active:scale-[0.99]'
                : 'bg-[#5C6B73]/30 text-white/40 border border-white/10 cursor-not-allowed shadow-none'
            }`}
          >
            <Sparkles className="w-5 h-5 text-[#C2DFE3]" />
            <span>
              {isAnalyzing
                ? 'Analyzing CT Scan via ResNet50 & Grad-CAM...'
                : !isBackendConnected
                ? 'Backend Disconnected — Start FastAPI to Analyze'
                : 'Analyze CT Scan (ResNet50 + Grad-CAM)'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
