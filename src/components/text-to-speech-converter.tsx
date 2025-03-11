"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Play,
  Download,
  AlertCircle,
  Loader2,
  Volume2,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  getVoices,
  convertTextToSpeech,
  pollConversionStatus,
  Voice,
} from "@/lib/api-client";
import { ConversionProgress } from "./ConversionProgress";

interface TextToSpeechConverterProps {
  isLoggedIn: boolean;
}

const MAX_FREE_TOKENS = 10000;

export default function TextToSpeechConverter({
  isLoggedIn,
}: TextToSpeechConverterProps) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [taskId, setTaskId] = useState<string | null>(null);

  // Fetch voices on component mount
  useEffect(() => {
    async function loadVoices() {
      try {
        setIsLoadingVoices(true);
        const voicesData = await getVoices();
        setVoices(voicesData);

        // Set default voice (first English voice)
        const englishVoice = voicesData.find((v) => v.Language === "English");
        if (englishVoice) {
          setVoice(englishVoice.Voice);
        } else if (voicesData.length > 0) {
          setVoice(voicesData[0].Voice);
        }
      } catch (err) {
        console.error("Failed to load voices:", err);
        setError("Failed to load voices. Please try again later.");
      } finally {
        setIsLoadingVoices(false);
      }
    }

    loadVoices();
  }, []);

  // Get unique languages from voices
  const languages = [...new Set(voices.map((v) => v.Language))].sort();

  // Filter voices by selected language
  const filteredVoices = voices.filter((v) => v.Language === selectedLanguage);

  // Simulate token count (roughly 1 token per 4 characters)
  const tokenCount = Math.ceil(text.length / 4);
  const isOverLimit = !isLoggedIn && tokenCount > MAX_FREE_TOKENS;

  const handleConvert = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert");
      return;
    }

    console.log("Voice selected:", voice);
    console.log("Text entered:", text);

    if (isOverLimit) {
      setError(
        `Free users are limited to ${MAX_FREE_TOKENS} tokens. Please sign up for unlimited access.`,
      );
      return;
    }

    setError(null);
    setIsConverting(true);
    setProgress(0);
    setAudioUrl(null);
    setTaskId(null);

    try {
      console.log(
        "Component: Starting conversion with text length:",
        text.length,
      );
      console.log("Component: Using voice ID:", voice);

      // Start the conversion process
      console.log("Sending text to conversion API:", text);
      const conversionResponse = await convertTextToSpeech(text, voice);
      console.log("Component: Conversion response:", conversionResponse);

      if (!conversionResponse || !conversionResponse.task_id) {
        console.error(
          "Component: Invalid conversion response:",
          conversionResponse,
        );
        throw new Error(
          "No task ID received from the server. Response: " +
            JSON.stringify(conversionResponse),
        );
      }

      // Set the task ID for the ConversionProgress component
      setTaskId(conversionResponse.task_id);
      
    } catch (err: any) {
      console.error("Conversion error:", err);
      setError(
        err.message || "Failed to convert text to speech. Please try again.",
      );
      setIsConverting(false);
    }
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

      <div className="mb-6 space-y-4">
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Select language
          </label>
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            disabled={isLoadingVoices}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="voice"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Select voice
          </label>
          <Select
            value={voice}
            onValueChange={setVoice}
            disabled={isLoadingVoices || filteredVoices.length === 0}
          >
            <SelectTrigger className="w-full">
              {isLoadingVoices ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading voices...
                </div>
              ) : (
                <SelectValue placeholder="Select a voice" />
              )}
            </SelectTrigger>
            <SelectContent>
              {filteredVoices.map((v) => (
                <SelectItem key={v.Voice} value={v.Voice}>
                  <div className="flex items-center justify-between w-full">
                    <span>{v.Artist}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="ml-2">
                        {v.Country}
                      </Badge>
                      <Badge variant="outline" className="ml-1">
                        {v.Gender}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {voice && (
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                {(() => {
                  const selectedVoice = voices.find((v) => v.Voice === voice);
                  if (!selectedVoice) return null;

                  return (
                    <>
                      <p className="font-medium">{selectedVoice.Artist}</p>
                      <p className="text-muted-foreground">
                        {selectedVoice.Language} • {selectedVoice.Country} •{" "}
                        {selectedVoice.Gender}
                      </p>
                      {selectedVoice.Voice_Personalities && (
                        <p className="text-muted-foreground mt-1">
                          Personality: {selectedVoice.Voice_Personalities}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
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
          disabled={isConverting || !text.trim() || !voice || isOverLimit}
          className="w-full bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting... {progress > 0 && `(${progress}%)`}
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Convert to Speech
            </>
          )}
        </Button>

        {isConverting && progress > 0 && (
          <Progress value={progress} className="h-2" />
        )}

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
              className="text-[#ffba08] font-medium hover:underline text-sm"
            >
              Create an account →
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Show conversion progress and audio player when task is started */}
      {taskId && (
        <ConversionProgress 
          taskId={taskId}
          onComplete={(url) => {
            setAudioUrl(url);
            setIsConverting(false);
          }}
          onError={(err) => {
            setError(err);
            setIsConverting(false);
          }}
        />
      )}
      
      {/* Remove the old audio player and progress bar */}
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
    </div>
  );
}
