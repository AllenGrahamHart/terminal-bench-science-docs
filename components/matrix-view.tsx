'use client';

import {
  Copy01Icon,
  Image01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { toBlob } from 'html-to-image';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { chartRowLabel } from '@/components/charts/chart-labels';
import {
  applyLeaderboardFilters,
  buildFilterFacets,
  type LeaderboardFilters,
  LeaderboardToolbar,
} from '@/components/leaderboard/leaderboard-toolbar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ViewDescriptionBar } from '@/components/view-description-bar';
import { ViewHeader } from '@/components/view-header';
import {
  fromUrlFilters,
  leaderboardFiltersParser,
  toUrlFilters,
} from '@/lib/leaderboard-url-state';
import {
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
  fetchLeaderboard,
  getAccessorValue,
  leaderboardQueryKey,
  projectLeaderboardRowsToDomain,
  type LeaderboardMatrixTask,
  type LeaderboardRow,
  type LeaderboardTaskMatrix,
  type LeaderboardTaskOutcome,
} from '@/lib/leaderboard';
import {
  domainExportTitle,
  getDomain,
  type DomainId,
} from '@/lib/domain-context';
import {
  createExportClone,
  highResolutionExportScale,
  waitForExportImages,
} from '@/lib/export-view';

const MATRIX_IMAGE_ID = 'task-matrix-image';
const MATRIX_SCROLL_ID = 'task-matrix-scroll';

function contrastColor(color: string): string {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1_000;
  return luminance > 150 ? '#111827' : '#ffffff';
}

function colorStrength(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio <= 1 / 3) return Math.round(ratio * 60);
  if (ratio <= 2 / 3) {
    return Math.round(20 + (ratio - 1 / 3) * 120);
  }
  return Math.round(60 + (ratio - 2 / 3) * 120);
}

function MatrixCell({
  outcome,
  accentColor,
  task,
  rowLabel,
  columnHighlighted,
  anyColumnHighlighted,
}: {
  outcome?: LeaderboardTaskOutcome;
  accentColor: string;
  task: LeaderboardMatrixTask;
  rowLabel: string;
  columnHighlighted: boolean;
  anyColumnHighlighted: boolean;
}) {
  const taskAccentColor = getDomain(task.domain).color;

  if (!outcome) {
    return (
      <td
        title={`${rowLabel} · ${task.slug}: no trials`}
        className="h-11 w-11 min-w-11 max-w-11 border-r border-b bg-muted/35 text-center text-[10px] tabular-nums text-muted-foreground"
      >
        —
      </td>
    );
  }

  const ratio = outcome.total > 0 ? outcome.solved / outcome.total : 0;
  const strength = colorStrength(ratio);
  const backgroundColor =
    ratio === 0
      ? 'var(--card)'
      : `color-mix(in oklch, ${accentColor} ${strength}%, var(--card))`;
  const hoverBackgroundColor = `color-mix(in oklch, ${taskAccentColor} ${Math.max(
    strength,
    20,
  )}%, var(--card))`;
  const showColumnHighlight = columnHighlighted && ratio > 0;
  const muteColumn =
    anyColumnHighlighted && !columnHighlighted && ratio > 0;

  return (
    <td
      title={`${rowLabel} · ${task.slug}: ${outcome.solved}/${outcome.total} trials solved`}
      className="h-11 w-11 min-w-11 max-w-11 border-r border-b bg-[var(--matrix-cell-background)] text-center text-[10px] font-medium tabular-nums transition-colors"
      style={
        {
          '--matrix-cell-background': showColumnHighlight
            ? hoverBackgroundColor
            : backgroundColor,
          color:
            showColumnHighlight && strength >= 50
              ? contrastColor(taskAccentColor)
              : strength >= 50
                ? contrastColor(accentColor)
                : 'var(--foreground)',
          filter: muteColumn ? 'grayscale(1)' : undefined,
          opacity: muteColumn ? 0.4 : 1,
        } as CSSProperties
      }
    >
      {outcome.solved}/{outcome.total}
    </td>
  );
}

