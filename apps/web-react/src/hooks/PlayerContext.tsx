import { createContext, useContext } from 'react';
import type { PlayerState } from './usePlayerState';

const PlayerContext = createContext<PlayerState | null>(null);

export const PlayerProvider = PlayerContext.Provider;

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
