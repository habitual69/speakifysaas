"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { pollConversionStatus } from "@/lib/api-client";

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
  const [status, setStatus] = useState<"processing" | "completed" | "error">(
    "processing",
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    let isMounted = true;
    let pollingInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${taskId}`);
        const data = await response.json();

        if (!isMounted) return;

        if (data.error) {
          setError(data.error);
          setStatus("error");
          if (onError) onError(data.error);
          return;
        }

        // Update progress from the correct property
        // The API returns progress as a number between 0-100
        setProgress(data.progress || data.progressPercentage || 0);

        if (
          (data.status === "completed" && data.output_file) ||
          data.isComplete
        ) {
          setStatus("completed");
          const audioUrl = data.audioUrl || `/api/audio/${data.output_file}`;
          setAudioUrl(audioUrl);
          if (onComplete) onComplete(audioUrl);
          clearInterval(pollingInterval);
        } else if (data.status === "failed") {
          setStatus("error");
          setError(data.error || "An unknown error occurred");
          if (onError) onError(data.error || "An unknown error occurred");
          clearInterval(pollingInterval);
        } else {
          // Still processing, continue polling
        }
      } catch (err) {
        console.error("Error checking conversion status:", err);
        if (!isMounted) return;

        // Don't immediately stop polling on network errors
        if (err instanceof Error && err.message.includes("Failed to fetch")) {
          console.log("Network error, will retry...");
        } else {
          setError("Failed to check conversion status");
          setStatus("error");
          if (onError) onError("Failed to check conversion status");
          clearInterval(pollingInterval);
        }
      }
    };

    // Start polling immediately
    checkStatus();

    // Then continue polling every 2 seconds
    pollingInterval = setInterval(checkStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
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
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Converting text to speech...</span>
            </div>
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

      {/* We don't render the audio player here anymore, it's handled by the parent component */}
    </div>
  );
}
