import { ArtThumb } from '../../atoms/ArtThumb';
import { mono } from '../../../data/media';
import type { Track } from '../../../data/types';
import './TrackRow.scss';

interface Props {
  track: Track;
  idx: number;
  isPlaying: boolean;
  onPlay?: () => void;
}

export function TrackRow({ track, idx, isPlaying, onPlay }: Props) {
  const cls = `da-track-row${isPlaying ? ' da-track-row--active' : ''}`;
  return (
    <div className={cls} onClick={onPlay}>
      <div className="da-track-row__index">{idx + 1}</div>
      <div className="da-track-row__title-cell">
        <ArtThumb
          color={track.color}
          color2={track.color2}
          idx={idx}
          shape="square"
          radius="sm"
          className="da-track-row__art"
        >
          <span className="da-track-row__mono">{mono(track.title)}</span>
        </ArtThumb>
        <div className="da-track-row__title-wrap">
          <div className="da-track-row__title">{track.title}</div>
          <div className="da-track-row__artist">{track.artist}</div>
        </div>
      </div>
      <div className="da-track-row__album">{track.album}</div>
      <div className="da-track-row__duration">{track.duration}</div>
    </div>
  );
}

export function TrackRowHeader() {
  return (
    <div className="da-track-row da-track-row--header">
      <div className="da-track-row__index">#</div>
      <div className="da-track-row__title-cell">Title</div>
      <div className="da-track-row__album">Album</div>
      <div className="da-track-row__duration">Time</div>
    </div>
  );
}
