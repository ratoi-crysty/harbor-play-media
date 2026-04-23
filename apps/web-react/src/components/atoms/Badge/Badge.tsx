import type { ReactNode } from 'react';
import './Badge.scss';

type Variant = 'duration' | 'duration-sm' | 'tag' | 'eyebrow';

interface Props {
  variant?: Variant;
  children: ReactNode;
}

export function Badge({ variant = 'duration', children }: Props) {
  return <span className={`da-badge da-badge--${variant}`}>{children}</span>;
}
