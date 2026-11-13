/**
 * PulmoVision AI Type Definitions
 */

export type BackendConnectionStatus = 'connected' | 'disconnected' | 'checking';

export type LungCancerClass = 
  | 'Adenocarcinoma'
  | 'Large Cell Carcinoma'
  | 'Normal'
  | 'Squamous Cell Carcinoma';

export interface ClassProbability {
  className: LungCancerClass | string;
  score: number;       // raw model output score (0.0 to 1.0)
  percentage: number;  // formatted percentage (0 to 100)
  isPredicted: boolean;
}

export interface BackendHealthResponse {
  status: string;
  model?: string;
  architecture?: string;
  version?: string;
  gpu_available?: boolean;
  supported_classes?: string[];
  timestamp?: string;
  raw?: unknown;
}

export interface ExplainResponse {
  predicted_class: string;
  target_class?: string;
  status?: string;
  confidence?: number;
  model_output?: unknown;
  probabilities?: Record<string, number> | Array<{ class_name?: string; name?: string; label?: string; probability?: number; score?: number }>;
  heatmap_base64?: string;
  overlay_base64?: string;
  heatmap_url?: string;
  overlay_url?: string;
  gradcam_note?: string;
  inference_time_ms?: number;
  raw?: unknown;
}

export interface NormalizedPredictionResult {
  predictedClass: LungCancerClass | string;
  rawPredictedClass: string;
  status: string;
  targetClass?: string;
  confidence: number;
  probabilities: ClassProbability[];
  heatmapImage?: string; // data URI or URL
  overlayImage?: string; // data URI or URL
  gradcamNote: string;
  inferenceTimeMs?: number;
  rawResponse?: unknown;
}

export interface ImageFileDetails {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
}
