"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-black px-6 pb-10 pt-32 md:pb-14 md:pt-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0">
        <Image src="/assets/liquid/section-orbit.svg" alt="" aria-hidden="true" fill className="object-cover opacity-55" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-sm uppercase tracking-widest text-white/40"
        >
          About Us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-7 text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Built for <span className="font-instrument italic text-white/60">operators</span> who
          <br className="hidden md:block" />
          <span className="font-instrument italic text-white/60"> need savings clarity before every renewal cycle.</span>
        </motion.h2>
      </div>
    </section>
  );
}
