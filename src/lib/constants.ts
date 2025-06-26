import type { ModelInfoType, SimulatedImage } from '@/types';

export const OBJECT_CLASSES = ["Toolbox", "Oxygen Tank", "Fire Extinguisher"] as const;

export const DEFAULT_MODEL_INFO: ModelInfoType = {
  name: "YOLOv8", // Simplified to match OCR
  version: "1.0.0", 
  trainingDatasetSummary: "Toolbox, Oxygen Tank, Fire Extinguisher", 
  accuracyMetrics: "mAP@0.5: 0.87", 
  lastTrainingDate: "2024-07-15",
};

const placeholderBase64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export const SIMULATED_IMAGES_FOR_PARAM_DETERMINATION: string[] = [
  placeholderBase64Image,
  placeholderBase64Image,
  placeholderBase64Image,
];

export const SIMULATED_TEST_IMAGES: SimulatedImage[] = [
  { id: 'sim1', name: 'Test Image Alpha (Construction)', src: 'https://placehold.co/800x600.png', dataAiHint: 'construction site' },
  { id: 'sim2', name: 'Test Image Beta (Workshop)', src: 'https://placehold.co/800x600.png', dataAiHint: 'industrial workshop' },
  { id: 'sim3', name: 'Test Image Gamma (Emergency Area)', src: 'https://placehold.co/800x600.png', dataAiHint: 'emergency exit' },
];

export const DEFAULT_DETECTION_PARAMS = {
  confidenceThreshold: 0.5,
  iouThreshold: 0.45,
};
