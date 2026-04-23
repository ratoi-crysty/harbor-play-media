import type { InputHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import './SearchInput.scss';

type Props = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput(props: Props) {
  return (
    <div className="da-search">
      <span className="da-search__icon">
        <Icon.search width={14} height={14} />
      </span>
      <input className="da-search__input" {...props} />
    </div>
  );
}
