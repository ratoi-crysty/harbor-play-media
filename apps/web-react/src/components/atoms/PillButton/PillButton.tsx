import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './PillButton.scss';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'surface' | 'outline' | 'accent';
  children: ReactNode;
}

export function PillButton({ active = false, variant = 'surface', className = '', children, ...rest }: Props) {
  const cls = [
    'da-pill',
    `da-pill--${variant}`,
    active ? 'da-pill--active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
