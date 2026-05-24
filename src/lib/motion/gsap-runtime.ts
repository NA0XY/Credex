import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let initialized = false;

export function getGsap() {
  if (!initialized && typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, CustomEase);
    initialized = true;
  }

  return gsap;
}

export { CustomEase, Flip, ScrollTrigger };
