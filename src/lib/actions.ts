'use server';

import {
  determineDetectionParameters,
  type DetermineDetectionParametersOutput,
} from '@/ai/flows/determine-detection-parameters';
import type { AnnotatedImage, DetectionResult, DetectionParams } from '@/types';
import { OBJECT_CLASSES, SIMULATED_IMAGES_FOR_PARAM_DETERMINATION } from '@/lib/constants';

export async function simulateDetection(
  imageDataUrl: string,
  originalWidth: number,
  originalHeight: number,
  params: DetectionParams
): Promise<AnnotatedImage> {
  const modelEndpoint = process.env.MODEL_ENDPOINT_URL;

  // Always use the real model endpoint. Throw an error if it's not configured.
  if (!modelEndpoint) {
    throw new Error('The MODEL_ENDPOINT_URL environment variable is not set. Please configure it in your .env file.');
  }

  try {
    console.log(`🚀 Calling real model endpoint: ${modelEndpoint}/detect/`);
    
    const base64Data = imageDataUrl.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'image.jpeg');

    const response = await fetch(`${modelEndpoint}/detect/`, {
      method: 'POST',
      body: formData,
    });

    console.log("📥 Response received:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("❌ API Error Body:", errorBody);
      throw new Error(`Model API error ${response.status}: ${errorBody}`);
    }

    const results = await response.json();

    if (!results || !Array.isArray(results.detections)) {
      throw new Error(
        `Invalid response format. Expected a JSON object with a 'detections' array. Got: ${JSON.stringify(results)}`
      );
    }
    
    const detections: DetectionResult[] = results.detections.map((pred: any, i: number) => {
      // Validate the structure of each prediction to prevent crashes
      if (
        !pred ||
        typeof pred.class !== 'string' ||
        typeof pred.confidence !== 'number' ||
        !Array.isArray(pred.bbox) ||
        pred.bbox.length !== 4 ||
        pred.bbox.some((coord: any) => typeof coord !== 'number')
      ) {
        console.warn(`Skipping malformed detection object at index ${i}:`, pred);
        return null; // Mark as invalid to be filtered out
      }

      const [x_min, y_min, x_max, y_max] = pred.bbox;

      return {
        id: `det-${Date.now()}-${i}`,
        label: pred.class,
        confidence: pred.confidence,
        box: {
          x: x_min / originalWidth,
          y: y_min / originalHeight,
          width: (x_max - x_min) / originalWidth,
          height: (y_max - y_min) / originalHeight,
        },
      };
    })
    .filter((d: DetectionResult | null): d is DetectionResult => d !== null) // Filter out any null (invalid) entries
    .filter((d: DetectionResult) => d.confidence >= params.confidenceThreshold); // Filter by confidence threshold


    return { src: imageDataUrl, detections, originalWidth, originalHeight };

  } catch (error) {
    console.error("🚨 Error calling custom model:", error);
    if (error instanceof Error) {
      // Propagate a more informative error message to the client.
      throw new Error(`Model API call failed: ${error.message}`);
    }
    throw new Error("Model API call failed due to an unknown error.");
  }
}

export async function getOptimalDetectionParameters(): Promise<DetermineDetectionParametersOutput> {
  const imageExamples = SIMULATED_IMAGES_FOR_PARAM_DETERMINATION;

  const result = await determineDetectionParameters({
    imageExamples,
    objectClasses: [...OBJECT_CLASSES],
  });

  return result;
}
