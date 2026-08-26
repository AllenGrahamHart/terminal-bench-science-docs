'use client';

import { motion } from 'motion/react';

const DIGITS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] as const;

function offsetFor(digit: number) {
  return `${-(9 - digit)}em`;
}

function DigitReel({ from, to }: { from: number; to: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
      <span aria-hidden className="invisible">
        0
      </span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
        initial={{ y: offsetFor(from) }}
        animate={{ y: offsetFor(to) }}
        transition={{
          type: 'spring',
          stiffness: 90,
          damping: 8,
          mass: 1.1,
          delay: 0.08,
        }}
      >
        {DIGITS.map((digit) => (
          <span
            key={digit}
            className="block h-[1em] w-[1ch] text-center leading-[1em]"
          >
            {digit}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function HeroTitle() {
  return (
    <div className="flex max-w-full flex-col items-center gap-3">
      <h1 className="max-w-full px-1 text-pretty text-4xl font-normal tracking-tighter uppercase sm:text-5xl md:text-7xl">
        TERMINAL-BENCH-
        <span>SCIENCE</span>
      </h1>
      <span className="inline-flex h-6 items-center gap-1.5 rounded-sm border bg-card px-2 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Version
        <span className="inline-flex items-baseline leading-none tracking-normal tabular-nums text-foreground">
          0.<DigitReel from={0} to={1} />
        </span>
      </span>
    </div>
  );
}
