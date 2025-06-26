'use client';

import type { AnnotatedImage } from '@/types';
import { ImageAnnotator } from './ImageAnnotator';

interface MainDisplayAreaProps {
  annotatedImage: AnnotatedImage | null;
  isLoading: boolean;
}

export function MainDisplayArea({ annotatedImage, isLoading }: MainDisplayAreaProps) {
  return (
    <ImageAnnotator annotatedImage={annotatedImage} isLoading={isLoading} />
  );
}
