import { useNavigate } from 'react-router-dom';
import { Badge } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import { VIDEOS } from '../../../data/media';
import type { Video } from '../../../data/types';
import { usePlayer } from '../../../hooks/PlayerContext';
import { Section } from '../../widgets/Section';
import { VideoCard } from '../../widgets/VideoCard';
import './DirAVideoHomePage.scss';

export function DirAVideoHomePage() {
  const navigate = useNavigate();
  const P = usePlayer();
  const featured = VIDEOS[0];

  const open = (v: Video) => {
    P.playVideo(v);
    navigate(`/dir-a/watch/${v.id}`);
  };

  return (
    <>
      <div
        className="da-featured"
        onClick={() => open(featured)}
        style={{ background: `linear-gradient(110deg, ${featured.color} 0%, ${featured.color2} 100%)` }}
      >
        <div className="da-featured__scrim" />
        <div className="da-featured__eyebrow">
          <Badge variant="eyebrow">Featured · {featured.tag}</Badge>
        </div>
        <div className="da-featured__info">
          <h3 className="da-featured__title">{featured.title}</h3>
          <div className="da-featured__meta">
            <span className="da-featured__channel">{featured.channel}</span>
            <span>·</span><span>{featured.views} views</span>
            <span>·</span><span>{featured.age} ago</span>
          </div>
        </div>
        <div className="da-featured__play">
          <Icon.play width={22} height={22} />
        </div>
      </div>

      <Section title="Continue watching" action="See all">
        <div className="da-grid da-grid--3">
          {VIDEOS.slice(1, 4).map((v, i) => (
            <VideoCard key={v.id} video={v} idx={i + 1} onClick={() => open(v)} />
          ))}
        </div>
      </Section>

      <Section title="New from channels you follow">
        <div className="da-grid da-grid--4">
          {VIDEOS.slice(2).map((v, i) => (
            <VideoCard key={v.id} video={v} idx={i + 5} compact onClick={() => open(v)} />
          ))}
        </div>
      </Section>
    </>
  );
}
