"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Globe, Send } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";

function SocialButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
    >
      {children}
    </button>
  );
}

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const isFadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const cancelFadeFrame = () => {
      if (fadeRafRef.current !== null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
    };

    const fadeTo = (targetOpacity: number, durationMs: number) => {
      cancelFadeFrame();

      const currentOpacity = Number.parseFloat(video.style.opacity || getComputedStyle(video).opacity || "0");
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * progress;
        video.style.opacity = `${nextOpacity}`;

        if (progress < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          fadeRafRef.current = null;
        }
      };

      fadeRafRef.current = requestAnimationFrame(tick);
    };

    const handleCanPlay = () => {
      isFadingOutRef.current = false;
      void video.play().catch(() => undefined);
      fadeTo(1, 500);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !isFadingOutRef.current) {
        isFadingOutRef.current = true;
        fadeTo(0, 500);
      }
    };

    const handleEnded = () => {
      isFadingOutRef.current = false;
      cancelFadeFrame();
      video.style.opacity = "0";

      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
        fadeTo(1, 500);
      }, 100);
    };

    video.style.opacity = "0";
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      cancelFadeFrame();
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        src={HERO_VIDEO_URL}
        muted
        autoPlay
        playsInline
        preload="auto"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_32%,rgba(255,255,255,0.14),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/80" />
      <Image
        src="/assets/liquid/hero-caustic.svg"
        alt=""
        aria-hidden="true"
        fill
        className="pointer-events-none object-cover opacity-65"
      />
      <Image
        src="/assets/liquid/noise-film.svg"
        alt=""
        aria-hidden="true"
        fill
        className="pointer-events-none object-cover opacity-35"
      />

      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass mx-auto flex w-full max-w-5xl items-center justify-between rounded-full px-6 py-3">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <Globe size={24} className="text-white" />
              <span className="text-lg font-semibold text-white">Credex</span>
            </div>
            <div className="ml-8 hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
                Features
              </a>
              <a href="#workflow" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
                Workflow
              </a>
              <a href="#about" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
                About
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/results/demo" className="text-sm font-medium text-white">
              Sample report
            </Link>
            <Link href="/audit" className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white">
              Start audit
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-18 pt-12 text-center">
        <h1 className="font-instrument text-[clamp(3.9rem,9vw,8.2rem)] leading-[0.96] tracking-tight text-white lg:whitespace-nowrap">
          Track it then <em className="italic text-white/92">trim</em>
        </h1>

        <form className="mt-10 w-full max-w-xl md:max-w-2xl">
          <label htmlFor="newsletter-email" className="sr-only">
            Enter your email
          </label>
          <div className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2">
            <input
              id="newsletter-email"
              type="email"
              placeholder="Work email for audit updates"
              className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-white p-3 text-black transition-transform hover:scale-105">
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        <p className="mt-8 max-w-3xl px-4 text-sm leading-relaxed text-white/95 md:text-[1.05rem]">
          SpendLens by Credex maps AI seat plans, direct API contracts, and duplicate tooling so teams can capture
          monthly savings without slowing product velocity.
        </p>

        <a
          href="#workflow"
          className="liquid-glass mt-7 rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          See audit methodology
        </a>
      </div>

      <div className="relative z-10 flex justify-center gap-4 pb-14">
        <SocialButton label="Case studies">
          <Camera size={20} />
        </SocialButton>
        <SocialButton label="Ops updates">
          <Send size={20} />
        </SocialButton>
        <SocialButton label="Platform">
          <Globe size={20} />
        </SocialButton>
      </div>
    </section>
  );
}
