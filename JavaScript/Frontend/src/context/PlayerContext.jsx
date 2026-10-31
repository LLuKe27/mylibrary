import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * Estado global do player de audiobook (elemento nativo HTML5 <audio>).
 * O áudio é baixado como Blob para que avanço/retrocesso funcionem
 * instantaneamente em qualquer navegador.
 */
const PlayerContext = createContext(null);
export const RATES = [0.75, 1, 1.25, 1.5, 2];

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') audioRef.current = new Audio();
  const urlRef = useRef(null);
  const blobCache = useRef(new Map());

  const [book, setBook] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const a = audioRef.current;
    const on = {
      timeupdate: () => setTime(a.currentTime),
      loadedmetadata: () => setDuration(a.duration),
      durationchange: () => setDuration(a.duration),
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setPlaying(false),
      error: () => setError('Não foi possível reproduzir o áudio.'),
    };
    Object.entries(on).forEach(([k, fn]) => a.addEventListener(k, fn));
    return () => Object.entries(on).forEach(([k, fn]) => a.removeEventListener(k, fn));
  }, []);

  const play = useCallback(
    async (next) => {
      const a = audioRef.current;
      if (book?.id === next.id && a.src) {
        a.paused ? a.play() : a.pause();
        return;
      }
      if (!next.audio?.url) {
        setError('Este livro não possui audiobook.');
        return;
      }
      a.pause();
      setBook(next);
      setError(null);
      setLoading(true);
      setTime(0);
      setDuration(next.audio.duration || 0);
      try {
        let url = blobCache.current.get(next.id);
        if (!url) {
          const res = await fetch(api.audioUrl(next.audio.url));
          if (!res.ok) throw new Error('Falha ao carregar o audiobook');
          url = URL.createObjectURL(await res.blob());
          blobCache.current.set(next.id, url);
        }
        urlRef.current = url;
        a.src = url;
        a.playbackRate = rate;
        await a.play();
        api.addHistory(next.id, 'listen').catch(() => {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [book, rate],
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a.src) return;
    a.paused ? a.play() : a.pause();
  }, []);

  const seek = useCallback((t) => {
    const a = audioRef.current;
    if (!a.src) return;
    a.currentTime = Math.max(0, Math.min(t, a.duration || t));
    setTime(a.currentTime);
  }, []);

  const skip = useCallback((delta) => seek(audioRef.current.currentTime + delta), [seek]);

  const setRate = useCallback((r) => {
    audioRef.current.playbackRate = r;
    setRateState(r);
  }, []);

  const cycleRate = useCallback(
    (dir = 1) => {
      const i = RATES.indexOf(rate);
      setRate(RATES[(i + dir + RATES.length) % RATES.length]);
    },
    [rate, setRate],
  );

  const stop = useCallback(() => {
    const a = audioRef.current;
    a.pause();
    a.removeAttribute('src');
    a.load();
    setBook(null);
    setPlaying(false);
    setTime(0);
  }, []);

  // Integração com Media Session (teclas de mídia do sistema).
  useEffect(() => {
    if (!('mediaSession' in navigator) || !book) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: book.title, artist: book.author?.name, album: 'My Library' });
    navigator.mediaSession.setActionHandler('play', toggle);
    navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => skip(15));
  }, [book, toggle, skip]);

  const value = useMemo(
    () => ({ book, playing, loading, time, duration, rate, error, play, toggle, seek, skip, setRate, cycleRate, stop }),
    [book, playing, loading, time, duration, rate, error, play, toggle, seek, skip, setRate, cycleRate, stop],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => useContext(PlayerContext);

