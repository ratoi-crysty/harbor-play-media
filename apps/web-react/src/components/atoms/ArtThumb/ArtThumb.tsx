import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { artBG } from '../../../data/media';
import './ArtThumb.scss';

interface Props {
  color: string;
  color2: string;
  idx?: number;
  shape?: 'square' | 'video' | 'round';
  radius?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function ArtThumb({
  color,
  color2,
  idx = 0,
  shape = 'square',
  radius = 'md',
  className = '',
  style,
  children,
  onClick,
}: Props) {
  const cls = [
    'da-art',
    `da-art--${shape}`,
    `da-art--radius-${radius}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={cls}
      style={{ background: artBG(color, color2, idx), ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
