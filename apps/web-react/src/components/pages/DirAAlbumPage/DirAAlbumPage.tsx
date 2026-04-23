import { useNavigate, useParams } from 'react-router-dom';
import { PLAYLISTS, TRACKS } from '../../../data/media';
import { usePlayer } from '../../../hooks/PlayerContext';
import { AlbumHero } from '../../widgets/AlbumHero';
import { TrackRow, TrackRowHeader } from '../../widgets/TrackRow';
import './DirAAlbumPage.scss';

export function DirAAlbumPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const P = usePlayer();

  const playlist = PLAYLISTS.find((p) => p.id === playlistId) ?? PLAYLISTS[0];
  const tracks = TRACKS.slice(0, 8);

  return (
    <div className="da-album">
      <AlbumHero
        playlist={playlist}
        onPlay={() => P.playTrack(tracks[0])}
        onClose={() => navigate('/dir-a')}
      />
      <div className="da-album__list">
        <TrackRowHeader />
        {tracks.map((t, i) => (
          <TrackRow
            key={t.id}
            track={t}
            idx={i}
            isPlaying={P.nowPlaying.id === t.id}
            onPlay={() => P.playTrack(t)}
          />
        ))}
      </div>
    </div>
  );
}
