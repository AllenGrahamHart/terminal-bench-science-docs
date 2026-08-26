'use client';

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState, type CSSProperties } from 'react';

import {
  chartRowLabel,
  type ChartRowLabel,
} from '@/components/charts/chart-labels';
import {
  ALL_DOMAIN_RADAR_AXES,
  type DomainRadarAxis,
  type DomainId,
  getDomain,
} from '@/lib/domain-context';
import {
  getAccessorValue,
  parseLeaderboardLink,
  type LeaderboardRow,
} from '@/lib/leaderboard';
import { cn } from '@/lib/utils';

export const DOMAIN_AXES = ALL_DOMAIN_RADAR_AXES;
export type DomainScores = Record<string, number>;

export type DomainRadarDatum = {
  id: string;
  label: ChartRowLabel;
  overall: number;
  overallCost: number;
  overallTokens: number;
  scores: DomainScores;
  domainCosts: DomainScores;
  domainTokens: DomainScores;
  color: string;
  strokeDasharray?: string;
};

const RADAR_COLORS = [
  '#038f99',
  '#6d5bd0',
  '#c45825',
  '#2e7d4f',
  '#b04a78',
  '#3c75b5',
  '#8a6b16',
  '#8b4f9e',
] as const;
const SIZE = 520;
const CENTER = SIZE / 2;
const RADIUS = 220;
const MODEL_STROKE_PATTERNS = [
  undefined,
  '10 5',
  '2 4',
  '12 4 2 4',
] as const;

function buildRadarScale(data: DomainRadarDatum[], axes: readonly DomainRadarAxis[]) {
  const highestScore = Math.max(
    10,
    ...data.flatMap((datum) => axes.map((axis) => datum.scores[axis.id] ?? 0)),
  );
  const roughStep = highestScore / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const stepMultiplier =
    normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const step = stepMultiplier * magnitude;
  const maximum = Math.min(100, Math.ceil(highestScore / step) * step);
  const steps = Array.from(
    { length: Math.round(maximum / step) },
    (_, index) => step * (index + 1),
  );

  return { maximum, steps };
}

function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function modelLab(row: LeaderboardRow): string {
  const model = parseLeaderboardLink(
    getAccessorValue(row, 'metadata.model_display'),
  );
  let lab = model?.label ?? row.id;
  if (model?.url) {
    try {
      lab = new URL(model.url).hostname.replace(/^www\./, '');
    } catch {
      lab = model.url;
    }
  }
  return lab;
}

function modelLabColor(lab: string): string {
  if (lab.includes('anthropic.com')) return '#9e997b';
  if (lab.includes('openai.com')) {
    return 'color-mix(in oklch, var(--foreground) 88%, var(--background))';
  }
  if (lab === 'x.ai' || lab.endsWith('.x.ai')) return '#895e4d';
  if (lab.includes('moonshot.ai')) return '#9e4589';
  if (lab === 'z.ai' || lab.endsWith('.z.ai')) return '#909a16';
  return RADAR_COLORS[hashString(lab) % RADAR_COLORS.length]!;
}

function radarScore(
  row: LeaderboardRow,
  axisId: string,
): number {
  const value = getAccessorValue(
    row,
    `metrics.domain_metrics.${axisId}.accuracy`,
  );
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.min(100, Math.max(0, value)) * 10) / 10
    : 0;
}

