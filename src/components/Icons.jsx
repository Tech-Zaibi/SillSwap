// Icons downloaded from Google (fonts.google.com/icons) and saved in src/assets/icons.
// Use: <Icon name="wallet" />
// They are drawn with a CSS "mask", so they always take the text colour of
// whatever they sit in (white in the navbar, dark on a gold button, and so on).
import dashboard from '../assets/icons/dashboard.svg.svg';
import browse from '../assets/icons/browse.svg.svg';
import tasks from '../assets/icons/tasks.svg.svg';
import wallet from '../assets/icons/wallet.svg.svg';
import bell from '../assets/icons/bell.svg.svg';
import plus from '../assets/icons/plus.svg.svg';
import logout from '../assets/icons/logout.svg.svg';
import admin from '../assets/icons/admin.svg.svg';

const ICONS = { dashboard, browse, tasks, wallet, bell, plus, logout, admin };

export default function Icon({ name, className = '' }) {
  const url = `url("${ICONS[name]}")`;
  return (
    <span
      className={`inline-block flex-none bg-current [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain] ${className || 'h-5 w-5'}`}
      style={{ WebkitMaskImage: url, maskImage: url }}
      aria-hidden="true"
    />
  );
}