'use client';

import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

import { DomainRadarView } from '@/components/charts/domain-radar-view';
import { ParetoView } from '@/components/charts/pareto-view';
import {
  DomainToggle,
  parseHomeView,
  type HomeViewId,
} from '@/components/home-view-toggle';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { MatrixView } from '@/components/matrix-view';
import { TaskActions } from '@/components/task-actions';
import {
  parseHomeDomain,
  type DomainId,
} from '@/lib/domain-context';

function ViewContent({
  view,
  domain,
}: {
  view: HomeViewId;
  domain: DomainId;
}) {
  switch (view) {
    case 'leaderboard':
      return <LeaderboardTable domain={domain} />;
    case 'pareto':
      return <ParetoView domain={domain} />;
    case 'domains':
      return <DomainRadarView domain={domain} />;
    case 'matrix':
      return <MatrixView domain={domain} />;
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

function DomainSelector() {
  return (
    <div className="flex w-full min-w-0 items-center justify-center">
      <DomainToggle className="self-center" />
    </div>
  );
}

export function HomeView() {
  const [view] = useQueryState('view', parseHomeView);
  const [domain, setDomain] = useQueryState('domain', parseHomeDomain);

  useEffect(() => {
    if (view === 'domains' && domain !== 'all') {
      void setDomain('all');
    }
  }, [domain, setDomain, view]);

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6">
      <section className="flex w-full min-w-0 flex-col gap-8">
        <DomainSelector />
        <ViewContent view={view} domain={domain} />
      </section>
      <TaskActions />
    </div>
  );
}
