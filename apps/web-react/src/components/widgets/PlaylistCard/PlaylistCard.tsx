import { ArtThumb } from '../../atoms/ArtThumb';
import type { Playlist } from '../../../data/types';
import './PlaylistCard.scss';

interface Props {
  playlist: Playlist;
  idx?: number;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, idx = 0, onClick }: Props) {
  return (
    <div className="da-playlist-card" onClick={onClick}>
      <ArtThumb
        color={playlist.color}
        color2={playlist.color2}
        idx={idx}
        shape="square"
        radius="md"
        className="da-playlist-card__art"
      >
        <div className="da-playlist-card__art-label">{playlist.name}</div>
      </ArtThumb>
      <div className="da-playlist-card__name">{playlist.name}</div>
      <div className="da-playlist-card__count">{playlist.count} tracks</div>
    </div>
  );
}
