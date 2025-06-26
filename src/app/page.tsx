'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { WebcamCapture } from "@/components/main-panel/WebcamCapture";
import type { AnnotatedImage, DataSource, SimulatedImage, DetectionParams } from '@/types';
import { simulateDetection } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Video, Rocket, HelpCircle, UserCircle, Settings2 } from "lucide-react";
import { DEFAULT_DETECTION_PARAMS, DEFAULT_MODEL_INFO } from "@/lib/constants";
import { Card, CardContent } from '@/components/ui/card';
import { DetectionStats } from '@/components/bottom-panel/DetectionStats';
import { ModelInfo } from "@/components/sidebar/ModelInfo"; 
import { ExportControls } from '@/components/bottom-panel/ExportControls';
import { getOptimalDetectionParameters } from '@/lib/actions';


export default function SpaceStationDetectionPage() {
  const [annotatedImage, setAnnotatedImage] = useState<AnnotatedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [detectionParams, setDetectionParams] = useState<DetectionParams>(DEFAULT_DETECTION_PARAMS);
  const [paramOptimizationDescription, setParamOptimizationDescription] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const processImage = useCallback(async (dataUrl: string, originalWidth: number, originalHeight: number) => {
    setIsLoading(true);
    
    const MAX_DIMENSION = 1024;
    let submissionDataUrl = dataUrl;
    let submissionWidth = originalWidth;
    let submissionHeight = originalHeight;

    try {
        if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
            const img = new window.Image();
            // Use a promise to wait for the image to load
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (e) => reject(new Error("Image failed to load for resizing."));
                img.src = dataUrl;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const aspectRatio = originalWidth / originalHeight;

            if (originalWidth > originalHeight) {
                submissionWidth = MAX_DIMENSION;
                submissionHeight = MAX_DIMENSION / aspectRatio;
            } else {
                submissionHeight = MAX_DIMENSION;
                submissionWidth = MAX_DIMENSION * aspectRatio;
            }
            
            canvas.width = submissionWidth;
            canvas.height = submissionHeight;
            
            if (ctx) {
                ctx.drawImage(img, 0, 0, submissionWidth, submissionHeight);
                submissionDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            }
        }
    
        const result = await simulateDetection(submissionDataUrl, submissionWidth, submissionHeight, detectionParams);
        
        // IMPORTANT: Use original dataUrl for display, but detections from the result
        setAnnotatedImage({
            src: dataUrl,
            detections: result.detections,
            originalWidth,
            originalHeight,
        });
        toast({ title: "Inference Complete", description: "Objects detected successfully." });

    } catch (error) {
      console.error("Detection error:", error);
      toast({
        variant: "destructive",
        title: "Detection Failed",
        description: (error as Error).message || "Could not process the image.",
      });
      setAnnotatedImage({ src: dataUrl, detections: [], originalWidth, originalHeight });
    } finally {
      setIsLoading(false);
    }
  }, [toast, detectionParams]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageSelected(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select an image file (e.g., JPG, PNG).",
        });
      }
    }
  };
  
  const handleImageSelected = useCallback((item: File | SimulatedImage) => {
    setIsLoading(true);

    if ('src' in item) { // SimulatedImage
      const img = new window.Image();
      img.onload = () => processImage(item.src, img.naturalWidth, img.naturalHeight);
      img.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Could not load simulated image."});
        setIsLoading(false);
      }
      img.src = item.src;
    } else { // File
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => processImage(dataUrl, img.naturalWidth, img.naturalHeight);
        img.onerror = () => {
           toast({ variant: "destructive", title: "Error", description: "Could not load uploaded image."});
           setIsLoading(false);
        }
        img.src = dataUrl;
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Could not read file."});
        setIsLoading(false);
      }
      reader.readAsDataURL(item);
    }
  }, [processImage, toast]);

  const handleWebcamCapture = useCallback((dataUrl: string, width: number, height: number) => {
    processImage(dataUrl, width, height);
    setIsWebcamOpen(false);
  }, [processImage]);

  const handleOptimizeParams = async () => {
    setIsLoading(true);
    setParamOptimizationDescription(null);
    try {
      const params = await getOptimalDetectionParameters();
      const newParams = { confidenceThreshold: params.confidenceThreshold, iouThreshold: params.iouThreshold };
      setDetectionParams(newParams);
      setParamOptimizationDescription(params.description);
      toast({
        title: "AI Parameters Optimized",
        description: `New thresholds applied. ${params.description}`,
      });
      if (annotatedImage?.src) {
         setTimeout(() => processImage(annotatedImage.src, annotatedImage.originalWidth, annotatedImage.originalHeight), 100);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: (error as Error).message || "Could not optimize AI parameters.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
          <div className="mr-4 flex items-center">
            <Rocket className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold font-headline text-lg">Space Station Object Detection</span>
          </div>
          <nav className="flex items-center gap-x-2 sm:gap-x-4 text-sm ml-auto">
            <Button variant="ghost" size="sm" className="px-2 sm:px-3">Home</Button>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3">About</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserCircle className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-screen-lg mx-auto py-8 px-4 md:px-8 space-y-10">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-center text-primary-foreground/90">
          Space Station Object Detection
        </h1>
        
        <section aria-labelledby="upload-section-title">
           <h2 id="upload-section-title" className="sr-only">Upload or Capture Image</h2>
            <Card className="bg-card border-2 border-dashed border-border hover:border-primary/70 transition-colors shadow-lg">
            <CardContent className="p-6 sm:p-10 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-primary/80 mb-4" />
                <h3 className="font-headline text-xl font-semibold mb-2 text-card-foreground">Upload or Capture Image</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Drag and drop an image here, or click to select an image from your computer. 
                You can also capture an image using your device's camera.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none" size="lg">
                    <UploadCloud className="mr-2 h-5 w-5" /> Browse Files
                </Button>
                <Button onClick={() => setIsWebcamOpen(true)} variant="outline" className="flex-1 sm:flex-none" size="lg">
                    <Video className="mr-2 h-5 w-5" /> Capture Image
                </Button>
                </div>
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.heic,.heif"
                />
            </CardContent>
            </Card>
        </section>
        
        { annotatedImage && (
          <section aria-labelledby="actions-section-title" className="space-y-4">
            <h2 id="actions-section-title" className="sr-only">Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button onClick={handleOptimizeParams} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
                    <Settings2 className="mr-2 h-4 w-4" /> Optimize AI Parameters
                </Button>
            </div>
            {paramOptimizationDescription && (
              <Card className="bg-accent/10 border-accent text-accent-foreground">
                  <CardContent className="p-3 text-sm">
                  <p className="font-semibold">AI Parameter Optimization:</p>
                  <p>{paramOptimizationDescription}</p>
                  <p className="font-code text-xs mt-1">Current: Confidence: {detectionParams.confidenceThreshold.toFixed(2)}, IoU: {detectionParams.iouThreshold.toFixed(2)}</p>
                  </CardContent>
              </Card>
            )}
          </section>
        )}

        {annotatedImage && annotatedImage.detections.length > 0 && (
          <section aria-labelledby="summary-section-title">
            <h2 id="summary-section-title" className="font-headline text-2xl font-semibold mb-4">Detection Summary</h2>
             <DetectionStats detections={annotatedImage.detections} />
          </section>
        )}

         {annotatedImage && annotatedImage.detections.length > 0 && (
          <section aria-labelledby="export-section-title">
            <h2 id="export-section-title" className="font-headline text-2xl font-semibold mb-4">Result Export</h2>
            <ExportControls annotatedImage={annotatedImage} />
          </section>
        )}
        
        <section aria-labelledby="model-info-section-title">
          <h2 id="model-info-section-title" className="font-headline text-2xl font-semibold mb-4">Model Information</h2>
          <ModelInfo modelInfo={DEFAULT_MODEL_INFO} />
        </section>

      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-[100]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      <WebcamCapture
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />

      <footer className="py-6 mt-10 border-t border-border/60">
        <div className="container flex flex-col items-center justify-center gap-2 md:h-16 text-center">
          <p className="text-sm text-muted-foreground">
            Space Station Object Detection &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Simulated YOLOv8 Model for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

    