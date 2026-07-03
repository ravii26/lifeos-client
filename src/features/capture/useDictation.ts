import { useCallback, useEffect, useRef, useState } from "react";

/**
 * On-device speech-to-text via the browser's Web Speech API.
 *
 * Runs entirely on the device — no API key, no quota, no audio upload. The
 * recognised text is streamed back via `onResult` so the caller can fill an
 * input the user can review and edit before submitting.
 *
 * Supported in Chrome/Edge and Safari (webkit-prefixed). Where unavailable,
 * `supported` is false and the caller should hide the mic affordance.
 */

// Minimal typings — the Web Speech API isn't in the standard DOM lib.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

interface UseDictation {
  supported: boolean;
  listening: boolean;
  /** Begin dictating. `onResult(text, isFinal)` receives the latest transcript. */
  start: (onResult: (text: string, isFinal: boolean) => void) => void;
  stop: () => void;
}

export function useDictation(): UseDictation {
  const [supported] = useState(() => getCtor() != null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback((onResult: (text: string, isFinal: boolean) => void) => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      onResult((final + interim).trim(), final.length > 0 && interim.length === 0);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  // Abort any in-flight recognition on unmount.
  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, start, stop };
}
