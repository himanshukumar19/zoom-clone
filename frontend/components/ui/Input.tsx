"use client";

import type { InputHTMLAttributes } from "react";

// 44px-high input, 8px radius, blue focus ring (spec §8.2).
export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const inputId = id ?? props.name;
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`h-11 w-full rounded-lg border border-line bg-white px-3 text-ink placeholder:text-muted focus:outline-2 focus:outline-zoom-blue focus:ring-4 focus:ring-zoom-blue/15 disabled:cursor-not-allowed disabled:bg-app disabled:text-muted ${className}`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
