export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="liquid-glass rounded-3xl border border-brand-border bg-brand-surface/72 p-10">
        <h1 className="text-4xl text-brand-text">This audit may have expired</h1>
        <p className="mt-3 text-sm text-brand-textSub">
          The report URL is missing or no longer available. Run a fresh audit to generate a new share link.
        </p>
        <a href="/audit" className="mt-6 inline-block rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-bg">
          Start a new audit
        </a>
      </div>
    </main>
  );
}
