"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Link2, Plus } from "lucide-react";

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
      <button
        onClick={copy}
        className="liquid-glass inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface/78 px-3 py-2 text-xs font-medium text-brand-textSub transition hover:border-brand-accent/50 hover:text-brand-accent"
      >
        {status === "Share link copied." ? (
          <>
            <Link2 className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            Share
          </>
        )}
      </button>
      <button
        onClick={() => window.print()}
        className="liquid-glass inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface/78 px-3 py-2 text-xs font-medium text-brand-textSub transition hover:border-brand-accent/50 hover:text-brand-accent"
      >
        <Download className="h-3.5 w-3.5" />
        Save PDF
      </button>
      <Link
        href="/audit"
        className="liquid-glass inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface/78 px-3 py-2 text-xs font-medium text-brand-textSub transition hover:border-brand-accent/50 hover:text-brand-accent"
      >
        <Plus className="h-3.5 w-3.5" />
        New audit
      </Link>
    </div>
  );
}
