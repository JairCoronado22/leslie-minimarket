// ============================================
// Header superior
// ============================================

interface HeaderProps {
  title:    string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-display">{title}</h2>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1 font-body">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </div>
  );
}