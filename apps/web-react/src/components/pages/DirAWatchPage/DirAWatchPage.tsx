import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../../atoms/Avatar';
import { Icon } from '../../atoms/Icon';
import { PillButton } from '../../atoms/PillButton';
import { VIDEOS } from '../../../data/media';
import type { Video } from '../../../data/types';
import { usePlayer } from '../../../hooks/PlayerContext';
import { UpNextItem } from '../../widgets/UpNextItem';
import { VideoPlayer } from '../../widgets/VideoPlayer';
import './DirAWatchPage.scss';

export function DirAWatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const P = usePlayer();

  const video = VIDEOS.find((v) => v.id === videoId) ?? VIDEOS[0];

  useEffect(() => {
    if (P.nowPlaying.id !== video.id || P.mode !== 'video') {
      P.setMode('video');
      P.setNowPlaying(video);
      P.setProgress(0);
      P.setPlaying(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  const related = VIDEOS.filter((x) => x.id !== video.id).slice(0, 5);

  const openVideo = (v: Video) => {
    P.playVideo(v);
    navigate(`/dir-a/watch/${v.id}`);
  };

  return (
    <div className="da-watch">
      <div className="da-watch__main">
        <button type="button" className="da-watch__back" onClick={() => navigate('/dir-a')}>
          <Icon.chevLeft width={14} height={14} /> Back
        </button>
        <VideoPlayer
          video={video}
          playing={P.playing}
          progress={P.progress}
          onTogglePlay={() => P.setPlaying(!P.playing)}
          onSeek={P.setProgress}
        />
        <div className="da-watch__info">
          <h1 className="da-watch__title">{video.title}</h1>
          <div className="da-watch__channel-row">
            <Avatar size={36} color={video.color} color2={video.color2} />
            <div className="da-watch__channel-info">
              <div className="da-watch__channel">{video.channel}</div>
              <div className="da-watch__meta">{video.views} views · {video.age} ago</div>
            </div>
            <div className="da-watch__actions">
              <PillButton active={!!P.liked[video.id]} onClick={() => P.toggleLike(video.id)}>
                {P.liked[video.id] ? <Icon.heartFull width={13} height={13} /> : <Icon.heart width={13} height={13} />}
                <span>Like</span>
              </PillButton>
              <PillButton><Icon.plus width={13} height={13} /><span>Save</span></PillButton>
              <PillButton><Icon.queue width={13} height={13} /><span>Queue</span></PillButton>
            </div>
          </div>
          <p className="da-watch__desc">
            A short piece shot over three nights. Filmed handheld on a borrowed Sony with only available light. Thanks to everyone who let us in.
          </p>
        </div>
      </div>

      <aside className="da-watch__sidebar">
        <div className="da-watch__sidebar-title">Up next</div>
        {related.map((r, i) => (
          <UpNextItem key={r.id} video={r} idx={i + 10} onClick={() => openVideo(r)} />
        ))}
      </aside>
    </div>
  );
}
