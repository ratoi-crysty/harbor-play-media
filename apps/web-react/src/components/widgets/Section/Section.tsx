import type { ReactNode } from 'react';
import { SectionHeader } from '../../atoms/SectionHeader';
import './Section.scss';

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function Section({ title, action, onAction, children }: Props) {
  return (
    <section className="da-section">
      <SectionHeader title={title} action={action} onAction={onAction} />
      {children}
    </section>
  );
}
