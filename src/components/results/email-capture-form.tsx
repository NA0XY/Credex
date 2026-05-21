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
    } catch {
      setStatus("Unable to submit right now. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-3 rounded-xl border border-brand-border bg-brand-surface p-5">
      <h3 className="text-lg font-semibold">Get this report in your inbox</h3>
      <p className="text-sm text-brand-textSub">
        Plus alerts when better options launch. No spam; Credex may reach out for high-savings accounts.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="Company (optional)"
          className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="Role (optional)"
          className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-brand-bg hover:bg-brand-accentDim disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Get my report"}
      </button>

      {status && <p className="text-sm text-brand-textSub">{status}</p>}
    </form>
  );
}