function TaskHeader({
  task,
  columnHighlighted,
  onColumnHover,
  onColumnClick,
}: {
  task: LeaderboardMatrixTask;
  columnHighlighted: boolean;
  onColumnHover: (taskId: string | null) => void;
  onColumnClick: (taskId: string) => void;
}) {
  const domain = getDomain(task.domain);
  const label = task.slug.split('/').at(-1) ?? task.slug;
  return (
    <th
      data-matrix-task-select
      scope="col"
      title={`${task.slug} · ${domain.title}`}
      className="group relative h-56 w-11 min-w-11 max-w-11 cursor-pointer overflow-visible border-b p-0 align-bottom"
      style={{ '--task-label-accent': domain.color } as CSSProperties}
      onMouseEnter={() => onColumnHover(task.id)}
      onMouseLeave={() => onColumnHover(null)}
      onClick={() => onColumnClick(task.id)}
    >
      <span
        data-matrix-task-label
        className="absolute bottom-3 left-1/2 z-10 block origin-bottom-left -rotate-[58deg] text-[10px] leading-none font-medium whitespace-nowrap text-foreground uppercase transition-colors"
        style={{
          color: columnHighlighted ? domain.color : undefined,
        }}
      >
        {label}
      </span>
    </th>
  );
}

function escapeTsv(value: string): string {
  return value.replaceAll('\t', ' ').replaceAll('\r', ' ').replaceAll('\n', ' ');
}

function matrixResolutionRate(
  outcomes: Record<string, LeaderboardTaskOutcome>,
  tasks: LeaderboardMatrixTask[],
): number | null {
  const totals = tasks.reduce(
    (result, task) => {
      const outcome = outcomes[task.id];
      if (outcome) {
        result.solved += outcome.solved;
        result.total += outcome.total;
      }
      return result;
    },
    { solved: 0, total: 0 },
  );
  return totals.total > 0 ? (totals.solved / totals.total) * 100 : null;
}

function numericMetric(row: LeaderboardRow, accessor: string): number {
  const value = getAccessorValue(row, accessor);
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : Number.POSITIVE_INFINITY;
}

function compareMetric(
  left: LeaderboardRow,
  right: LeaderboardRow,
  accessor: string,
): number {
  const leftValue = numericMetric(left, accessor);
  const rightValue = numericMetric(right, accessor);
  return leftValue === rightValue ? 0 : leftValue - rightValue;
}

function matrixToTsv(
  rows: LeaderboardRow[],
  tasks: LeaderboardMatrixTask[],
  outcomes: LeaderboardTaskMatrix['rows'],
  domain: DomainId,
): string {
  const header = [
    'Model',
    'Agent',
    'Resolution Rate (%)',
    ...tasks.map((task) => task.slug),
  ];
  const lines = rows.map((row) => {
    const label = chartRowLabel(row);
    const rowOutcomes = outcomes[row.id] ?? {};
    const resolutionRate = matrixResolutionRate(rowOutcomes, tasks);
    return [
      escapeTsv(label.model),
      escapeTsv(label.agent),
      resolutionRate == null ? '' : resolutionRate.toFixed(2),
      ...tasks.map((task) => {
        const outcome = rowOutcomes[task.id];
        return outcome ? `${outcome.solved}/${outcome.total}` : '';
      }),
    ];
  });

  return [
    [domainExportTitle(domain, 'Task Matrix')],
    [],
    header,
    ...lines,
  ]
    .map((line) => line.join('\t'))
    .join('\n');
}

