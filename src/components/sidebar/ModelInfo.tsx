'use client';

import type { ModelInfoType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export function ModelInfo({ modelInfo }: ModelInfoProps) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-4 text-sm text-card-foreground">
        <p>
          <span className="font-semibold text-muted-foreground">Model:</span> {modelInfo.name} Objects Detected: {modelInfo.trainingDatasetSummary} Version: {modelInfo.version}
        </p>
      </CardContent>
    </Card>
  );
}
