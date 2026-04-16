import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
    secondary:
      "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
    ghost:
      "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98]",
    danger: "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

