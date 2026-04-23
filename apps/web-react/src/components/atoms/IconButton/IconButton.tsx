import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.scss';

type Variant = 'ghost' | 'solid' | 'overlay';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: number;
  children: ReactNode;
}

export function IconButton({ variant = 'ghost', size, className = '', style, children, ...rest }: Props) {
  const cls = `da-icon-btn da-icon-btn--${variant} ${className}`.trim();
  const sz = size ? { width: size, height: size, ...style } : style;
  return (
    <button type="button" className={cls} style={sz} {...rest}>
      {children}
    </button>
  );
}
