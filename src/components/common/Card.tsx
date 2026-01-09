import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  actions,
  variant = 'default',
}: CardProps) {
  const variantStyles = {
    default: 'bg-white shadow-sm border border-[#006747]/10',
    elevated: 'bg-white shadow-lg border border-[#006747]/5',
    bordered: 'bg-white border-2 border-[#006747]/20',
  };

  return (
    <div
      className={`rounded-lg overflow-hidden ${variantStyles[variant]} ${className}`}
    >
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-[#006747]/10 flex items-center justify-between bg-gradient-to-r from-white to-[#faf9f6]">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[#004d35] font-['Playfair_Display']">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-[#006747]/70">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
