import { Avatar } from '../../atoms/Avatar';
import { Icon } from '../../atoms/Icon';
import { IconButton } from '../../atoms/IconButton';
import { Logo } from '../../atoms/Logo';
import { SearchInput } from '../../atoms/SearchInput';
import type { PlayerMode } from '../../../data/types';
import { TabSwitcher } from '../TabSwitcher';
import './TopBar.scss';

interface Props {
  tab: PlayerMode;
  onTab: (t: PlayerMode) => void;
}

export function TopBar({ tab, onTab }: Props) {
  return (
    <div className="da-topbar">
      <Logo />
      <TabSwitcher tab={tab} onTab={onTab} />
      <SearchInput
        placeholder={tab === 'video' ? 'Search videos, channels…' : 'Search tracks, artists, albums…'}
      />
      <div className="da-topbar__right">
        <IconButton aria-label="Library">
          <Icon.lib width={16} height={16} />
        </IconButton>
        <Avatar />
      </div>
    </div>
  );
}
