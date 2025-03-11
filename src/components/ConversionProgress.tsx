"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConversionProgressProps {
  taskId: string;
  onComplete?: (audioUrl: string) => void;
  onError?: (error: string) => void;
}

export function ConversionProgress({
  taskId,
  onComplete,
  onError,
}: ConversionProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "error">("processing");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${taskId}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          setStatus("error");
          if (onError) onError(data.error);
          return;
        }
        
        setProgress(data.progressPercentage || 0);
        
        if (data.isComplete && data.audioUrl) {
          setStatus("completed");
          setAudioUrl(data.audioUrl);
          if (onComplete) onComplete(data.audioUrl);
        } else if (data.hasError) {
          setStatus("error");
          setError(data.error || "An unknown error occurred");
          if (onError) onError(data.error || "An unknown error occurred");
        } else {
          // Still processing, check again after a delay
          setTimeout(checkStatus, 2000);
        }
      } catch (err) {
        console.error("Error checking conversion status:", err);
        setError("Failed to check conversion status");
        setStatus("error");
        if (onError) onError("Failed to check conversion status");
      }
    };
    
    checkStatus();
  }, [taskId, onComplete, onError]);

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `speakify_audio_${taskId}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full space-y-4">
      {status === "processing" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Converting text to speech...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "An error occurred during conversion"}
          </AlertDescription>
        </Alert>
      )}

      {status === "completed" && audioUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Conversion complete</h3>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <AudioPlayer src={audioUrl} />
        </div>
      )}
    </div>
  );
}