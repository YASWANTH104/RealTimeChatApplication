"use client";

import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, alt, size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full bg-ink-200 text-sm font-semibold text-ink-700",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span>{alt.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}
