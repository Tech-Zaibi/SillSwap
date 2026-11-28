// A button styled with Tailwind. Variants: primary, ghost, danger. Sizes: md, sm.
const VARIANTS = {
  primary: 'bg-[#0e8a7d] text-white hover:bg-[#0a6b61]',
  ghost: 'border border-[#dde2ea] bg-transparent text-[#19233b] hover:bg-[#eef1f6]',
  danger: 'bg-[#c8442b] text-white hover:bg-[#a63620]',
};
const SIZES = {
  md: 'px-4 py-2.5 text-base',
  sm: 'px-3 py-1.5 text-sm',
};

export default function Btn({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}