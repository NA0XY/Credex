"use client";

import Link from "next/link";
import { useState } from "react";

interface ResultActionsProps {
  slug: string;
}

export function ResultActions({ slug }: ResultActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const copy = async () => {
    try {
      const url = `${window.location.origin}/results/${slug}`;
      await navigator.clipboard.writeText(url);
      setStatus("Share link copied.");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("Unable to copy link.");
      setTimeout(() => setStatus(null), 2000);
    }
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
          className="pill-action pill-action-secondary px-4 py-2"
        >
          {btn.label}
        </button>
      ))}
      <Link
        href="/audit"
        className="pill-action pill-action-secondary px-4 py-2"
      >
        + NEW AUDIT
      </Link>
      {status === "Unable to copy link." && (
        <span className="kicker text-brand-danger">Clipboard blocked</span>
      )}
    </div>
  );
}
