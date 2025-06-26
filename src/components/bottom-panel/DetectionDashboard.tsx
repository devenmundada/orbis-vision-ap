'use client';

import type { AnnotatedImage } from '@/types';
import { DetectionStats } from './DetectionStats';
import { ExportControls } from './ExportControls';

interface DetectionDashboardProps {
  annotatedImage: AnnotatedImage | null;
}

export function DetectionDashboard({ annotatedImage }: DetectionDashboardProps) {
  return (
    <div className="w-full space-y-6">
      {annotatedImage && annotatedImage.detections.length > 0 && <DetectionStats detections={annotatedImage.detections} />}
      {annotatedImage && annotatedImage.detections.length > 0 && <ExportControls annotatedImage={annotatedImage} />}
    </div>
  );
}
