export default function NotFound() {
  return (
    <main className="bg-brand-stage mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="liquid-glass rounded-3xl border border-brand-borderStrong bg-brand-surface/72 p-10">
        <h1 className="text-4xl text-brand-text">This audit may have expired</h1>
        <p className="serif-body mt-3 text-sm">
          The report URL is missing or no longer available. Run a fresh audit to generate a new share link.
        </p>
        <a
          href="/audit"
          className="mt-6 inline-block rounded-full border border-brand-accent bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-bg transition hover:bg-brand-accentDim"
        >
          Start a new audit
        </a>
      </div>
    </main>
  );
}
