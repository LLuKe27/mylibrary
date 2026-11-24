import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { buildNarrationSegments, parseVoiceCommand, pickPortugueseVoice } from '../lib/speech.js';

/**
 * Estado global do player de audiobook (elemento nativo HTML5 <audio>)
 * integrado à Web Speech API (SpeechSynthesis para narração do livro
 * e SpeechRecognition para comandos de voz).
 */
const PlayerContext = createContext(null);
const PlayerTimeContext = createContext(0);
export const RATES = [0.75, 1, 1.25, 1.5, 2];

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') audioRef.current = new Audio();
  const urlRef = useRef(null);
  const blobCache = useRef(new Map());
  const excerptCache = useRef(new Map());

  const speechGenRef = useRef(0);
  const recognitionRef = useRef(null);
  const segmentsRef = useRef([]);
  const segmentIndexRef = useRef(0);
  const narrationRef = useRef(true);
  const rateRef = useRef(1);
  const playingRef = useRef(false);
  const selectedVoiceRef = useRef('');
  const voicesRef = useRef([]);

  const [book, setBook] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [error, setError] = useState(null);

  // Estado Web Speech API
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [narration, setNarration] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [segments, setSegments] = useState([]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSynth = 'speechSynthesis' in window;
    const hasRec = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(hasSynth);
    setRecognitionSupported(hasRec);
    if (!hasSynth) return;

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices?.() ?? [];
      const pt = list.filter((v) => /^pt\b/i.test(v.lang));
      const usable = pt.length ? pt : list;
      voicesRef.current = usable;
      setVoices(usable);
      const best = pickPortugueseVoice(usable, selectedVoiceRef.current);
      if (best && !selectedVoiceRef.current) {
        selectedVoiceRef.current = best.voiceURI;
        setSelectedVoiceURI(best.voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
      window.speechSynthesis.cancel?.();
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    speechGenRef.current += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakAt = useCallback(
    (idx, customSegments) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const list = customSegments ?? segmentsRef.current;
      if (!narrationRef.current || !list.length) return;
      const clamped = Math.max(0, Math.min(idx, list.length - 1));
      segmentIndexRef.current = clamped;
      setSegmentIndex(clamped);

      const gen = ++speechGenRef.current;
      window.speechSynthesis.cancel();

      const item = list[clamped];
      const utt = new SpeechSynthesisUtterance(item.text);
      const voice = pickPortugueseVoice(voicesRef.current, selectedVoiceRef.current);
      if (voice) {
        utt.voice = voice;
        utt.lang = voice.lang;
      } else {
        utt.lang = 'pt-BR';
      }
      utt.rate = rateRef.current;

      utt.onstart = () => {
        if (speechGenRef.current === gen) setSpeaking(true);
      };
      utt.onend = () => {
        if (speechGenRef.current !== gen) return;
        if (playingRef.current && narrationRef.current && clamped + 1 < list.length) {
          speakAt(clamped + 1, list);
        } else {
          setSpeaking(false);
        }
      };
      utt.onerror = (ev) => {
        if (speechGenRef.current !== gen) return;
        if (ev?.error !== 'interrupted' && ev?.error !== 'canceled') {
          setSpeaking(false);
        }
      };
      window.speechSynthesis.speak(utt);
    },
    [],
  );

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const on = {
      timeupdate: () => setTime((prev) => (Math.abs(a.currentTime - prev) >= 0.1 ? a.currentTime : prev)),
      loadedmetadata: () => setDuration(a.duration),
      durationchange: () => setDuration(a.duration),
      play: () => {
        playingRef.current = true;
        setPlaying(true);
      },
      pause: () => {
        playingRef.current = false;
        setPlaying(false);
      },
      ended: () => {
        playingRef.current = false;
        setPlaying(false);
        cancelSpeech();
      },
      error: () => setError('Não foi possível reproduzir o áudio.'),
    };
    Object.entries(on).forEach(([k, fn]) => a.addEventListener(k, fn));
    return () => Object.entries(on).forEach(([k, fn]) => a.removeEventListener(k, fn));
  }, [cancelSpeech]);

  const play = useCallback(
    async (next) => {
      const a = audioRef.current;
      if (!a) return;
      if (book?.id === next.id && a.src) {
        if (a.paused) {
          a.volume = narrationRef.current ? 0.16 : 1;
          await a.play();
          playingRef.current = true;
          if (narrationRef.current) speakAt(segmentIndexRef.current);
        } else {
          a.pause();
          cancelSpeech();
        }
        return;
      }
      if (!next.audio?.url) {
        setError('Este livro não possui audiobook.');
        return;
      }
      a.pause();
      cancelSpeech();
      setBook(next);
      setError(null);
      setLoading(true);
      setTime(0);
      setDuration(next.audio.duration || 0);

      try {
        const audioPromise = (async () => {
          let url = blobCache.current.get(next.id);
          if (!url) {
            const res = await fetch(api.audioUrl(next.audio.url));
            if (!res.ok) throw new Error('Falha ao carregar o audiobook');
            url = URL.createObjectURL(await res.blob());
            blobCache.current.set(next.id, url);
          }
          return url;
        })();

        const excerptPromise = (async () => {
          if (excerptCache.current.has(next.id)) return excerptCache.current.get(next.id);
          const d = await api.read(next.id).catch(() => ({ pages: [] }));
          const pages = Array.isArray(d?.pages) ? d.pages : [];
          excerptCache.current.set(next.id, pages);
          return pages;
        })();

        const [url, pages] = await Promise.all([audioPromise, excerptPromise]);
        const built = buildNarrationSegments(next, pages);
        segmentsRef.current = built;
        segmentIndexRef.current = 0;
        setSegments(built);
        setSegmentIndex(0);

        urlRef.current = url;
        a.src = url;
        a.playbackRate = rateRef.current;
        a.volume = narrationRef.current ? 0.16 : 1;
        await a.play();
        playingRef.current = true;
        if (narrationRef.current && built.length) speakAt(0, built);
        api.addHistory(next.id, 'listen').catch(() => {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [book, cancelSpeech, speakAt],
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a?.src) return;
    if (a.paused) {
      a.volume = narrationRef.current ? 0.16 : 1;
      a.play();
      playingRef.current = true;
      if (narrationRef.current) speakAt(segmentIndexRef.current);
    } else {
      a.pause();
      playingRef.current = false;
      cancelSpeech();
    }
  }, [cancelSpeech, speakAt]);

  const seek = useCallback((t) => {
    const a = audioRef.current;
    if (!a?.src) return;
    a.currentTime = Math.max(0, Math.min(t, a.duration || t));
    setTime(a.currentTime);
  }, []);

  const skip = useCallback((delta) => {
    const a = audioRef.current;
    if (!a) return;
    seek(a.currentTime + delta);
  }, [seek]);

  const skipSegment = useCallback(
    (delta) => {
      const list = segmentsRef.current;
      if (!list.length) return;
      const target = Math.max(0, Math.min(list.length - 1, segmentIndexRef.current + delta));
      segmentIndexRef.current = target;
      setSegmentIndex(target);
      if (playingRef.current && narrationRef.current) {
        speakAt(target, list);
      }
    },
    [speakAt],
  );

  const setRate = useCallback(
    (r) => {
      if (audioRef.current) audioRef.current.playbackRate = r;
      rateRef.current = r;
      setRateState(r);
      if (playingRef.current && narrationRef.current) {
        speakAt(segmentIndexRef.current);
      }
    },
    [speakAt],
  );

  const cycleRate = useCallback(
    (dir = 1) => {
      const i = RATES.indexOf(rateRef.current);
      setRate(RATES[(i + dir + RATES.length) % RATES.length]);
    },
    [setRate],
  );

  const toggleNarration = useCallback(() => {
    const nextVal = !narrationRef.current;
    narrationRef.current = nextVal;
    setNarration(nextVal);
    if (audioRef.current) audioRef.current.volume = nextVal ? 0.16 : 1;
    if (nextVal) {
      if (playingRef.current && segmentsRef.current.length) {
        speakAt(segmentIndexRef.current);
      }
    } else {
      cancelSpeech();
    }
  }, [cancelSpeech, speakAt]);

  const setVoice = useCallback(
    (uri) => {
      selectedVoiceRef.current = uri;
      setSelectedVoiceURI(uri);
      if (playingRef.current && narrationRef.current) {
        speakAt(segmentIndexRef.current);
      }
    },
    [speakAt],
  );

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute('src');
      a.load();
    }
    playingRef.current = false;
    cancelSpeech();
    try {
      recognitionRef.current?.stop();
    } catch {}
    setVoiceListening(false);
    setBook(null);
    setPlaying(false);
    setTime(0);
    segmentsRef.current = [];
    segmentIndexRef.current = 0;
    setSegments([]);
    setSegmentIndex(0);
  }, [cancelSpeech]);

  const feedbackTimerRef = useRef(null);
  const flashFeedback = useCallback((msg) => {
    setVoiceFeedback(msg);
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setVoiceFeedback(''), 3500);
  }, []);

  const toggleVoiceCommands = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (voiceListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setVoiceListening(false);
      return;
    }

    const rec = new SpeechRec();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => {
      setVoiceListening(true);
      flashFeedback('Ouvindo comando (ex: pausar, tocar, avançar, voltar, mais rápido)…');
    };
    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      const cmd = parseVoiceCommand(transcript);
      if (!cmd) {
        flashFeedback(`Não reconhecido: "${transcript}"`);
        return;
      }
      flashFeedback(`Comando de voz: ${cmd.label}`);
      if (cmd.action === 'pause' && playingRef.current) toggle();
      else if (cmd.action === 'play' && !playingRef.current) toggle();
      else if (cmd.action === 'forward') { skip(15); skipSegment(1); }
      else if (cmd.action === 'backward') { skip(-15); skipSegment(-1); }
      else if (cmd.action === 'faster') cycleRate(1);
      else if (cmd.action === 'slower') cycleRate(-1);
      else if (cmd.action === 'stop') stop();
    };
    rec.onerror = (ev) => {
      setVoiceListening(false);
      if (ev?.error && ev.error !== 'aborted' && ev.error !== 'no-speech') {
        flashFeedback(`Microfone indisponível (${ev.error})`);
      }
    };
    rec.onend = () => setVoiceListening(false);
    rec.start();
  }, [voiceListening, flashFeedback, toggle, skip, skipSegment, cycleRate, stop]);

  // Integração com Media Session (teclas de mídia do sistema).
  useEffect(() => {
    if (!('mediaSession' in navigator) || !book) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: book.title, artist: book.author?.name, album: 'My Library' });
    navigator.mediaSession.setActionHandler('play', toggle);
    navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => skip(15));
  }, [book, toggle, skip]);

  const currentSegment = segments[segmentIndex] ?? null;

  const value = useMemo(
    () => ({
      book,
      playing,
      loading,
      duration,
      rate,
      error,
      play,
      toggle,
      seek,
      skip,
      setRate,
      cycleRate,
      stop,
      // Web Speech API
      speechSupported,
      recognitionSupported,
      narration,
      speaking,
      segments,
      segmentIndex,
      currentSegment,
      voices,
      selectedVoiceURI,
      voiceListening,
      voiceFeedback,
      toggleNarration,
      skipSegment,
      setVoice,
      toggleVoiceCommands,
    }),
    [
      book,
      playing,
      loading,
      duration,
      rate,
      error,
      play,
      toggle,
      seek,
      skip,
      setRate,
      cycleRate,
      stop,
      speechSupported,
      recognitionSupported,
      narration,
      speaking,
      segments,
      segmentIndex,
      currentSegment,
      voices,
      selectedVoiceURI,
      voiceListening,
      voiceFeedback,
      toggleNarration,
      skipSegment,
      setVoice,
      toggleVoiceCommands,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      <PlayerTimeContext.Provider value={time}>{children}</PlayerTimeContext.Provider>
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
export const usePlayerTime = () => useContext(PlayerTimeContext);
