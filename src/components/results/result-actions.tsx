"use client";

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
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={copy}
        className="rounded-lg border border-brand-border px-3 py-2 text-sm hover:border-brand-accent"
      >
        Share
      </button>
      <button
        onClick={() => window.print()}
        className="rounded-lg border border-brand-border px-3 py-2 text-sm hover:border-brand-accent"
      >
        Download PDF
      </button>
      {status && <span className="text-xs text-brand-textSub">{status}</span>}
    </div>
  );
}
