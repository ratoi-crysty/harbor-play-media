import { ArtThumb } from '../../atoms/ArtThumb';
import { Badge } from '../../atoms/Badge';
import type { Video } from '../../../data/types';
import './UpNextItem.scss';

interface Props {
  video: Video;
  idx?: number;
  onClick?: () => void;
}

export function UpNextItem({ video, idx = 0, onClick }: Props) {
  return (
    <div className="da-upnext-item" onClick={onClick}>
      <ArtThumb
        color={video.color}
        color2={video.color2}
        idx={idx}
        shape="video"
        radius="sm"
        className="da-upnext-item__thumb"
      >
        <div className="da-upnext-item__duration">
          <Badge variant="duration-sm">{video.duration}</Badge>
        </div>
      </ArtThumb>
      <div className="da-upnext-item__body">
        <div className="da-upnext-item__title">{video.title}</div>
        <div className="da-upnext-item__channel">{video.channel}</div>
        <div className="da-upnext-item__meta">{video.views} · {video.age}</div>
      </div>
    </div>
  );
}
