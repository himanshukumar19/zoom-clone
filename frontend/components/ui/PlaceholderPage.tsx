import Link from "next/link";

export function PlaceholderPage({ title, backHref }: { title: string; backHref: string }) {
  return (
    <main className="min-h-screen bg-[#EEF1F6] flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-line shadow-sm p-8 text-center">
        <h1 className="text-xl font-extrabold text-ink mb-2">{title}</h1>
        <p className="text-sm text-muted mb-6">This page is a static placeholder.</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-lg bg-zoom-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-zoom-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zoom-blue"
        >
          Back to Meetings
        </Link>
      </div>
    </main>
  );
}
