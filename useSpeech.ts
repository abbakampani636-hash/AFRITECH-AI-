import { useCallback, useEffect, useRef, useState } from "react";
import { AppLanguage } from "../types";

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as Record<string, unknown>;
  const ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  return typeof ctor === "function" ? (ctor as new () => SpeechRecognitionLike) : null;
}

export function useSpeech(language: AppLanguage) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const sttSupported = Boolean(getSpeechRecognitionConstructor());
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (onTranscript: (text: string, isFinal: boolean) => void, overrideLang?: AppLanguage) => {
      setSpeechError(null);
      const Ctor = getSpeechRecognitionConstructor();
      if (!Ctor) {
        setSpeechError(
          language === "ha"
            ? "Wannan browser ba ta goyan bayan magana da murya ba."
            : "Speech recognition is not supported in this browser."
        );
        return false;
      }

      if (recognitionRef.current) {
        stopListening();
      }

      try {
        const recognition = new Ctor();
        const activeLang = overrideLang ?? language;
        recognition.lang = activeLang === "ha" ? "ha-NG" : "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let transcript = "";
          let isFinal = false;
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0]?.transcript ?? "";
            if (event.results[i].isFinal) {
              isFinal = true;
            }
          }
          onTranscript(transcript.trim(), isFinal);
        };

        recognition.onerror = (event: { error: string }) => {
          setIsListening(false);
          recognitionRef.current = null;
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setSpeechError(
              language === "ha"
                ? "An hana izinin makirifo. Da fatan za a ba da izini a saitin browser."
                : "Microphone permission was denied. Please enable microphone access."
            );
          } else if (event.error !== "aborted" && event.error !== "no-speech") {
            setSpeechError(
              language === "ha"
                ? "Ba a iya fahimtar muryar ba. Sake gwadawa."
                : "Could not capture speech clearly. Please try again."
            );
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        setIsListening(true);
        recognition.start();
        return true;
      } catch {
        setIsListening(false);
        setSpeechError(
          language === "ha"
            ? "Ba a iya kunna makirifo ba."
            : "Unable to start microphone input."
        );
        return false;
      }
    },
    [language, stopListening]
  );

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [ttsSupported]);

  const speak = useCallback(
    (text: string, overrideLang?: AppLanguage) => {
      if (!ttsSupported || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const activeLang = overrideLang ?? language;
      utterance.lang = activeLang === "ha" ? "ha-NG" : "en-US";
      utterance.rate = 0.98;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [language, ttsSupported]
  );

  useEffect(() => {
    return () => {
      stopListening();
      if (ttsSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopListening, ttsSupported]);

  return {
    sttSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    speechError,
    setSpeechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
