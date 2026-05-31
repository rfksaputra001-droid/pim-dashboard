const VARIANTS = {
  green: {
    wrap: 'bg-green-50 border-green-100',
    icon: 'bg-green-100 text-green-600',
    label: 'text-green-700',
    value: 'text-green-900',
  },
  orange: {
    wrap: 'bg-orange-50 border-orange-100',
    icon: 'bg-orange-100 text-orange-600',
    label: 'text-orange-700',
    value: 'text-orange-900',
  },
  blue: {
    wrap: 'bg-blue-50 border-blue-100',
    icon: 'bg-blue-100 text-blue-600',
    label: 'text-blue-700',
    value: 'text-blue-900',
  },
};

export default function StatCard({ icon, label, value, color = 'blue' }) {
  const v = VARIANTS[color];
  return (
    <div className={`rounded-2xl border p-5 ${v.wrap}`}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${v.icon}`}>
        {icon}
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${v.label}`}>{label}</p>
      <p className={`text-xl font-bold leading-tight ${v.value}`}>{value}</p>
    </div>
  );
}
