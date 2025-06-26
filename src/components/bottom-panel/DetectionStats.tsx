'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToolboxIcon } from '@/components/icons/ToolboxIcon';
import { OxygenTankIcon } from '@/components/icons/OxygenTankIcon';
import { FireExtinguisherIcon } from '@/components/icons/FireExtinguisherIcon';
import type { DetectionResult } from '@/types';
// import { ListChecks } from "lucide-react"; // Icon removed as title is external

interface DetectionStatsProps {
  detections: DetectionResult[];
}

const iconMap: Record<string, React.ElementType> = {
  "Toolbox": ToolboxIcon,
  "Oxygen Tank": OxygenTankIcon,
  "Fire Extinguisher": FireExtinguisherIcon,
};

export function DetectionStats({ detections }: DetectionStatsProps) {
  const counts: Record<string, number> = {};
  const uniqueLabels = new Set(detections.map(det => det.label));
  uniqueLabels.forEach(label => counts[label] = 0);

  detections.forEach(det => {
    if (counts[det.label] !== undefined) {
      counts[det.label]++;
    } else { // Handle unexpected labels gracefully if OBJECT_CLASSES isn't exhaustive
      counts[det.label] = 1;
    }
  });

  if (detections.length === 0) {
    // This case should ideally be handled by the parent component not rendering this one.
    // But as a fallback:
    return <p className="text-muted-foreground p-4">No objects detected to summarize.</p>;
  }

  return (
    <Card className="bg-card border-border shadow-md">
      <CardContent className="p-0 md:p-2"> {/* Reduced padding for a tighter look if needed */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] px-2 sm:px-4">Icon</TableHead>
              <TableHead className="px-2 sm:px-4">Object Class</TableHead>
              <TableHead className="text-right px-2 sm:px-4">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(counts).filter(([, count]) => count > 0).map(([label, count]) => {
              const IconComponent = iconMap[label] || (() => <span className="text-xs">?</span>);
              return (
                <TableRow key={label}>
                  <TableCell className="px-2 sm:px-4"><IconComponent className="h-5 w-5 text-primary" /></TableCell>
                  <TableCell className="font-medium px-2 sm:px-4">{label}</TableCell>
                  <TableCell className="text-right font-code px-2 sm:px-4">{count}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
