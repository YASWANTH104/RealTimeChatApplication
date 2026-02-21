"use client";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/50 bg-white/70 p-6 text-center text-ink-700 shadow-glow">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-ink-500">{description}</p>
    </div>
  );
}