function numericMetric(
  row: LeaderboardRow,
  accessor: string,
  fallback: number,
): number {
  const value = getAccessorValue(row, accessor);
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function overallScore(row: LeaderboardRow): number {
  const value = numericMetric(row, 'metrics.accuracy', 0);
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

export function buildDomainRadarData(
  rows: LeaderboardRow[],
  axes: readonly DomainRadarAxis[] = DOMAIN_AXES,
): DomainRadarDatum[] {
  const labModelCounts = new Map<string, number>();
  return rows.map((row) => {
    const lab = modelLab(row);
    const modelIndex = labModelCounts.get(lab) ?? 0;
    labModelCounts.set(lab, modelIndex + 1);
    return {
      id: row.id,
      label: chartRowLabel(row),
      overall: overallScore(row),
      overallCost: numericMetric(
        row,
        'metrics.total_cost_usd',
        Number.POSITIVE_INFINITY,
      ),
      overallTokens: numericMetric(
        row,
        'metrics.total_tokens',
        Number.POSITIVE_INFINITY,
      ),
      scores: Object.fromEntries(
        axes.map((axis) => [axis.id, radarScore(row, axis.id)]),
      ) as DomainScores,
      domainCosts: Object.fromEntries(
        axes.map((axis) => [
          axis.id,
          numericMetric(
            row,
            `metrics.domain_metrics.${axis.id}.total_cost_usd`,
            Number.POSITIVE_INFINITY,
          ),
        ]),
      ) as DomainScores,
      domainTokens: Object.fromEntries(
        axes.map((axis) => [
          axis.id,
          numericMetric(
            row,
            `metrics.domain_metrics.${axis.id}.total_tokens`,
            Number.POSITIVE_INFINITY,
          ),
        ]),
      ) as DomainScores,
      color: modelLabColor(lab),
      strokeDasharray:
        MODEL_STROKE_PATTERNS[modelIndex % MODEL_STROKE_PATTERNS.length],
    };
  });
}

type Point = {
  x: number;
  y: number;
};

function pointAt(radius: number, index: number, axisCount: number): Point {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axisCount;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function pointsToString(points: Point[]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

function compareAscending(left: number, right: number): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function gridPoints(
  value: number,
  maximum: number,
  axes: readonly DomainRadarAxis[],
): string {
  return pointsToString(
    axes.map((_, index) =>
      pointAt((RADIUS * value) / maximum, index, axes.length),
    ),
  );
}

function profilePoints(
  scores: DomainScores,
  maximum: number,
  axes: readonly DomainRadarAxis[],
): string {
  return pointsToString(
    axes.map((axis, index) =>
      pointAt((RADIUS * scores[axis.id]!) / maximum, index, axes.length),
    ),
  );
}

function ScoreLabels({
  datum,
  color,
  axes,
  maximum,
}: {
  datum: DomainRadarDatum;
  color: string;
  axes: readonly DomainRadarAxis[];
  maximum: number;
}) {
  return axes.map((axis, index) => {
    const score = datum.scores[axis.id]!;
    const point = pointAt((RADIUS * score) / maximum, index, axes.length);
    const horizontal = point.x - CENTER;
    const vertical = point.y - CENTER;
    const side =
      Math.abs(horizontal) > Math.abs(vertical)
        ? horizontal > 0
          ? 'right'
          : 'left'
        : vertical < 0
          ? 'top'
          : 'bottom';
    return (
      <text
        key={`${datum.id}-${axis.id}`}
        x={point.x + (side === 'right' ? 8 : side === 'left' ? -8 : 0)}
        y={point.y + (side === 'top' ? -8 : side === 'bottom' ? 14 : 4)}
        textAnchor={
          side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle'
        }
        fill={color}
        fontSize={11}
        fontWeight={500}
      >
        {score.toFixed(1)}%
      </text>
    );
  });
}

type DomainRadarChartProps = {
  data: DomainRadarDatum[];
  axes: readonly DomainRadarAxis[];
  className?: string;
  id?: string;
};

export function DomainRadarChart({
  data,
  axes,
  className,
  id,
}: DomainRadarChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<{
    axisId: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const labeledData = data.filter(
    (datum) => selectedIds.includes(datum.id) || datum.id === activeId,
  );
  const scale = buildRadarScale(data, axes);
  const sortedTableData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((left, right) => {
      const delta =
        sort.axisId === 'overall'
          ? left.overall - right.overall
          : (left.scores[sort.axisId] ?? 0) -
            (right.scores[sort.axisId] ?? 0);
      if (delta !== 0) return sort.direction === 'asc' ? delta : -delta;

      const costDelta = compareAscending(
        sort.axisId === 'overall'
          ? left.overallCost
          : (left.domainCosts[sort.axisId] ?? Number.POSITIVE_INFINITY),
        sort.axisId === 'overall'
          ? right.overallCost
          : (right.domainCosts[sort.axisId] ?? Number.POSITIVE_INFINITY),
      );
      if (costDelta !== 0) return costDelta;

      const tokenDelta = compareAscending(
        sort.axisId === 'overall'
          ? left.overallTokens
          : (left.domainTokens[sort.axisId] ?? Number.POSITIVE_INFINITY),
        sort.axisId === 'overall'
          ? right.overallTokens
          : (right.domainTokens[sort.axisId] ?? Number.POSITIVE_INFINITY),
      );
      if (tokenDelta !== 0) return tokenDelta;

      return left.label.full.localeCompare(right.label.full);
    });
  }, [data, sort]);

  function toggleSelection(id: string) {
    setSelectedIds((selected) => {
      if (selected.includes(id)) return selected.filter((value) => value !== id);
      return [...selected, id];
    });
  }

  if (data.length === 0) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground">
        No leaderboard rows match the current filters.
      </p>
    );
  }

  return (
    <div id={id} className={className}>
      <div className="grid min-w-0 lg:grid-cols-[minmax(34rem,1.08fr)_minmax(28rem,0.92fr)]">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  aria-sort={
                    sort?.axisId === 'overall'
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className="h-12 min-w-44 border-r border-b bg-sidebar px-3 text-left text-xs font-medium text-muted-foreground uppercase"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>Model / Agent</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      style={{
                        color:
                          sort?.axisId === 'overall' ? '#038f99' : undefined,
                      }}
                      onClick={() =>
                        setSort((current) =>
                          current?.axisId === 'overall'
                            ? {
                                axisId: 'overall',
                                direction:
                                  current.direction === 'desc' ? 'asc' : 'desc',
                              }
                            : { axisId: 'overall', direction: 'desc' },
                        )
                      }
                    >
                      <span className="text-sm">Overall</span>
                      <HugeiconsIcon
                        icon={
                          sort?.axisId !== 'overall'
                            ? ArrowUpDownIcon
                            : sort.direction === 'asc'
                              ? ArrowUp01Icon
                              : ArrowDown01Icon
                        }
                        strokeWidth={2}
                        className="size-3"
                      />
                    </button>
                  </span>
                </th>
                {axes.map((axis) => (
                  <th
                    key={axis.id}
                    aria-sort={
                      sort?.axisId === axis.id
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className="h-12 min-w-18 border-r border-b px-2 text-center text-[10px] leading-tight font-medium uppercase last:border-r-0"
                    style={
                      {
                        '--domain-header-color': getDomain(
                          axis.id as DomainId,
                        ).color,
                        color:
                          sort?.axisId === axis.id
                            ? getDomain(axis.id as DomainId).color
                            : 'var(--foreground)',
                      } as CSSProperties
                    }
                  >
                    <button
                      type="button"
                      className="flex w-full flex-col items-center justify-center gap-0.5 uppercase hover:text-[var(--domain-header-color)]"
                      onClick={() =>
                        setSort((current) =>
                          current?.axisId === axis.id
                            ? {
                                axisId: axis.id,
                                direction:
                                  current.direction === 'desc' ? 'asc' : 'desc',
                              }
                            : { axisId: axis.id, direction: 'desc' },
                        )
                      }
                    >
                      <span>{axis.label.replace(' Sciences', '')}</span>
                      <span className="text-[8px] tracking-[0.1em]">
                        Sciences
                      </span>
                      <HugeiconsIcon
                        icon={
                          sort?.axisId !== axis.id
                            ? ArrowUpDownIcon
                            : sort.direction === 'asc'
                              ? ArrowUp01Icon
                              : ArrowDown01Icon
                        }
                        strokeWidth={2}
                        className="size-3"
                      />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTableData.map((datum) => {
                const selectedIndex = selectedIds.indexOf(datum.id);
                const selectedColor =
                  selectedIndex >= 0 ? datum.color : undefined;
                const isActive = activeId === datum.id || selectedColor != null;
                return (
                  <tr
                    key={datum.id}
                    className="group"
                    style={{
                      backgroundColor: selectedColor
                        ? `color-mix(in oklch, ${selectedColor} 10%, var(--card))`
                        : undefined,
                    }}
                    onMouseEnter={() => setActiveId(datum.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <th
                      scope="row"
                      className="border-r border-b bg-card px-3 py-2 text-left group-hover:bg-muted"
                      style={{
                        borderLeft: `2px solid ${selectedColor ?? 'transparent'}`,
                      }}
                    >
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-center justify-between gap-3 text-left outline-none"
                        onFocus={() => setActiveId(datum.id)}
                        onBlur={() => setActiveId(null)}
                        onClick={() => toggleSelection(datum.id)}
                      >
                        <span className="min-w-0">
                          <span
                            className="block truncate text-xs font-medium"
                            style={{
                              color: isActive
                                ? selectedColor ?? datum.color
                                : undefined,
                            }}
                          >
                            {datum.label.model}
                          </span>
                          {datum.label.agent ? (
                            <span className="block truncate text-[10px] font-normal text-muted-foreground">
                              {datum.label.agent}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs font-medium tabular-nums">
                          {datum.overall.toFixed(1)}%
                        </span>
                      </button>
                    </th>
                    {axes.map((axis) => {
                      const score = datum.scores[axis.id] ?? 0;
                      return (
                        <td
                          key={axis.id}
                          className="border-r border-b px-2 py-2 text-center text-xs tabular-nums last:border-r-0"
                        >
                          {score.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex min-h-[32rem] min-w-0 flex-col items-center justify-center border-t p-3 lg:border-t-0 lg:border-l">
        <svg
          viewBox="-60 -35 640 590"
          role="img"
          aria-label="Resolution rates across five science domains"
          className="block w-full max-w-[620px]"
        >
          <title>Domain radar chart</title>
        {scale.steps.map((step) => (
          <polygon
            key={step}
            points={gridPoints(step, scale.maximum, axes)}
            fill="none"
            className="stroke-border"
            strokeWidth={step === scale.maximum ? 1.5 : 1}
          />
        ))}
        {axes.map((axis, index) => {
          const end = pointAt(RADIUS, index, axes.length);
          const horizontal = end.x - CENTER;
          const vertical = end.y - CENTER;
          const sideLabel = Math.abs(horizontal) > Math.abs(vertical);
          const label = pointAt(
            RADIUS + (sideLabel ? 58 : vertical < 0 ? 30 : 38),
            index,
            axes.length,
          );
          return (
            <g key={axis.id}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                className="stroke-border"
                strokeWidth={1}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground font-medium uppercase"
                fontSize={13}
              >
                <tspan x={label.x} y={label.y - 6}>
                  {axis.label.split(' ')[0]?.toUpperCase()}
                </tspan>
                <tspan x={label.x} y={label.y + 8}>
                  SCIENCES
                </tspan>
              </text>
            </g>
          );
        })}
        {scale.steps.map((step) => (
          <text
            key={`score-${step}`}
            x={CENTER + 7}
            y={CENTER - (RADIUS * step) / scale.maximum + 4}
            className="fill-muted-foreground"
            fontSize={10}
          >
            {step}
          </text>
        ))}
        {data.map((datum) => {
          const selectedIndex = selectedIds.indexOf(datum.id);
          const selectedColor =
            selectedIndex >= 0
              ? datum.color
              : null;
          const isActive = activeId === datum.id || selectedColor != null;
          const isDimmed =
            (activeId != null || selectedIds.length > 0) && !isActive;
          const points = profilePoints(datum.scores, scale.maximum, axes);
          return (
            <g key={datum.id}>
              <polygon
                data-export-ignore=""
                points={points}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                pointerEvents="stroke"
                className="cursor-pointer outline-none"
                tabIndex={0}
                aria-label={`${datum.label.full}: ${axes.map(
                  (axis) => `${axis.label} ${datum.scores[axis.id]}`,
                ).join(', ')}`}
                onMouseEnter={() => setActiveId(datum.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(datum.id)}
                onBlur={() => setActiveId(null)}
                onClick={() => toggleSelection(datum.id)}
              />
              <polygon
                points={points}
                fill="none"
                stroke={selectedColor ?? (isActive ? datum.color : '#9ca3af')}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={datum.strokeDasharray}
                pointerEvents="none"
                className={cn(
                  'transition-opacity',
                  isDimmed && 'opacity-25',
                )}
              />
            </g>
          );
        })}
        {labeledData.map((datum) => (
          <ScoreLabels
            key={`scores-${datum.id}`}
            datum={datum}
            color={datum.color}
            axes={axes}
            maximum={scale.maximum}
          />
        ))}
      </svg>
          <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 border-t pt-3 text-[10px]">
            {data.map((datum) => {
              const selected = selectedIds.includes(datum.id);
              return (
                <li key={datum.id} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={selected}
                    className="flex min-w-0 items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    style={{ color: selected ? datum.color : undefined }}
                    onMouseEnter={() => setActiveId(datum.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(datum.id)}
                    onBlur={() => setActiveId(null)}
                    onClick={() => toggleSelection(datum.id)}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 6"
                      className="h-1.5 w-5 shrink-0"
                    >
                      <line
                        x1="0"
                        y1="3"
                        x2="24"
                        y2="3"
                        stroke={selected ? datum.color : '#9ca3af'}
                        strokeWidth="2"
                        strokeDasharray={datum.strokeDasharray}
                      />
                    </svg>
                    <span className="truncate">{datum.label.model}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
