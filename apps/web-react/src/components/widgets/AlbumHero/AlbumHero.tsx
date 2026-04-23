import { ArtThumb } from '../../atoms/ArtThumb';
import { Icon } from '../../atoms/Icon';
import { PillButton } from '../../atoms/PillButton';
import type { Playlist } from '../../../data/types';
import './AlbumHero.scss';

interface Props {
  playlist: Playlist;
  duration?: string;
  onPlay: () => void;
  onClose?: () => void;
}

export function AlbumHero({ playlist, duration = '2h 34m', onPlay, onClose }: Props) {
  return (
    <div
      className="da-album-hero"
      style={{ background: `linear-gradient(180deg, ${playlist.color2}88, transparent)` }}
    >
      <ArtThumb
        color={playlist.color}
        color2={playlist.color2}
        idx={0}
        shape="square"
        radius="md"
        className="da-album-hero__cover"
      >
        <span className="da-album-hero__cover-text">{playlist.name}</span>
      </ArtThumb>
      <div className="da-album-hero__info">
        <div className="da-album-hero__eyebrow">Playlist</div>
        <h1 className="da-album-hero__title">{playlist.name}</h1>
        <div className="da-album-hero__meta">{playlist.count} tracks · {duration}</div>
        <div className="da-album-hero__actions">
          <PillButton variant="accent" onClick={onPlay}>
            <Icon.play width={14} height={14} /> Play
          </PillButton>
          <PillButton variant="outline">
            <Icon.shuffle width={13} height={13} /> Shuffle
          </PillButton>
          <button type="button" className="da-album-hero__like">
            <Icon.heart width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="da-album-hero__spacer" />
      {onClose && (
        <button type="button" className="da-album-hero__close" onClick={onClose}>
          <Icon.close width={18} height={18} />
        </button>
      )}
    </div>
  );
}
