import { ArtThumb } from '../../atoms/ArtThumb';
import { Badge } from '../../atoms/Badge';
import type { Video } from '../../../data/types';
import './VideoCard.scss';

interface Props {
  video: Video;
  idx?: number;
  compact?: boolean;
  onClick?: () => void;
}

export function VideoCard({ video, idx = 0, compact = false, onClick }: Props) {
  const cls = `da-video-card${compact ? ' da-video-card--compact' : ''}`;
  return (
    <div className={cls} onClick={onClick}>
      <ArtThumb
        color={video.color}
        color2={video.color2}
        idx={idx}
        shape="video"
        radius="md"
        className="da-video-card__thumb"
      >
        <div className="da-video-card__duration">
          <Badge variant="duration">{video.duration}</Badge>
        </div>
        <div className="da-video-card__tag">
          <Badge variant="tag">{video.tag}</Badge>
        </div>
      </ArtThumb>
      <div className="da-video-card__title">{video.title}</div>
      <div className="da-video-card__channel">{video.channel}</div>
      <div className="da-video-card__meta">{video.views} views · {video.age} ago</div>
    </div>
  );
}
