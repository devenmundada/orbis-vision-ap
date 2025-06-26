'use client';

// This component is largely deprecated. Its functionality for image selection
// has been moved to page.tsx. The AI parameter optimization part might be
// re-integrated differently if needed, or also moved to page.tsx.

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Loader2 } from "lucide-react";
import type { DetectionParams } from '@/types'; // DataSource, SimulatedImage removed
import { getOptimalDetectionParameters } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InputOptionsProps {
  onDetectionParamsUpdate: (params: DetectionParams, description: string) => void;
  // Props related to image selection (onImageSelected, onWebcamStart, currentDataSource, onDataSourceChange, simulatedTestImages)
  // are removed as this functionality is now in page.tsx
}

export function InputOptions({ // Only onDetectionParamsUpdate is expected now
  onDetectionParamsUpdate,
}: InputOptionsProps) {
  const { toast } = useToast();
  const [isLoadingParams, setIsLoadingParams] = useState(false);

  const handleDetermineParams = useCallback(async () => {
    setIsLoadingParams(true);
    try {
      const params = await getOptimalDetectionParameters();
      onDetectionParamsUpdate({ confidenceThreshold: params.confidenceThreshold, iouThreshold: params.iouThreshold }, params.description);
      toast({
        title: "AI Parameters Updated",
        description: `Confidence: ${params.confidenceThreshold.toFixed(2)}, IoU: ${params.iouThreshold.toFixed(2)}. ${params.description}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Optimizing Parameters",
        description: (error as Error).message || "Could not determine AI parameters.",
      });
    } finally {
      setIsLoadingParams(false);
    }
  }, [onDetectionParamsUpdate, toast]);

  // The UI for image source selection is removed.
  // This component, if kept, would only be for the "AI Parameters" Card.
  // Consider moving this button directly to page.tsx if this is the only remaining part.
  return (
    <div className="p-2 space-y-4">
        <Card className="bg-card/80 border-border">
          <CardHeader className="p-3">
            <CardTitle className="font-headline text-md flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" /> AI Parameter Optimization
            </CardTitle>
            <CardDescription className="text-xs">
              Let AI determine optimal detection thresholds based on sample images.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <Button onClick={handleDetermineParams} disabled={isLoadingParams} className="w-full">
              {isLoadingParams ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              Optimize Parameters
            </Button>
          </CardContent>
        </Card>
    </div>
  );
}
