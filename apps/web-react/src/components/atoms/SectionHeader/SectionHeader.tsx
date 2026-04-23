import './SectionHeader.scss';

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: Props) {
  return (
    <div className="da-section-header">
      <h2 className="da-section-header__title">{title}</h2>
      {action && (
        <button type="button" className="da-section-header__action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
