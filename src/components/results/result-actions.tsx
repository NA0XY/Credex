"use client";

import Link from "next/link";
import { useState } from "react";

interface ResultActionsProps {
  slug: string;
}

export function ResultActions({ slug }: ResultActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const copy = async () => {
    const url = `${window.location.origin}/results/${slug}`;
    await navigator.clipboard.writeText(url);
    setStatus("Share link copied.");
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div className="result-actions-bar flex flex-wrap items-center gap-2">
      {[
        { label: status === "Share link copied." ? "COPIED OK" : "SHARE", onClick: copy },
        { label: "SAVE PDF", onClick: () => window.print() },
      ].map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          className="rounded-full border border-brand-borderStrong bg-brand-surface/55 px-4 py-2 text-brand-textSub transition hover:border-brand-accent/55 hover:text-brand-text"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.08em", fontWeight: 700 }}
        >
          {btn.label}
        </button>
      ))}
      <Link
        href="/audit"
        className="rounded-full border border-brand-borderStrong bg-brand-surface/55 px-4 py-2 text-brand-textSub transition hover:border-brand-accent/55 hover:text-brand-text"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.08em", fontWeight: 700 }}
      >
        + NEW AUDIT
      </Link>
    </div>
  );
}
