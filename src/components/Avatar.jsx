// Shows the profile photo. If there is none, shows the person's initials.
export default function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (user.avatar) return <img src={user.avatar} alt="" className="avatar" style={style} />;
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return <span className="avatar" style={style} aria-hidden="true">{initials}</span>;
}