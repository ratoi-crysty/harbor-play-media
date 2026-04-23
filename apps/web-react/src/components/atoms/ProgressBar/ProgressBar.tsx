import type { MouseEvent } from 'react';
import './ProgressBar.scss';

interface Props {
  progress: number;
  onSeek?: (fraction: number) => void;
  variant?: 'thick' | 'thin' | 'mini';
  color?: 'accent' | 'fg';
  showThumb?: boolean;
}

export function ProgressBar({
  progress,
  onSeek,
  variant = 'thick',
  color = 'accent',
  showThumb = false,
}: Props) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const r = e.currentTarget.getBoundingClientRect();
    onSeek((e.clientX - r.left) / r.width);
  };
  const pct = `${Math.min(100, Math.max(0, progress * 100))}%`;
  const cls = [
    'da-progress',
    `da-progress--${variant}`,
    `da-progress--${color}`,
    onSeek ? 'da-progress--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} onClick={handleClick}>
      <div className="da-progress__fill" style={{ width: pct }} />
      {showThumb && <div className="da-progress__thumb" style={{ left: pct }} />}
    </div>
  );
}
