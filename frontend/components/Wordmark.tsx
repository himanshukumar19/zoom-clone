// Own text wordmark. Not copied from Zoom (plan D17, rule 5).
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-label="zoom-clone"
      className={`font-black lowercase tracking-tight text-zoom-blue ${
        compact ? "text-xl" : "text-3xl"
      }`}
    >
      zoom<span className="text-ink">-clone</span>
    </span>
  );
}
