import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="bg-brand-stage relative min-h-[100dvh] overflow-hidden px-4 py-6 sm:px-6">
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

      <section className="frame-shell relative z-10 mx-auto mt-16 w-full max-w-[980px] px-6 py-8 md:px-8">
        <div className="mb-4 w-fit rounded-full border border-brand-border bg-brand-surface2 px-3 py-1">
          <p className="kicker">recovery</p>
        </div>
        <h1 className="cond-display max-w-[24ch] text-[clamp(1.9rem,4.2vw,3rem)] leading-[0.98] text-brand-text">
          This audit link is no longer available.
        </h1>
        <p className="serif-body mt-4 max-w-[62ch] text-sm md:text-base">
          The report URL is missing or may have expired. Start a fresh audit to generate a new
          shareable result, or return to the landing page.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
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
