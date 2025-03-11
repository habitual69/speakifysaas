"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Play, Download, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface TextToSpeechConverterProps {
  isLoggedIn: boolean;
}

const VOICES = [
  { id: "en-US-1", name: "Emma (US Female)" },
  { id: "en-US-2", name: "Michael (US Male)" },
  { id: "en-GB-1", name: "Olivia (UK Female)" },
  { id: "en-GB-2", name: "James (UK Male)" },
  { id: "en-AU-1", name: "Charlotte (AU Female)" },
];

const MAX_FREE_TOKENS = 10000;

export default function TextToSpeechConverter({
  isLoggedIn,
}: TextToSpeechConverterProps) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("en-US-1");
  const [isConverting, setIsConverting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate token count (roughly 1 token per 4 characters)
  const tokenCount = Math.ceil(text.length / 4);
  const isOverLimit = !isLoggedIn && tokenCount > MAX_FREE_TOKENS;

  const handleConvert = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert");
      return;
    }

    if (isOverLimit) {
      setError(
        `Free users are limited to ${MAX_FREE_TOKENS} tokens. Please sign up for unlimited access.`,
      );
      return;
    }

    setError(null);
    setIsConverting(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // In a real implementation, this would be an actual API call
      // For demo purposes, we're just setting a sample audio URL
      setAudioUrl(
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3",
      );
      setIsConverting(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "speakify-audio.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-md p-6 border border-border">
      <div className="mb-6">
        <label
          htmlFor="text"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Enter your text
        </label>
        <Textarea
          id="text"
          placeholder="Type or paste your text here..."
          className="min-h-32"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-2 text-sm text-muted-foreground flex justify-between">
          <span>Token count: {tokenCount}</span>
          {!isLoggedIn && (
            <span
              className={tokenCount > MAX_FREE_TOKENS ? "text-red-500" : ""}
            >
              Free limit: {MAX_FREE_TOKENS} tokens
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="voice"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Select voice
        </label>
        <Select value={voice} onValueChange={setVoice}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {VOICES.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-4">
        <Button
          onClick={handleConvert}
          disabled={isConverting || !text.trim() || isOverLimit}
          className="w-full"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Convert to Speech
            </>
          )}
        </Button>

        {audioUrl && (
          <div className="mt-6 space-y-4">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="text-center mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-foreground mb-2">
              Sign up for unlimited conversions and premium voices
            </p>
            <a
              href="/sign-up"
              className="text-secondary font-medium hover:underline text-sm"
            >
              Create an account →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
