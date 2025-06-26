export interface BoundingBox {
  x: number; // top-left x (percentage)
  y: number; // top-left y (percentage)
  width: number; // width (percentage)
  height: number; // height (percentage)
}

export interface DetectionResult {
  id: string;
  box: BoundingBox;
  label: string;
  confidence: number;
}

export interface AnnotatedImage {
  src: string; // data URL of the image
  detections: DetectionResult[];
  originalWidth: number;
  originalHeight: number;
}

export interface ModelInfoType {
  name: string;
  version: string;
  trainingDatasetSummary: string;
  accuracyMetrics: string; 
  lastTrainingDate: string;
}

export type DataSource = 'upload' | 'webcam' | 'simulated';

export interface SimulatedImage {
  id: string;
  name: string;
  src: string; // URL or base64 data URI
  dataAiHint?: string;
}

export interface DetectionParams {
  confidenceThreshold: number;
  iouThreshold: number;
}
