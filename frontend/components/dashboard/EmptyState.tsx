import { EmptyStateIllustration } from "./EmptyStateIllustration";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted">
      <EmptyStateIllustration />
      <p className="text-sm font-medium text-muted">{text}</p>
    </div>
  );
}
