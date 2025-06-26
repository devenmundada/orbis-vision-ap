'use client';

import { Button } from "@/components/ui/button";
import { Download, Share2, FileJson } from "lucide-react";
import type { AnnotatedImage } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface ExportControlsProps {
  annotatedImage: AnnotatedImage | null;
}

export function ExportControls({ annotatedImage }: ExportControlsProps) {
  const { toast } = useToast();

  const downloadAnnotatedImage = () => {
    if (!annotatedImage || !annotatedImage.src) {
      toast({ variant: "destructive", title: "Error", description: "No annotated image to download." });
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({ variant: "destructive", title: "Error", description: "Could not create canvas for download." });
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      annotatedImage.detections.forEach(det => {
        const { x, y, width, height } = det.box;
        const absX = x * canvas.width;
        const absY = y * canvas.height;
        const absWidth = width * canvas.width;
        const absHeight = height * canvas.height;
        
        const color = getLabelColorStyle(det.label);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, canvas.width * 0.003);
        ctx.strokeRect(absX, absY, absWidth, absHeight);
        
        const textLabel = `${det.label} (${Math.round(det.confidence * 100)}%)`;
        const fontSize = Math.max(12, canvas.width * 0.015);
        ctx.font = `${fontSize}px sans-serif`;
        
        const textMetrics = ctx.measureText(textLabel);
        const textBgHeight = fontSize * 1.4;
        const textBgWidth = textMetrics.width + 8;

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(absX, absY - textBgHeight, textBgWidth, textBgHeight);
        
        ctx.fillStyle = "#FFFFFF"; // White text for better contrast on dark bg
        ctx.fillText(textLabel, absX + 4, absY - (textBgHeight - fontSize) / 2 - 1);
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'detection_results_annotated.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Annotated image downloaded." });
    };
    img.onerror = () => {
       toast({ variant: "destructive", title: "Error", description: "Could not load image for download." });
    };
    img.crossOrigin = "anonymous";
    img.src = annotatedImage.src;
  };

  const getLabelColorStyle = (label: string): string => {
    switch (label) {
      case "Toolbox": return "hsl(var(--primary))"; 
      case "Oxygen Tank": return "hsl(145, 63%, 49%)"; // Green
      case "Fire Extinguisher": return "hsl(0, 84%, 60%)"; // Red
      default: return "hsl(var(--accent))"; 
    }
  };

  const downloadJsonMetadata = () => {
    if (!annotatedImage || annotatedImage.detections.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "No detection metadata to export." });
      return;
    }
    const jsonData = JSON.stringify({
      imageName: "detection_results", 
      originalWidth: annotatedImage.originalWidth,
      originalHeight: annotatedImage.originalHeight,
      detections: annotatedImage.detections,
    }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'detection_metadata.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Success", description: "Detection metadata (JSON) downloaded." });
  };

  const handleShareResults = () => {
    toast({ title: "Share Results", description: "Sharing functionality is not yet implemented." });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button 
        onClick={downloadAnnotatedImage} 
        disabled={!annotatedImage || !annotatedImage.src}
        className="w-full"
        size="lg" // Consistent with target image's button sizes
      >
        <Download className="mr-2 h-5 w-5" /> Download Results
      </Button>
      <Button 
        variant="outline" 
        onClick={handleShareResults} 
        disabled={!annotatedImage || annotatedImage.detections.length === 0}
        className="w-full"
        size="lg"
      >
        <Share2 className="mr-2 h-5 w-5" /> Share Results
      </Button>
       <Button 
        variant="outline" 
        onClick={downloadJsonMetadata} 
        disabled={!annotatedImage || annotatedImage.detections.length === 0}
        className="w-full md:col-start-3" // Puts it on the third column for a 2-1 layout if needed
        size="lg"
      >
        <FileJson className="mr-2 h-5 w-5" /> Export JSON
      </Button>
    </div>
  );
}
