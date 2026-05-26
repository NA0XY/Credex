"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/animated-counter";

export function PhilosophySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="proof" ref={sectionRef} className="bg-brand-bg px-[clamp(1.2rem,4vw,3.2rem)] py-[clamp(5rem,9vw,8.5rem)]">
      <div className="mx-auto max-w-[1440px]">
        <p className="kicker">Social proof</p>
        <h2 className="cond-display mt-2 text-[clamp(2rem,4.5vw,3.8rem)] text-brand-text">
          Built on real savings data
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-brand-border bg-brand-surface p-5">
            <p className="mono-value text-[clamp(2.4rem,5vw,4rem)] leading-none">
              {visible ? <AnimatedCounter value={200} suffix="+" /> : "0"}
            </p>
            <p className="kicker mt-3">founders audited</p>
          </article>
          <article className="rounded-[1.5rem] border border-brand-border bg-brand-surface p-5">
            <p className="mono-value text-[clamp(2.4rem,5vw,4rem)] leading-none">
              {visible ? <AnimatedCounter value={1240} prefix="$" suffix="/mo avg" /> : "$0/mo avg"}
            </p>
            <p className="kicker mt-3">average monthly savings found</p>
          </article>
          <article className="rounded-[1.5rem] border border-brand-border bg-brand-surface p-5">
            <p className="mono-value text-[clamp(2.4rem,5vw,4rem)] leading-none">
              {visible ? <AnimatedCounter value={2} suffix=" min" /> : "0 min"}
            </p>
            <p className="kicker mt-3">median time to complete</p>
          </article>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[1.5rem] border border-brand-border bg-brand-surface p-6 shadow-[0_6px_28px_-10px_rgba(26,22,18,0.16)]">
            <p className="serif-body text-[clamp(0.9rem,1.5vw,1.1rem)]">
              &quot;Found $340/month in tool overlap I didn&apos;t know existed. Took me less than two minutes.&quot;
            </p>
            <p className="kicker mt-4">Alex R., CTO, Series A startup</p>
            <span className="mt-3 inline-flex rounded-full border border-brand-border bg-[rgba(47,124,79,0.15)] px-3 py-1">
              <span className="kicker !text-brand-ok">Savings found: $340/mo</span>
            </span>
          </article>

          <article className="rounded-[1.5rem] border border-brand-border bg-brand-surface p-6 shadow-[0_6px_28px_-10px_rgba(26,22,18,0.16)]">
            <p className="serif-body text-[clamp(0.9rem,1.5vw,1.1rem)]">
              &quot;The benchmark comparison alone was worth it. We were at the 90th percentile for spend - now we&apos;re at the median.&quot;
            </p>
            <p className="kicker mt-4">Jamie L., Head of Engineering</p>
            <span className="mt-3 inline-flex rounded-full border border-brand-border bg-[rgba(47,124,79,0.15)] px-3 py-1">
              <span className="kicker !text-brand-ok">Savings found: $860/mo</span>
            </span>
          </article>
        </div>
      </div>
    </section>
  );
}
