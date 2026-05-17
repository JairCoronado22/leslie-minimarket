// ============================================
// Componente Badge/Etiqueta de estado
// ============================================

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  size?:    'sm' | 'md';
}

const variants = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger:  'bg-red-100   text-red-800   border-red-200',
  info:    'bg-blue-100  text-blue-800  border-blue-200',
  neutral: 'bg-gray-100  text-gray-700  border-gray-200',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function Badge({
  variant = 'neutral',
  children,
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        rounded-full border font-body
        ${variants[variant]} ${sizes[size]}
      `}
    >
      {children}
    </span>
  );
}