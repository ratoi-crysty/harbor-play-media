import { usePlayer } from '../../../hooks/PlayerContext';
import { DirAMusicHomePage } from '../DirAMusicHomePage';
import { DirAVideoHomePage } from '../DirAVideoHomePage';
import './DirAHomePage.scss';

export function DirAHomePage() {
  const P = usePlayer();
  return (
    <div className="da-home">
      {P.mode === 'video' ? <DirAVideoHomePage /> : <DirAMusicHomePage />}
    </div>
  );
}
