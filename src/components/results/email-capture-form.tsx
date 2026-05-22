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
    <div className="email-capture rounded-2xl border border-brand-border bg-brand-surface p-6 sm:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="text-2xl">📬</span>
        <div>
          <h3 className="font-heading text-lg font-semibold text-brand-text">Get this report in your inbox</h3>
          <p className="mt-0.5 text-sm text-brand-textSub">
            Plus alerts when better options launch for your stack. No spam — Credex may reach out if you qualify for significant credit savings.
          </p>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="input-field"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name (optional)"
              className="input-field"
            />
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Your role (optional)"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-accent text-sm font-semibold text-brand-bg transition glow-accent-sm hover:bg-brand-accentDim disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-bg/30 border-t-brand-bg" />
                Sending...
              </>
            ) : "Get my report →"}
          </button>
          {status && !submitted && (
            <p className="text-center text-sm text-brand-danger">{status}</p>
          )}
          <p className="text-center text-[10px] text-brand-muted">
            No spam · Credex may reach out for high-savings accounts · Unsubscribe anytime
          </p>
        </form>
      ) : (
        <div className="py-4 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-3 font-semibold text-brand-text">Report sent!</p>
          <p className="mt-1 text-sm text-brand-textSub">Check your inbox. The full report link is included.</p>
        </div>
      )}
    </div>
  );
}
