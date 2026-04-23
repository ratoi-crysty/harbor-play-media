import { useState } from 'react';
import type { DragEvent } from 'react';
import { ArtThumb } from '../../atoms/ArtThumb';
import { Icon } from '../../atoms/Icon';
import { mono } from '../../../data/media';
import type { Track } from '../../../data/types';
import './QueueRow.scss';

interface Props {
  idx: number;
  track: Track;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  onPlay: () => void;
  theme?: 'dark' | 'light';
}

export function QueueRow({ idx, track, onMove, onRemove, onPlay, theme = 'dark' }: Props) {
  const [dragging, setDragging] = useState(false);

  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    setDragging(true);
  };
  const onDragEnd = () => setDragging(false);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(from) && from !== idx) onMove(from, idx);
  };

  const cls = [
    'da-queue-row',
    `da-queue-row--${theme}`,
    dragging ? 'da-queue-row--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="da-queue-row__grip">
        <Icon.grip width={14} height={14} />
      </div>
      <ArtThumb
        color={track.color}
        color2={track.color2}
        idx={idx}
        shape="square"
        radius="sm"
        className="da-queue-row__art"
        onClick={onPlay}
      >
        <span className="da-queue-row__mono">{mono(track.title)}</span>
      </ArtThumb>
      <div className="da-queue-row__body" onClick={onPlay}>
        <div className="da-queue-row__title">{track.title}</div>
        <div className="da-queue-row__artist">{track.artist}</div>
      </div>
      <div className="da-queue-row__duration">{track.duration}</div>
      <button type="button" className="da-queue-row__remove" onClick={onRemove}>
        <Icon.close width={14} height={14} />
      </button>
    </div>
  );
}
