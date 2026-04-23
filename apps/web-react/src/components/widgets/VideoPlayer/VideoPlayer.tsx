import { ArtThumb } from '../../atoms/ArtThumb';
import { Icon } from '../../atoms/Icon';
import { ProgressBar } from '../../atoms/ProgressBar';
import type { Video } from '../../../data/types';
import { fmtTime } from '../../../utils/time';
import './VideoPlayer.scss';

interface Props {
  video: Video;
  playing: boolean;
  progress: number;
  onTogglePlay: () => void;
  onSeek: (f: number) => void;
}

export function VideoPlayer({ video, playing, progress, onTogglePlay, onSeek }: Props) {
  return (
    <div className="da-player">
      <ArtThumb
        color={video.color}
        color2={video.color2}
        idx={0}
        shape="video"
        radius="lg"
        className="da-player__art"
      >
        <div className="da-player__overlay">
          <div className="da-player__progress">
            <ProgressBar progress={progress} onSeek={onSeek} variant="thick" color="accent" showThumb />
          </div>
          <div className="da-player__controls">
            <button type="button" className="da-player__btn" onClick={onTogglePlay}>
              {playing ? <Icon.pause width={22} height={22} /> : <Icon.play width={22} height={22} />}
            </button>
            <button type="button" className="da-player__btn">
              <Icon.next width={20} height={20} />
            </button>
            <div className="da-player__time">{fmtTime(progress * 860)} / 14:22</div>
            <div className="da-player__spacer" />
            <button type="button" className="da-player__btn">
              <Icon.cast width={18} height={18} />
            </button>
            <button type="button" className="da-player__btn">
              <Icon.fullscreen width={18} height={18} />
            </button>
          </div>
        </div>
      </ArtThumb>
    </div>
  );
}
