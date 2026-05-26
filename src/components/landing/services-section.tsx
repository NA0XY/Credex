"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Is this actually free?",
    a: "Yes. No credit card, no trial, no catch.",
  },
  {
    q: "Do you store my spend data?",
    a: "We store audit inputs/results to power reports and future benchmarks. Email is only captured when you choose to share it.",
  },
  {
    q: "How accurate are recommendations?",
    a: "Pricing data is tracked from official vendor pages and audit logic reflects explicit rule-based checks.",
  },
  {
    q: "What is Credex?",
    a: "Credex sources discounted AI infrastructure credits from companies that over-forecast usage.",
  },
  {
    q: "Will I get spammed?",
    a: "No. You only receive audit-related emails unless you explicitly opt into follow-up.",
  },
];

export function ServicesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[var(--color-bg-alt)] px-[clamp(1.2rem,4vw,3.2rem)] py-[clamp(5rem,9vw,8.5rem)]">
      <div className="mx-auto max-w-[1440px]">
        <p className="kicker">FAQ</p>
        <h2 className="cond-display mt-2 text-[clamp(2rem,4.5vw,3.8rem)] text-brand-text">
          Common questions
        </h2>

        <div className="mt-7 rounded-[1.5rem] border border-brand-border bg-brand-surface">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article key={item.q} className={index !== 0 ? "border-t border-brand-border" : ""}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="kicker !text-brand-text">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-brand-textSub transition duration-[240ms] [transition-timing-function:var(--ease-enter)] ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    strokeWidth={1.9}
                  />
                </button>
                <div
                  className="overflow-hidden transition-[max-height,opacity,transform] duration-[320ms] [transition-timing-function:var(--ease-soft)]"
                  style={{
                    maxHeight: isOpen ? "14rem" : "0rem",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-4px)",
                  }}
                >
                  <p className="serif-body px-5 pb-5 text-[clamp(0.9rem,1.5vw,1.1rem)]">{item.a}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
