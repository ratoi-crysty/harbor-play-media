import { useEffect, useState } from 'react';
import { TRACKS } from '../data/media';
import type { Playable, PlayerMode, PlayerView, Track, Video } from '../data/types';

export interface PlayerStateInit {
  mode?: PlayerMode;
  nowPlaying?: Playable;
  queue?: Track[];
  view?: PlayerView;
}

export interface PlayerState {
  mode: PlayerMode;
  setMode: (m: PlayerMode) => void;
  nowPlaying: Playable;
  setNowPlaying: (p: Playable) => void;
  queue: Track[];
  setQueue: (q: Track[]) => void;
  playing: boolean;
  setPlaying: (b: boolean) => void;
  progress: number;
  setProgress: (n: number) => void;
  volume: number;
  setVolume: (n: number) => void;
  liked: Record<string, boolean>;
  toggleLike: (id: string) => void;
  expanded: boolean;
  setExpanded: (b: boolean) => void;
  view: PlayerView;
  setView: (v: PlayerView) => void;
  playTrack: (t: Track) => void;
  playVideo: (v: Video) => void;
  removeFromQueue: (id: string) => void;
  moveInQueue: (fromIdx: number, toIdx: number) => void;
  next: () => void;
}

export function usePlayerState(initial: PlayerStateInit = {}): PlayerState {
  const [mode, setMode] = useState<PlayerMode>(initial.mode ?? 'video');
  const [nowPlaying, setNowPlaying] = useState<Playable>(initial.nowPlaying ?? TRACKS[0]);
  const [queue, setQueue] = useState<Track[]>(initial.queue ?? TRACKS.slice(1, 6));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.34);
  const [volume, setVolume] = useState(0.7);
  const [liked, setLiked] = useState<Record<string, boolean>>({ t1: true, t5: true, v2: true });
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<PlayerView>(initial.view ?? 'home');

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress((p) => (p + 0.003) % 1), 300);
    return () => clearInterval(t);
  }, [playing]);

  const playTrack = (t: Track) => {
    setMode('music');
    setNowPlaying(t);
    setPlaying(true);
    setProgress(0);
  };

  const playVideo = (v: Video) => {
    setMode('video');
    setNowPlaying(v);
    setPlaying(true);
    setView('watch');
    setProgress(0);
  };

  const toggleLike = (id: string) => setLiked((L) => ({ ...L, [id]: !L[id] }));

  const removeFromQueue = (id: string) =>
    setQueue((q) => q.filter((x) => x.id !== id));

  const moveInQueue = (fromIdx: number, toIdx: number) =>
    setQueue((q) => {
      const n = q.slice();
      const [item] = n.splice(fromIdx, 1);
      n.splice(toIdx, 0, item);
      return n;
    });

  const next = () => {
    if (queue.length) {
      const [n, ...rest] = queue;
      setNowPlaying(n);
      setQueue(rest);
      setProgress(0);
    }
  };

  return {
    mode, setMode, nowPlaying, setNowPlaying, queue, setQueue,
    playing, setPlaying, progress, setProgress, volume, setVolume,
    liked, toggleLike, expanded, setExpanded, view, setView,
    playTrack, playVideo, removeFromQueue, moveInQueue, next,
  };
}
