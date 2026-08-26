import { ArrowUpRight03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';

const MAP_SOURCE =
  'https://github.com/harbor-framework/terminal-bench-science/pull/865';

export function ContributorGeographyMap() {
  return (
    <figure className="not-prose my-10 overflow-hidden rounded-xl border bg-card">
      <div className="flex min-h-12 items-center justify-between gap-4 border-b px-4 py-2.5">
        <span className="font-mono text-sm tracking-tight text-muted-foreground uppercase">
          Contributor Geography
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          89 mapped contributors
        </span>
      </div>
      <Image
        src="/tb-science-contributor-geography.webp"
        alt="World map showing the geographic density of Terminal-Bench-Science contributors by institutional affiliation"
        width={1280}
        height={550}
        className="block h-auto w-full dark:hidden"
      />
      <Image
        src="/tb-science-contributor-geography-dark.webp"
        alt="World map showing the geographic density of Terminal-Bench-Science contributors by institutional affiliation"
        width={1280}
        height={550}
        className="hidden h-auto w-full dark:block"
      />
      <figcaption className="flex flex-col items-start justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
        <span>
          Institutional affiliation density · 72 merged tasks · 28 reviewed
          PRs
        </span>
        <a
          href={MAP_SOURCE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-foreground no-underline hover:text-[#038f99]"
        >
          Methodology
          <HugeiconsIcon icon={ArrowUpRight03Icon} className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}
