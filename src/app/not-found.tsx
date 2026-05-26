import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="bg-brand-stage relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/editorial/bg-haze-plate.svg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover opacity-45"
        />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/editorial/grain-overlay.svg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover opacity-32 mix-blend-multiply"
        />
      </div>
      <div className="bg-contour bg-vignette pointer-events-none absolute inset-0" />

      <section className="frame-shell relative z-10 mx-auto w-full max-w-2xl px-7 py-10 text-center md:px-10">
        <div className="mx-auto mb-4 w-fit rounded-full border border-brand-border bg-brand-surface2 px-3 py-1">
          <p className="kicker">recovery</p>
        </div>
        <h1 className="cond-display text-[clamp(2rem,4.8vw,3.2rem)] leading-[0.98] text-brand-text">
          This audit link is no longer available.
        </h1>
        <p className="serif-body mx-auto mt-4 max-w-[50ch] text-sm md:text-base">
          The report URL is missing or may have expired. Start a fresh audit to generate a new
          shareable result, or return to the landing page.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/audit"
            className="pill-action pill-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
          >
            Start new audit
          </Link>
          <Link
            href="/"
            className="pill-action pill-action-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
