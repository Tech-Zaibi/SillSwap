import EscrowIllustration from './EscrowIllustration.jsx';
import { CheckIcon } from './AuthIcons.jsx';

const POINTS = [
  'Swap skills with Skill Tokens, not money',
  'Escrow locks tokens until the work is approved',
  'Everyone can hire and get hired',
];

function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gold font-display text-lg font-bold text-ink">
        S
      </span>
      <span className={`font-display text-xl font-bold ${dark ? 'text-ink' : 'text-white'}`}>
        SkillSwap
      </span>
    </div>
  );
}

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-ink/10 lg:grid-cols-5">
        {/* Brand panel (hidden on phones) */}
        <aside className="relative hidden overflow-hidden bg-linear-to-br from-ink via-[#1d3a5f] to-brand p-10 text-white lg:col-span-2 lg:flex lg:flex-col">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 size-64 rounded-full bg-brand/40 blur-3xl" />

          <div className="relative flex flex-1 flex-col">
            <Logo />
            <h2 className="mt-10 font-display text-3xl font-bold leading-tight text-white">
              Trade skills, not cash.
            </h2>
            <p className="mt-3 text-white/70">
              Do a task, earn tokens, and spend them to hire someone else.
            </p>

            <EscrowIllustration className="my-8 w-full" />

            <ul className="mt-auto list-none space-y-3 pl-0 text-sm text-white/85">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-gold text-ink">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-3">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Logo dark />
            </div>
            <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
            <div className="mt-7">{children}</div>
            {footer && (
              <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}