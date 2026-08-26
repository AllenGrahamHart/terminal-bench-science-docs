import {
  CONTRIBUTOR_GROUPS,
  contributorHref,
  type Contributor,
} from '@/lib/contributors';
import { cn } from '@/lib/utils';

function ContributorCard({ contributor }: { contributor: Contributor }) {
  const href = contributorHref(contributor);

  const className = cn(
    'flex h-14 min-w-0 flex-col justify-center bg-card px-2.5 no-underline outline-none transition-colors',
    href && 'hover:bg-muted/50 focus-visible:bg-muted/50',
  );
  const content = (
    <>
      <span className="truncate text-xs font-medium tracking-tight uppercase sm:text-sm">
        {contributor.name}
      </span>
      {contributor.affiliation ? (
        <span className="truncate text-[10px] font-normal tracking-normal text-muted-foreground">
          {contributor.affiliation}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

function rowPadCount(count: number, columns: number): number {
  const remainder = count % columns;
  return remainder === 0 ? 0 : columns - remainder;
}

function RowPad({
  index,
  pad2,
  pad3,
  pad4,
}: {
  index: number;
  pad2: number;
  pad3: number;
  pad4: number;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'h-14 bg-card',
        index < pad2 ? 'block' : 'hidden',
        index < pad3 ? 'sm:block' : 'sm:hidden',
        index < pad4 ? 'md:block' : 'md:hidden',
      )}
    />
  );
}

export function ContributorsGrid() {
  return (
    <div className="-mx-4 grid w-auto grid-cols-2 gap-px overflow-hidden rounded-none bg-border py-px sm:grid-cols-3 md:mx-0 md:w-full md:grid-cols-4 md:rounded-xl md:p-px">
      {CONTRIBUTOR_GROUPS.map((group) => {
        const count = group.contributors.length;
        const pad2 = rowPadCount(count, 2);
        const pad3 = rowPadCount(count, 3);
        const pad4 = rowPadCount(count, 4);
        const padTotal = Math.max(pad2, pad3, pad4);

        return (
          <div key={group.title} className="contents">
            <div className="col-span-full flex h-10 items-center bg-sidebar px-2.5">
              <h2 className="text-sm font-medium tracking-tight text-muted-foreground uppercase">
                {group.title}
              </h2>
            </div>
            {group.contributors.map((contributor) => (
              <ContributorCard
                key={`${group.title}:${contributor.name}:${contributor.github ?? contributor.href ?? 'none'}`}
                contributor={contributor}
              />
            ))}
            {Array.from({ length: padTotal }, (_, index) => (
              <RowPad
                key={`${group.title}:pad:${index}`}
                index={index}
                pad2={pad2}
                pad3={pad3}
                pad4={pad4}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
