"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PHILOSOPHY_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

export function PhilosophySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="overflow-hidden bg-black px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-5xl tracking-tight text-white md:mb-24 md:text-7xl lg:text-8xl"
        >
          Savings <span className="font-instrument italic text-white/40">x</span> Velocity
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="aspect-[4/3] overflow-hidden rounded-3xl"
          >
            <video className="h-full w-full object-cover" src={PHILOSOPHY_VIDEO_URL} muted autoPlay loop playsInline preload="auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex flex-col justify-between"
          >
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">How scores work</p>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                SpendLens evaluates each recommendation with explicit confidence logic: seat overlap certainty, plan
                mismatch severity, and pricing delta reliability. Teams see why each action is ranked before they act.
              </p>
            </div>

            <div className="my-8 h-px w-full bg-white/10" />

            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">Where Credex helps</p>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                After the audit, Credex supports execution with vendor negotiation strategy, right-sizing playbooks,
                and discounted credit pathways for teams with material monthly exposure.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
