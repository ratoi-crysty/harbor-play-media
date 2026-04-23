import type { MouseEvent } from 'react';
import { ArtThumb } from '../../atoms/ArtThumb';
import { Icon } from '../../atoms/Icon';
import { mono } from '../../../data/media';
import type { Track } from '../../../data/types';
import { fmtTime } from '../../../utils/time';
import { usePlayer } from '../../../hooks/PlayerContext';
import './MiniBar.scss';

export function MiniBar() {
  const P = usePlayer();
  const isVideo = P.mode === 'video';
  const np = P.nowPlaying;
  const track = np as Track;

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    P.setProgress((e.clientX - r.left) / r.width);
  };

  const toggleLike = (e: MouseEvent) => {
    e.stopPropagation();
    P.toggleLike(np.id);
  };

  return (
    <div className="da-minibar">
      <div
        className="da-minibar__now"
        onClick={() => !isVideo && P.setExpanded(true)}
      >
        <ArtThumb
          color={np.color}
          color2={np.color2}
          idx={0}
          shape="square"
          radius="sm"
          className="da-minibar__art"
        >
          <span className="da-minibar__art-content">
            {isVideo ? <Icon.video width={18} height={18} /> : mono(track.title)}
          </span>
        </ArtThumb>
        <div className="da-minibar__meta">
          <div className="da-minibar__title">{np.title}</div>
          <div className="da-minibar__sub">{isVideo ? (np as { channel: string }).channel : (np as Track).artist}</div>
        </div>
        <button
          type="button"
          className={`da-minibar__like${P.liked[np.id] ? ' da-minibar__like--active' : ''}`}
          onClick={toggleLike}
        >
          {P.liked[np.id] ? <Icon.heartFull width={14} height={14} /> : <Icon.heart width={14} height={14} />}
        </button>
      </div>

      <div className="da-minibar__center">
        <div className="da-minibar__controls">
          <button type="button" className="da-minibar__btn"><Icon.shuffle width={14} height={14} /></button>
          <button type="button" className="da-minibar__btn"><Icon.prev width={16} height={16} /></button>
          <button type="button" className="da-minibar__play" onClick={() => P.setPlaying(!P.playing)}>
            {P.playing ? <Icon.pause width={14} height={14} /> : <Icon.play width={14} height={14} />}
          </button>
          <button type="button" className="da-minibar__btn" onClick={P.next}><Icon.next width={16} height={16} /></button>
          <button type="button" className="da-minibar__btn"><Icon.repeat width={14} height={14} /></button>
        </div>
        <div className="da-minibar__scrub">
          <div className="da-minibar__time">{fmtTime(P.progress * 222)}</div>
          <div className="da-minibar__bar" onClick={handleSeek}>
            <div className="da-minibar__bar-fill" style={{ width: `${P.progress * 100}%` }} />
          </div>
          <div className="da-minibar__time">3:42</div>
        </div>
      </div>

      <div className="da-minibar__right">
        <button type="button" className="da-minibar__btn"><Icon.queue width={14} height={14} /></button>
        <button type="button" className="da-minibar__btn"><Icon.vol width={14} height={14} /></button>
        <div className="da-minibar__vol">
          <div className="da-minibar__vol-fill" style={{ width: `${P.volume * 100}%` }} />
        </div>
        {!isVideo && (
          <button type="button" className="da-minibar__btn" onClick={() => P.setExpanded(true)}>
            <Icon.chevUp width={14} height={14} />
          </button>
        )}
      </div>
    </div>
  );
}
