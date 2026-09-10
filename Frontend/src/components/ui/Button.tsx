import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-teal-500 text-white hover:bg-teal-400 shadow-sm shadow-teal-500/30',
  secondary: 'bg-navy-950 text-white hover:bg-navy-800',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    extra,
  ].join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  full?: boolean
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  full = false,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonClass(variant, size, `${full ? 'w-full' : ''} ${className}`)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}
