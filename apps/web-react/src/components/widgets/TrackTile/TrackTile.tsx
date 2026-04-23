import { ArtThumb } from '../../atoms/ArtThumb';
import { mono } from '../../../data/media';
import type { Track } from '../../../data/types';
import './TrackTile.scss';

interface Props {
  track: Track;
  idx?: number;
  onClick?: () => void;
}

export function TrackTile({ track, idx = 0, onClick }: Props) {
  return (
    <div className="da-track-tile" onClick={onClick}>
      <ArtThumb
        color={track.color}
        color2={track.color2}
        idx={idx}
        shape="square"
        radius="md"
        className="da-track-tile__art"
      >
        <span className="da-track-tile__mono">{mono(track.title)}</span>
      </ArtThumb>
      <div className="da-track-tile__title">{track.title}</div>
      <div className="da-track-tile__artist">{track.artist}</div>
    </div>
  );
}
