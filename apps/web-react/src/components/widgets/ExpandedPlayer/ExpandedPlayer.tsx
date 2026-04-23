import { ArtThumb } from '../../atoms/ArtThumb';
import { Icon } from '../../atoms/Icon';
import { IconButton } from '../../atoms/IconButton';
import { ProgressBar } from '../../atoms/ProgressBar';
import { mono } from '../../../data/media';
import type { Track } from '../../../data/types';
import { fmtTime } from '../../../utils/time';
import { usePlayer } from '../../../hooks/PlayerContext';
import { QueueRow } from '../QueueRow';
import './ExpandedPlayer.scss';

export function ExpandedPlayer() {
  const P = usePlayer();
  const t = P.nowPlaying as Track;

  return (
    <div
      className="da-expanded"
      style={{ background: `linear-gradient(135deg, ${t.color2} 0%, var(--da-bg) 70%)` }}
    >
      <div className="da-expanded__head">
        <IconButton variant="overlay" onClick={() => P.setExpanded(false)}>
          <Icon.chevDown width={18} height={18} />
        </IconButton>
        <div className="da-expanded__head-center">
          <div className="da-expanded__eyebrow">Playing from playlist</div>
          <div className="da-expanded__playlist">Late night coding</div>
        </div>
        <IconButton variant="overlay">
          <Icon.more width={18} height={18} />
        </IconButton>
      </div>

      <div className="da-expanded__body">
        <div className="da-expanded__main">
          <ArtThumb
            color={t.color}
            color2={t.color2}
            idx={0}
            shape="square"
            radius="lg"
            className="da-expanded__art"
          >
            <span className="da-expanded__art-text">{mono(t.title)}</span>
          </ArtThumb>
          <div className="da-expanded__title-wrap">
            <h2 className="da-expanded__title">{t.title}</h2>
            <div className="da-expanded__sub">{t.artist} — {t.album}</div>
          </div>
          <div className="da-expanded__progress">
            <ProgressBar progress={P.progress} onSeek={P.setProgress} variant="thick" color="fg" showThumb />
            <div className="da-expanded__time">
              <span>{fmtTime(P.progress * 222)}</span>
              <span>{t.duration}</span>
            </div>
          </div>
          <div className="da-expanded__controls">
            <button type="button" className="da-expanded__btn"><Icon.shuffle width={18} height={18} /></button>
            <button type="button" className="da-expanded__btn"><Icon.prev width={24} height={24} /></button>
            <button type="button" className="da-expanded__play" onClick={() => P.setPlaying(!P.playing)}>
              {P.playing ? <Icon.pause width={22} height={22} /> : <Icon.play width={22} height={22} />}
            </button>
            <button type="button" className="da-expanded__btn" onClick={P.next}><Icon.next width={24} height={24} /></button>
            <button type="button" className="da-expanded__btn"><Icon.repeat width={18} height={18} /></button>
          </div>
        </div>

        <aside className="da-expanded__queue">
          <div className="da-expanded__queue-title">Up next · {P.queue.length}</div>
          <div className="da-expanded__queue-list">
            {P.queue.map((q, i) => (
              <QueueRow
                key={q.id}
                idx={i}
                track={q}
                onMove={P.moveInQueue}
                onRemove={() => P.removeFromQueue(q.id)}
                onPlay={() => {
                  P.setNowPlaying(q);
                  P.removeFromQueue(q.id);
                  P.setPlaying(true);
                }}
                theme="dark"
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
