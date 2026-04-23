import { Icon } from '../../atoms/Icon';
import type { PlayerMode } from '../../../data/types';
import './TabSwitcher.scss';

interface Props {
  tab: PlayerMode;
  onTab: (t: PlayerMode) => void;
}

const TABS: [PlayerMode, string, keyof typeof Icon][] = [
  ['video', 'Video', 'video'],
  ['music', 'Music', 'music'],
];

export function TabSwitcher({ tab, onTab }: Props) {
  return (
    <div className="da-tabs">
      {TABS.map(([k, label, iconKey]) => {
        const I = Icon[iconKey];
        const active = tab === k;
        return (
          <button
            key={k}
            type="button"
            className={`da-tabs__item${active ? ' da-tabs__item--active' : ''}`}
            onClick={() => onTab(k)}
          >
            <I width={14} height={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
