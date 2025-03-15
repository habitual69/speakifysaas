"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  className?: string;
  onDownload?: () => void;
}

export function AudioPlayer({ src, className, onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioData, setAudioData] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize audio context and analyzer
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Create audio context and analyzer
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceRef.current =
          audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      cancelAnimationFrame(animationRef.current!);
    };

    // Add event listeners
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", () => {
      initAudioContext();
      visualize();
    });

    // Clean up event listeners
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Visualizer function
  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      // Only update state occasionally to avoid performance issues
      if (Math.random() > 0.9) {
        setAudioData([...dataArray]);
      }

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#ffba08");
        gradient.addColorStop(0.5, "#ff9e00");
        gradient.addColorStop(1, "#ff6d00");

        ctx.fillStyle = gradient;

        // Draw rounded bars
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, height);
        ctx.lineTo(x + barWidth - radius, height);
        ctx.quadraticCurveTo(
          x + barWidth,
          height,
          x + barWidth,
          height - radius,
        );
        ctx.lineTo(x + barWidth, height - barHeight + radius);
        ctx.quadraticCurveTo(
          x + barWidth,
          height - barHeight,
          x + barWidth - radius,
          height - barHeight,
        );
        ctx.lineTo(x + radius, height - barHeight);
        ctx.quadraticCurveTo(
          x,
          height - barHeight,
          x,
          height - barHeight + radius,
        );
        ctx.lineTo(x, height - radius);
        ctx.quadraticCurveTo(x, height, x + radius, height);
        ctx.fill();

        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audio.play();
      visualize();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
      audio.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audio.muted = false;
    }
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    // Ensure newTime is a valid number before setting it
    if (!isNaN(newTime) && isFinite(newTime)) {
      audio.currentTime = newTime;
      // We don't need to call setCurrentTime here as the timeupdate event will trigger
      // and update the state automatically
    }
  };

  // Update progress bar when currentTime changes
  useEffect(() => {
    if (audioRef.current && !isNaN(currentTime) && isFinite(currentTime)) {
      // We'll directly update the state to force a re-render of the slider
      // This is more reliable than trying to manipulate the DOM directly
      setCurrentTime(currentTime);
    }
  }, [audioRef.current?.currentTime]);

  return (
    <div
      className={cn(
        "flex flex-col space-y-4 w-full bg-gradient-to-br from-[#1c3144] to-[#2a4158] rounded-xl p-5 shadow-lg border border-[#3a5169]",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Visualizer Canvas */}
      <div className="w-full h-28 bg-[#0f1c2a]/50 rounded-lg overflow-hidden backdrop-blur-sm border border-[#3a5169]/30">
        <canvas
          ref={canvasRef}
          width={600}
          height={100}
          className="w-full h-full"
        />
      </div>

      {/* Waveform visualization (fallback/additional) */}
      {!isPlaying && audioData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-1 h-full">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#ffba08]/50 rounded-full"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}%`,
                  opacity: 0.3 + Math.random() * 0.7,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium text-white/80 w-12">
          {formatTime(currentTime)}
        </div>

        <Slider
          key={`progress-${currentTime.toFixed(1)}`}
          value={[
            !isNaN(currentTime) && isFinite(currentTime) ? currentTime : 0,
          ]}
          max={!isNaN(duration) && isFinite(duration) ? duration : 100}
          step={0.1}
          className="flex-1"
          onValueChange={handleProgressChange}
        />

        <div className="text-sm font-medium text-white/80 w-12 text-right">
          {isNaN(duration) || !isFinite(duration)
            ? "00:00"
            : formatTime(duration)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-[#ffba08] hover:bg-[#ffba08]/90 border-none text-[#1c3144] shadow-md"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <div className="flex items-center space-x-2 bg-[#0f1c2a]/30 rounded-full px-3 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-[#0f1c2a]/50"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              className="w-24"
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="text-xs gap-1.5 h-9 bg-[#0f1c2a]/30 hover:bg-[#0f1c2a]/50 border-[#3a5169]/50 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download Audio
          </Button>
        )}
      </div>

      {/* Audio info */}
      <div className="flex items-center justify-center mt-1">
        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <Activity className="h-3.5 w-3.5" />
          <span>Speakify Audio</span>
        </div>
      </div>
    </div>
  );
}
