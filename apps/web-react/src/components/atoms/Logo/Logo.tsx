import './Logo.scss';

export function Logo() {
  return (
    <div className="da-logo">
      <div className="da-logo__mark">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 2v8l7-4z" />
        </svg>
      </div>
      <div className="da-logo__text">Parallel</div>
    </div>
  );
}
