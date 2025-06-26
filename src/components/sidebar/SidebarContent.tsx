'use client';

// This component is no longer used due to the sidebar removal.
// Its contents (InputOptions, ModelInfo) are either integrated into page.tsx
// or adapted. Keeping the file but it can be removed.

import { SpaceStationLogo } from "@/components/icons/OrbisLogo"; 
// ModelInfo and InputOptions are now handled differently
import { ScrollArea } from "@/components/ui/scroll-area";
// import { DEFAULT_MODEL_INFO } from "@/lib/constants"; // Not needed here anymore
import type { DataSource, SimulatedImage, DetectionParams } from '@/types';

interface SidebarContentProps {
  // These props are no longer relevant as this component is deprecated
  onImageSelected?: (file: File | SimulatedImage, source: DataSource) => void;
  onWebcamStart?: () => void;
  currentDataSource?: DataSource;
  onDataSourceChange?: (source: DataSource) => void;
  simulatedTestImages?: SimulatedImage[];
  onDetectionParamsUpdate?: (params: DetectionParams, description: string) => void;
}

export function SidebarContent({ 
  // Props are optional now as the component is deprecated
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border">
        <SpaceStationLogo />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 text-sm text-muted-foreground">
          Sidebar content has been restructured into the main page layout. This component is deprecated.
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-sidebar-border text-xs text-muted-foreground text-center">
        Space Station Detection &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
