"use client";

import { useState } from "react";

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
    <div className="email-capture panel">
      <div className="border-b border-brand-border px-5 py-3">
        <span className="kicker">DELIVER REPORT TO INBOX</span>
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
              className="flex w-full items-center justify-center gap-2 border border-brand-accent bg-brand-accent px-6 py-3 font-black uppercase tracking-wider text-brand-bg transition hover:bg-brand-accentDim disabled:opacity-60 glow-accent-sm"
              style={{ fontFamily: "var(--font-barlow)", fontSize: "0.8125rem", letterSpacing: "0.12em" }}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-bg/30 border-t-brand-bg" />
                  SENDING...
                </>
              ) : (
                "SEND REPORT TO MY INBOX ->"
              )}
            </button>
            {status && !submitted && (
              <p className="text-center text-sm text-brand-danger" style={{ fontFamily: "var(--font-serif)" }}>
                {status}
              </p>
            )}
            <p className="kicker text-center" style={{ fontSize: "0.58rem" }}>
              NO SPAM &middot; CREDEX CONTACT FOR HIGH-SAVINGS ONLY &middot; UNSUBSCRIBE ANYTIME
            </p>
          </form>
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="mono-value text-3xl font-bold">SENT OK</p>
          <p className="mt-2 text-sm text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>
            Check your inbox. The full report link is included.
          </p>
        </div>
      )}
    </div>
  );
}
