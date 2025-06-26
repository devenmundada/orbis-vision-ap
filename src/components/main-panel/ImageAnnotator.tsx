'use client';

import NextImage from 'next/image';
import type { AnnotatedImage } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImageAnnotatorProps {
  annotatedImage: AnnotatedImage | null;
  isLoading: boolean;
}

const getLabelColor = (label: string): string => {
  switch (label) {
    case "Toolbox": return "border-primary text-primary bg-primary/10";
    case "Oxygen Tank": return "border-green-500 text-green-500 bg-green-500/10";
    case "Fire Extinguisher": return "border-red-500 text-red-500 bg-red-500/10";
    default: return "border-accent text-accent bg-accent/10";
  }
};

export function ImageAnnotator({ annotatedImage, isLoading }: ImageAnnotatorProps) {

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg overflow-hidden aspect-[16/10] md:aspect-[16/9] flex items-center justify-center bg-card border-border">
        <p className="text-muted-foreground">Processing image...</p>
      </Card>
    );
  }

  if (!annotatedImage || !annotatedImage.src) {
    return (
      <Card className="w-full shadow-lg overflow-hidden aspect-[16/10] md:aspect-[16/9] flex items-center justify-center bg-card border-2 border-dashed border-border">
        <p className="text-muted-foreground text-center p-4">
          Your processed image with detections will appear here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg overflow-hidden bg-card border-border">
      {/* This outer container centers its child and enforces a viewport aspect ratio */}
      <div className="relative w-full aspect-[16/10] md:aspect-[16/9] flex items-center justify-center p-2">
        
        {/* This container has the image's intrinsic aspect ratio.
            It will be scaled down to fit inside the parent, and everything inside will scale perfectly. */}
        <div
          className="relative max-w-full max-h-full"
          style={{
            aspectRatio: `${annotatedImage.originalWidth} / ${annotatedImage.originalHeight}`,
          }}
        >
          <NextImage
            src={annotatedImage.src}
            alt="Annotated content"
            fill // Fill the aspect-ratio container
            className="rounded"
            priority={!!annotatedImage.src}
          />
          {/* Annotations are relative to the same container, so they align perfectly */}
          {annotatedImage.detections.map((detection) => {
            const { x, y, width, height } = detection.box;

            return (
              <div
                key={detection.id}
                className={cn(
                  "absolute border-2 rounded-sm transition-all duration-300 ease-in-out pointer-events-none",
                  getLabelColor(detection.label)
                )}
                style={{
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  width: `${width * 100}%`,
                  height: `${height * 100}%`,
                }}
                aria-label={`Detected ${detection.label} with ${Math.round(detection.confidence * 100)}% confidence`}
              >
                <div className={cn(
                    "absolute -top-6 left-0 text-xs font-semibold px-1 py-0.5 rounded-t-sm whitespace-nowrap",
                    getLabelColor(detection.label).replace('border-', 'bg-').replace('/10', '/90') 
                  )}
                >
                  {detection.label} ({Math.round(detection.confidence * 100)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
