import { Outlet, useNavigate } from 'react-router-dom';
import { TopBar } from '../../widgets/TopBar';
import { MiniBar } from '../../widgets/MiniBar';
import { ExpandedPlayer } from '../../widgets/ExpandedPlayer';
import { PlayerProvider } from '../../../hooks/PlayerContext';
import { usePlayerState } from '../../../hooks/usePlayerState';
import type { PlayerMode } from '../../../data/types';
import './DirALayout.scss';

export function DirALayout() {
  const navigate = useNavigate();
  const state = usePlayerState({ mode: 'video' });

  const onTab = (t: PlayerMode) => {
    state.setMode(t);
    navigate('/dir-a');
  };

  return (
    <PlayerProvider value={state}>
      <div className="dir-a">
        <TopBar tab={state.mode} onTab={onTab} />
        <div className="dir-a__content">
          <Outlet />
        </div>
        <MiniBar />
        {state.expanded && <ExpandedPlayer />}
      </div>
    </PlayerProvider>
  );
}
