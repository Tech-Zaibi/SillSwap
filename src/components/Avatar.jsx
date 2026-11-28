// Shows the profile photo. If there is none, shows the person's initials.
export default function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  const className = 'inline-grid flex-none place-items-center overflow-hidden rounded-full border-2 border-white/70 bg-[#e6f5f1] font-["Bricolage_Grotesque"] font-bold text-[#0a6b61] object-cover';
  if (user.avatar) return <img src={user.avatar} alt="" className={className} style={style} />;
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return <span className={className} style={style} aria-hidden="true">{initials}</span>;
}