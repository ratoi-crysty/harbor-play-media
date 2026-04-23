import { useNavigate } from 'react-router-dom';
import { PLAYLISTS, TRACKS } from '../../../data/media';
import { usePlayer } from '../../../hooks/PlayerContext';
import { PlaylistCard } from '../../widgets/PlaylistCard';
import { Section } from '../../widgets/Section';
import { TrackTile } from '../../widgets/TrackTile';
import './DirAMusicHomePage.scss';

export function DirAMusicHomePage() {
  const navigate = useNavigate();
  const P = usePlayer();

  return (
    <>
      <header className="da-greeting">
        <div className="da-greeting__eyebrow">Good evening</div>
        <h2 className="da-greeting__title">Pick up where you left off</h2>
      </header>

      <Section title="Your playlists">
        <div className="da-grid da-grid--4">
          {PLAYLISTS.map((pl, i) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              idx={i}
              onClick={() => navigate(`/dir-a/album/${pl.id}`)}
            />
          ))}
        </div>
      </Section>

      <Section title="Recently played" action="See library">
        <div className="da-grid da-grid--6">
          {TRACKS.slice(0, 6).map((t, i) => (
            <TrackTile key={t.id} track={t} idx={i} onClick={() => P.playTrack(t)} />
          ))}
        </div>
      </Section>
    </>
  );
}
