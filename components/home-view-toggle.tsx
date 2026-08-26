'use client';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { createParser, useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { buttonVariants } from '@/components/ui/button';
import {
  DOMAINS,
  DOMAIN_IDS,
  parseHomeDomain,
  type DomainId,
} from '@/lib/domain-context';
import { cn } from '@/lib/utils';

const VIEWS = ['leaderboard', 'pareto', 'matrix', 'domains'] as const;
export type HomeViewId = (typeof VIEWS)[number];

const VIEW_LABELS: Record<HomeViewId, string> = {
  leaderboard: 'LEADERBOARD',
  pareto: 'PARETO',
  domains: 'DOMAIN RADAR',
  matrix: 'MATRIX',
};

export const parseHomeView = createParser({
  parse(value) {
    // Former bar/charts view — resolution bars live on the leaderboard now.
    if (value === 'bar' || value === 'charts') return 'leaderboard' as const;
    if ((VIEWS as readonly string[]).includes(value)) return value as HomeViewId;
    return null;
  },
  serialize(value) {
    return value;
  },
}).withDefault('leaderboard' satisfies HomeViewId);

export function DomainToggle({
  className,
  ...props
}: Omit<ToggleGroupPrimitive.Props, 'value' | 'onValueChange'>) {
  const [domain, setDomain] = useQueryState('domain', parseHomeDomain);

  return (
    <ToggleGroupPrimitive
      value={[domain]}
      onValueChange={(next) => {
        const value = next[0];
        if ((DOMAIN_IDS as readonly string[]).includes(value)) {
          void setDomain(value as DomainId);
        }
      }}
      {...props}
      aria-label="Select science domain"
      className={cn(
        'flex h-auto max-w-full flex-wrap items-center justify-center gap-1',
        className,
      )}
    >
      {DOMAINS.map((item) => {
        const selected = domain === item.id;
        return (
          <TogglePrimitive
            key={item.id}
            value={item.id}
            style={
              selected
                ? {
                    color: item.color,
                  }
                : undefined
            }
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'default' }),
              'relative h-10 rounded-none px-3 text-xs tracking-[0.08em]',
              'text-muted-foreground hover:bg-muted/70 focus-visible:bg-muted/70',
              'data-pressed:font-semibold data-pressed:shadow-none',
            )}
          >
            <span className="flex flex-col items-center leading-none">
              <span>{item.label}</span>
              <span className="mt-1 text-[8px] tracking-[0.12em]">
                {item.id === 'all' ? 'DOMAINS' : 'SCIENCES'}
              </span>
            </span>
          </TogglePrimitive>
        );
      })}
    </ToggleGroupPrimitive>
  );
}

export function HomeViewToggle({ className }: { className?: string }) {
  const [view, setView] = useQueryState('view', parseHomeView);

  const cycleView = useCallback(
    (direction: 1 | -1) => {
      const index = VIEWS.indexOf(view);
      const next =
        VIEWS[(index + direction + VIEWS.length) % VIEWS.length]!;
      void setView(next);
    },
    [setView, view],
  );

  useHotkeys(
    'right,j',
    () => cycleView(1),
    { enableOnFormTags: false, preventDefault: true },
    [cycleView],
  );
  useHotkeys(
    'left,k',
    () => cycleView(-1),
    { enableOnFormTags: false, preventDefault: true },
    [cycleView],
  );

  return (
    <ToggleGroupPrimitive
      value={[view]}
      onValueChange={(next) => {
        const value = next[0];
        if ((VIEWS as readonly string[]).includes(value)) {
          void setView(value as HomeViewId);
        }
      }}
      className={cn(
        'inline-flex h-8 items-center overflow-hidden rounded-lg border border-border',
        className,
      )}
    >
      {VIEWS.map((item) => (
        <TogglePrimitive
          key={item}
          value={item}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'default' }),
            'relative h-8 rounded-none border-0 px-3',
            'not-last:border-r not-last:border-border',
            'text-muted-foreground',
            'data-pressed:bg-muted data-pressed:text-foreground',
            'dark:data-pressed:bg-input',
          )}
        >
          {VIEW_LABELS[item]}
        </TogglePrimitive>
      ))}
    </ToggleGroupPrimitive>
  );
}
