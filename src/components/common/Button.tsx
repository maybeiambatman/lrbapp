import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center font-serif tracking-wide active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-[#006747] text-white hover:bg-[#004d35] focus:ring-[#006747] shadow-sm hover:shadow-md',
    secondary: 'bg-white text-[#006747] border-2 border-[#006747] hover:bg-[#006747] hover:text-white focus:ring-[#006747]',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600',
    ghost: 'bg-transparent text-[#006747] hover:bg-[#006747]/10 focus:ring-[#006747]',
    gold: 'bg-[#d4af37] text-[#004d35] hover:bg-[#b8960c] focus:ring-[#d4af37] shadow-sm hover:shadow-md font-semibold',
  };

  // Mobile-first sizing with minimum touch target of 44px
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-base min-h-[44px]',
    lg: 'px-7 py-3 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
