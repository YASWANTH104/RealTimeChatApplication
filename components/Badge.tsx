"use client";

import { cn } from "@/lib/utils";

export function Badge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  if (value <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-[20px] items-center justify-center rounded-full bg-sunset-500 px-2 py-0.5 text-xs font-semibold text-white",
        className
      )}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}
