import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "success" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className = "", variant = "primary", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`button button--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});
