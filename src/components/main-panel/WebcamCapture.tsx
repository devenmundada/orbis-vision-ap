'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, CircleUserRound, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string, width: number, height: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function WebcamCapture({ onCapture, isOpen, onClose }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startWebcam = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      const errorMessage = (err as Error).message.includes('Permission denied') 
        ? "Webcam permission denied. Please allow access in your browser settings."
        : "Could not access webcam. Please ensure it is connected and not in use by another application.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Webcam Error", description: errorMessage });
      onClose(); // Close dialog on error
    }
  }, [toast, onClose]);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam(); // Cleanup on component unmount
  }, [isOpen, startWebcam, stopWebcam]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video intrinsic dimensions
        const { videoWidth, videoHeight } = video;
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg'); // Use JPEG for smaller size
        onCapture(dataUrl, videoWidth, videoHeight);
        toast({ title: "Image Captured", description: "Processing image from webcam..." });
        onClose(); // Close dialog after capture
      } else {
        toast({ variant: "destructive", title: "Capture Error", description: "Could not get canvas context." });
      }
    } else {
      toast({ variant: "destructive", title: "Capture Error", description: "Webcam stream not available." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="font-headline flex items-center gap-2"><Video className="h-5 w-5" /> Webcam Capture</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!stream && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <CircleUserRound className="h-16 w-16 mb-2" />
                <p>Starting webcam...</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <XCircle className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleCapture} disabled={!stream || !!error}>
            <Camera className="mr-2 h-4 w-4" /> Capture Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
