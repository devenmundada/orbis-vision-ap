import { Rocket } from 'lucide-react';
import type { SVGProps } from 'react';

// Renamed from OrbisLogo to SpaceStationLogo
export function SpaceStationLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Rocket className="h-7 w-7 text-primary" {...props} />
      <span className="font-headline text-xl font-bold text-primary">
        Space Station Object Detection
      </span>
    </div>
  );
}
