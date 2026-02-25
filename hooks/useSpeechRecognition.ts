"use client";

import { useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
) {
  const {
    language = "en-US",
    continuous = false,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.language = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcriptSegment + " ";
        } else {
          interim += transcriptSegment;
        }
      }

      setInterimTranscript(interim);
      setTranscript((prev) => prev + final);
    };

    recognition.onerror = (event: any) => {
      const errorMessage = event.error || "An error occurred";
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition: isSupported,
  };
}
