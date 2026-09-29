"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

// Native select styled to spec §8.3: 1px border, 8px radius, chevron.
export function Select({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
}) {
  const selectId = id ?? props.name;
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={`h-9 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-ink focus:outline-2 focus:outline-zoom-blue disabled:cursor-not-allowed disabled:bg-app disabled:text-muted ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
