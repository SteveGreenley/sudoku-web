/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Explicitly safelist the per-value palette colors (ticket 05) so Tailwind
  // generates them even though they live inside a constant array.
  safelist: [
    // Dark variants (selected cell)
    'bg-rose-300', 'bg-orange-300', 'bg-amber-300', 'bg-yellow-300',
    'bg-lime-300', 'bg-emerald-300', 'bg-teal-300', 'bg-cyan-300', 'bg-violet-300',
    // Light variants (other instances)
    'bg-rose-100', 'bg-orange-100', 'bg-amber-100', 'bg-yellow-100',
    'bg-lime-100', 'bg-emerald-100', 'bg-teal-100', 'bg-cyan-100', 'bg-violet-100',
    // Text variants
    'text-rose-900', 'text-rose-700',
    'text-orange-900', 'text-orange-700',
    'text-amber-900', 'text-amber-700',
    'text-yellow-900', 'text-yellow-800',
    'text-lime-900', 'text-lime-700',
    'text-emerald-900', 'text-emerald-700',
    'text-teal-900', 'text-teal-700',
    'text-cyan-900', 'text-cyan-700',
    'text-violet-900', 'text-violet-700',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
