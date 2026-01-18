import { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  icon?: ReactNode
}

export const Button = ({
  children,
  title,
  className = "",
  variant = "primary",
  disabled = false,
  icon,
  onClick,
  ...restProps
}: ButtonProps) => {
  const baseClasses = "relative flex uppercase text-[11px] font-mono"

  const variantClasses = variant === "secondary" ? "text-red-500/50" : "text-neutral-300"

  const disabledClasses = disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      title={title}
      aria-disabled={disabled || undefined}
      {...restProps}
    >
      <span className="flex items-center gap-1.5">
        {icon && <span className="flex-shrink-0 opacity-75">{icon}</span>}
        {children && <span>{children}</span>}
      </span>
    </button>
  );
};
