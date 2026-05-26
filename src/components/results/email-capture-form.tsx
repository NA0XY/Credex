"use client";

import { useState } from "react";
import { FrameShell, SignalBadge } from "@/components/editorial/primitives";

interface EmailCaptureFormProps {
  auditSlug: string;
}

export function EmailCaptureForm({ auditSlug }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditSlug,
          email,
          companyName: companyName || undefined,
          role: role || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit your email.");
      }

      setStatus("Report sent. Check your inbox.");
      setSubmitted(true);
    } catch {
      setStatus("Unable to submit right now. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FrameShell className="email-capture">
      <div className="border-b border-brand-border px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="kicker">Deliver report to inbox</span>
          <SignalBadge tone="neutral">Optional follow-up</SignalBadge>
        </div>
      </div>

      {!submitted ? (
        <div className="px-5 py-6">
          <p className="serif-body mb-5 text-sm">
            Get this report plus alerts when better options launch for your specific stack. Credex reaches out only for high-savings accounts, and only if you want.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="kicker mb-1.5 block">Work email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@company.com" className="input-field" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="kicker mb-1.5 block">Company name</span>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Optional" className="input-field" />
              </label>
              <label className="block">
                <span className="kicker mb-1.5 block">Role</span>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Optional" className="input-field" />
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pill-action pill-action-primary glow-accent-sm flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-bg/30 border-t-brand-bg" />
                  Sending...
                </>
              ) : (
                "Send report to my inbox"
              )}
            </button>
            {status && !submitted && (
              <p className="text-center text-sm text-brand-danger" style={{ fontFamily: "var(--font-serif)" }}>
                {status}
              </p>
            )}
            <p className="kicker text-center" style={{ fontSize: "0.58rem" }}>
              No spam &middot; Credex contacts only when relevant &middot; unsubscribe anytime
            </p>
          </form>
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="mono-value text-3xl font-bold">Sent</p>
          <p className="mt-2 text-sm text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>
            Check your inbox. The full report link is included.
          </p>
        </div>
      )}
    </FrameShell>
  );
}
