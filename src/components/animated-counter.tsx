"use client";

import { useEffect, useMemo, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  durationMs = 1200,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const startValue = displayValue;

    const frame = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  const formatted = useMemo(
    () => `${prefix}${displayValue.toLocaleString("en-US")}${suffix}`,
    [displayValue, prefix, suffix]
  );

  return <span className={className}>{formatted}</span>;
}

