"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FEATURED_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";

export function FeaturedVideoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="workflow" ref={sectionRef} className="overflow-hidden bg-black px-6 pb-20 pt-6 md:pb-32 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          className="relative aspect-video overflow-hidden rounded-3xl"
        >
          <video className="h-full w-full object-cover" src={FEATURED_VIDEO_URL} muted autoPlay loop playsInline preload="auto" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Image
            src="/assets/liquid/noise-film.svg"
            alt=""
            aria-hidden="true"
            fill
            className="pointer-events-none object-cover opacity-45"
          />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="liquid-glass max-w-md rounded-2xl p-6 md:p-8">
                <p className="mb-3 text-xs uppercase tracking-widest text-white/50">Audit Flow</p>
                <p className="text-sm leading-relaxed text-white md:text-base">
                  We combine vendor pricing data, seat distribution, and API spend signals into one finance-ready
                  report that prioritizes the fastest, highest-confidence savings actions.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/results/demo" className="liquid-glass inline-flex w-fit rounded-full px-8 py-3 text-sm font-medium text-white">
                  Open demo report
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
