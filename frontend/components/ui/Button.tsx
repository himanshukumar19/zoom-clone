"use client";

import React from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  // Disabled Join button: light grey bg + grey text (spec §8.2).
  primary:
    "bg-zoom-blue text-white hover:bg-zoom-blue-dark disabled:bg-[#E4E7EC] disabled:text-[#98A2B3]",
  secondary:
    "bg-white text-ink border border-line hover:bg-app disabled:text-[#98A2B3] disabled:bg-white",
  danger: "bg-danger text-white hover:brightness-90 disabled:opacity-50",
  ghost: "bg-transparent text-zoom-blue hover:bg-infobg disabled:text-[#98A2B3]",
};

type ButtonProps = React.HTMLAttributes<HTMLElement> & { variant?: Variant; as?: React.ElementType; [key: string]: unknown };
export function Button({
  variant = "primary",
  className = "",
  as: Component = "button",
  ...props
}: ButtonProps) {
  return (
    <Component
      className={`inline-flex h-10 items-center justify-center rounded-lg px-5 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