function CopyMatrixActions({
  rows,
  tasks,
  outcomes,
  domain,
  accentColor,
}: {
  rows: LeaderboardRow[];
  tasks: LeaderboardMatrixTask[];
  outcomes: LeaderboardTaskMatrix['rows'];
  domain: DomainId;
  accentColor: string;
}) {
  const [dataCopyState, setDataCopyState] = useState<
    'idle' | 'copied' | 'error'
  >('idle');
  const [imageCopyState, setImageCopyState] = useState<
    'idle' | 'copied' | 'error'
  >('idle');

  async function copyData() {
    try {
      await navigator.clipboard.writeText(
        matrixToTsv(rows, tasks, outcomes, domain),
      );
      setDataCopyState('copied');
    } catch {
      setDataCopyState('error');
    }
    window.setTimeout(() => setDataCopyState('idle'), 1600);
  }

  async function copyImage() {
    const matrix = document.getElementById(MATRIX_IMAGE_ID);
    const scrollRegion = document.getElementById(MATRIX_SCROLL_ID);
    const table = scrollRegion?.querySelector('table');
    if (
      !matrix ||
      !scrollRegion ||
      !table ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === 'undefined'
    ) {
      setImageCopyState('error');
      window.setTimeout(() => setImageCopyState('idle'), 1600);
      return;
    }

    const { element: exportMatrix, remove } = createExportClone(matrix);
    const exportScrollRegion = exportMatrix.querySelector<HTMLElement>(
      `#${MATRIX_SCROLL_ID}`,
    );
    const exportTable = exportScrollRegion?.querySelector('table');

    try {
      if (!exportScrollRegion || !exportTable) {
        throw new Error('Could not prepare matrix image.');
      }
      await waitForExportImages(exportMatrix);
      exportScrollRegion.scrollLeft = 0;
      exportScrollRegion.style.maxHeight = 'none';
      exportScrollRegion.style.overflow = 'visible';
      exportMatrix.style.maxWidth = 'none';
      exportMatrix.style.overflow = 'visible';
      const exportHeader = exportMatrix.querySelector<HTMLElement>('header');
      const exportLogo =
        exportHeader?.querySelector<HTMLElement>('[data-export-logo]');
      const exportTitle = exportHeader?.firstElementChild as HTMLElement | null;
      if (exportHeader && exportLogo) {
        exportHeader.style.position = 'relative';
        exportHeader.style.flexWrap = 'nowrap';
        exportHeader.style.minHeight = '52px';
        exportLogo.style.position = 'absolute';
        exportLogo.style.top = '10px';
        exportLogo.style.right = '16px';
        if (exportTitle) exportTitle.style.paddingRight = '184px';
      }
      for (const element of exportMatrix.querySelectorAll<HTMLElement>(
        '[data-matrix-sticky]',
      )) {
        element.style.position = 'static';
      }

      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );
      const matrixLeft = exportMatrix.getBoundingClientRect().left;
      const contentRight = Math.max(
        exportTable.getBoundingClientRect().right,
        ...[
          ...exportMatrix.querySelectorAll<HTMLElement>(
            '[data-matrix-task-label]',
          ),
        ].map((label) => label.getBoundingClientRect().right),
      );
      exportMatrix.style.width = `${Math.ceil(contentRight - matrixLeft) + 2}px`;

      const backgroundColor =
        window.getComputedStyle(exportMatrix).backgroundColor;
      const image = await toBlob(exportMatrix, {
        backgroundColor,
        cacheBust: true,
        pixelRatio: highResolutionExportScale(exportMatrix),
        width: exportMatrix.scrollWidth,
        height: exportMatrix.scrollHeight,
      });
      if (!image) throw new Error('Could not create matrix image.');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': image }),
      ]);
      setImageCopyState('copied');
    } catch {
      setImageCopyState('error');
    } finally {
      remove();
    }

    window.setTimeout(() => setImageCopyState('idle'), 1600);
  }

  return (
    <div data-matrix-preserve-selection className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy task matrix as TSV"
              className="active:!translate-y-0"
              onClick={copyData}
            >
              <HugeiconsIcon
                icon={dataCopyState === 'copied' ? Tick02Icon : Copy01Icon}
                strokeWidth={2}
                className="text-muted-foreground"
                style={
                  dataCopyState === 'copied'
                    ? { color: accentColor }
                    : undefined
                }
              />
            </Button>
          }
        />
        <TooltipContent>
          {dataCopyState === 'copied'
            ? 'Copied as TSV'
            : dataCopyState === 'error'
              ? 'Could not copy TSV'
              : 'Copy task matrix as TSV'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy task matrix as PNG"
              className="active:!translate-y-0"
              onClick={copyImage}
            >
              <HugeiconsIcon
                icon={imageCopyState === 'copied' ? Tick02Icon : Image01Icon}
                strokeWidth={2}
                className="text-muted-foreground"
                style={
                  imageCopyState === 'copied'
                    ? { color: accentColor }
                    : undefined
                }
              />
            </Button>
          }
        />
        <TooltipContent>
          {imageCopyState === 'copied'
            ? 'Copied as PNG'
            : imageCopyState === 'error'
              ? 'Could not copy PNG'
              : 'Copy full task matrix as PNG'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function MatrixView({ domain }: { domain: DomainId }) {
  const domainDefinition = getDomain(domain);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [pinnedTaskIds, setPinnedTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  useEffect(() => {
    function clearSelectionOutsideTasks(event: PointerEvent) {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest('[data-matrix-task-select]') ||
        target.closest('[data-matrix-preserve-selection]')
      ) {
        return;
      }
      setPinnedTaskIds((current) =>
        current.size > 0 ? new Set<string>() : current,
      );
    }

    document.addEventListener('pointerdown', clearSelectionOutsideTasks);
    return () =>
      document.removeEventListener('pointerdown', clearSelectionOutsideTasks);
  }, []);
  const { data, error, isPending } = useQuery({
    queryKey: leaderboardQueryKey(
      TERMINAL_BENCH_PACKAGE,
      TERMINAL_BENCH_LEADERBOARD,
    ),
    queryFn: () =>
      fetchLeaderboard(TERMINAL_BENCH_PACKAGE, TERMINAL_BENCH_LEADERBOARD),
  });
  const domainRows = useMemo(
    () => (data ? projectLeaderboardRowsToDomain(data.rows, domain) : []),
    [data, domain],
  );
  const facets = useMemo(() => {
    if (!data) {
      return { numberBounds: {}, dateBounds: {}, setOptions: {} };
    }
    return buildFilterFacets(data.leaderboard.columns, domainRows);
  }, [data, domainRows]);
  const [urlFilters, setUrlFilters] = useQueryState(
    'filters',
    leaderboardFiltersParser,
  );
  const filters = useMemo(
    () => fromUrlFilters(urlFilters, facets.numberBounds),
    [facets.numberBounds, urlFilters],
  );
  const filteredRows = useMemo(() => {
    if (!data) return [];
    return applyLeaderboardFilters(
      domainRows,
      data.leaderboard.columns,
      filters,
      facets.numberBounds,
    );
  }, [data, domainRows, facets.numberBounds, filters]);
  const tasks = useMemo(
    () =>
      (data?.task_matrix?.tasks ?? []).filter(
        (task) => domain === 'all' || task.domain === domain,
      ),
    [data, domain],
  );
  const visiblePinnedTaskIds = new Set(
    tasks
      .filter((task) => pinnedTaskIds.has(task.id))
      .map((task) => task.id),
  );
  const anyColumnHighlighted =
    visiblePinnedTaskIds.size > 0 || hoveredTaskId !== null;
  const matrixRows = useMemo(() => {
    const outcomes = data?.task_matrix?.rows ?? {};
    return [...filteredRows].sort((left, right) => {
      const leftRate =
        matrixResolutionRate(outcomes[left.id] ?? {}, tasks) ?? -1;
      const rightRate =
        matrixResolutionRate(outcomes[right.id] ?? {}, tasks) ?? -1;
      const rateDelta = rightRate - leftRate;
      if (rateDelta !== 0) return rateDelta;

      const costDelta = compareMetric(
        left,
        right,
        'metrics.total_cost_usd',
      );
      if (costDelta !== 0) return costDelta;

      const tokenDelta = compareMetric(left, right, 'metrics.total_tokens');
      return tokenDelta || left.id.localeCompare(right.id);
    });
  }, [data, filteredRows, tasks]);

  function handleFiltersChange(next: LeaderboardFilters) {
    void setUrlFilters(toUrlFilters(next, facets.numberBounds));
  }

  function handleColumnHover(taskId: string | null) {
    setHoveredTaskId(taskId);
  }

  function handleColumnClick(taskId: string) {
    setPinnedTaskIds((current) => {
      const next = new Set(current);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  const toolbar = (
    <LeaderboardToolbar
      columns={data?.leaderboard.columns ?? []}
      columnOptions={[]}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      numberBounds={facets.numberBounds}
      dateBounds={facets.dateBounds}
      setOptions={facets.setOptions}
      columnVisibility={{}}
      onColumnVisibilityChange={() => {}}
      accentColor={domainDefinition.color}
      showColumnControls={false}
    />
  );

  if (isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">{toolbar}</div>
        <div className="-mx-4 rounded-none border border-x-0 px-4 py-10 text-center text-sm text-muted-foreground md:mx-0 md:rounded-xl md:border-x">
          Loading task matrix…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">{toolbar}</div>
        <div className="-mx-4 rounded-none border border-x-0 border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive md:mx-0 md:rounded-xl md:border-x">
          {error?.message ?? 'Failed to load task matrix'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <CopyMatrixActions
          rows={matrixRows}
          tasks={tasks}
          outcomes={data.task_matrix?.rows ?? {}}
          domain={domain}
          accentColor={domainDefinition.color}
        />
        {toolbar}
      </div>
      <div
        id={MATRIX_IMAGE_ID}
        className="-mx-4 min-w-0 overflow-hidden rounded-none border border-x-0 bg-card md:mx-0 md:rounded-xl md:border-x"
      >
        <ViewHeader
          title={
            <>
              Terminal-Bench-Science 0.1 Task Matrix
              {domain !== 'all' ? (
                <>
                  {' · '}
                  <span data-export-domain-accent={domainDefinition.color}>
                    {domainDefinition.title}
                  </span>
                </>
              ) : null}
            </>
          }
        />
        {tasks.length === 0 || matrixRows.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">
            No matrix results match the current domain and filters.
          </p>
        ) : (
          <div
            id={MATRIX_SCROLL_ID}
            className="overflow-auto"
          >
            <table
              className="table-fixed border-separate border-spacing-0"
              style={{ width: 288 + tasks.length * 44 + 80 }}
            >
              <thead
                data-matrix-sticky
                className="sticky top-0 z-20 bg-card"
              >
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-30 w-72 min-w-72 max-w-72 border-r border-b bg-sidebar px-4 py-3 text-left align-bottom text-xs font-medium text-muted-foreground uppercase"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>Model / Agent</span>
                      <span>Resolution Rate</span>
                    </span>
                  </th>
                  {tasks.map((task) => (
                    <TaskHeader
                      key={task.id}
                      task={task}
                      columnHighlighted={
                        hoveredTaskId === task.id ||
                        visiblePinnedTaskIds.has(task.id)
                      }
                      onColumnHover={handleColumnHover}
                      onColumnClick={handleColumnClick}
                    />
                  ))}
                  <th
                    aria-hidden="true"
                    className="h-56 w-20 min-w-20 border-b"
                  />
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row) => {
                  const label = chartRowLabel(row);
                  const outcomes = data.task_matrix?.rows[row.id] ?? {};
                  const resolutionRate = matrixResolutionRate(outcomes, tasks);
                  return (
                    <tr key={row.id} className="group">
                      <th
                        data-matrix-sticky
                        scope="row"
                        title={label.full}
                        className="sticky left-0 z-10 w-72 min-w-72 max-w-72 border-r border-b bg-card px-4 py-2 text-left group-hover:bg-muted"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="block max-w-40 truncate text-xs font-medium">
                            {label.model}
                          </span>
                          <span className="shrink-0 text-xs font-medium tabular-nums">
                            {resolutionRate == null
                              ? '—'
                              : `${resolutionRate.toFixed(1)}%`}
                          </span>
                        </span>
                        {label.agent ? (
                          <span className="block max-w-40 truncate text-[10px] font-normal text-muted-foreground">
                            {label.agent}
                          </span>
                        ) : null}
                      </th>
                      {tasks.map((task) => (
                        <MatrixCell
                          key={task.id}
                          outcome={outcomes[task.id]}
                          accentColor={domainDefinition.color}
                          task={task}
                          rowLabel={label.full}
                          columnHighlighted={
                            hoveredTaskId === task.id ||
                            visiblePinnedTaskIds.has(task.id)
                          }
                          anyColumnHighlighted={anyColumnHighlighted}
                        />
                      ))}
                      <td
                        aria-hidden="true"
                        className="w-20 min-w-20 border-b bg-card"
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <ViewDescriptionBar>
          Resolution rates for individual tasks
        </ViewDescriptionBar>
      </div>
    </div>
  );
}
