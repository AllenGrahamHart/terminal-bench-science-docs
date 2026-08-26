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
import { useMemo, useState } from 'react';

import {
  DomainRadarChart,
  buildDomainRadarData,
  type DomainRadarDatum,
} from '@/components/charts/domain-radar-chart';
import {
  applyLeaderboardFilters,
  buildFilterFacets,
  LeaderboardToolbar,
  type LeaderboardFilters,
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
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
  fetchLeaderboard,
  leaderboardQueryKey,
} from '@/lib/leaderboard';
import {
  fromUrlFilters,
  leaderboardFiltersParser,
  toUrlFilters,
} from '@/lib/leaderboard-url-state';
import {
  ALL_DOMAIN_RADAR_AXES,
  domainExportTitle,
  getDomain,
  type DomainId,
  type DomainRadarAxis,
} from '@/lib/domain-context';
import {
  createExportClone,
  highResolutionExportScale,
  waitForExportImages,
} from '@/lib/export-view';

const DOMAIN_RADAR_IMAGE_ID = 'domain-radar-chart-image';
const SVG_CAPTURE_PROPERTIES = [
  'color',
  'fill',
  'font-family',
  'font-size',
  'font-weight',
  'opacity',
  'stroke',
  'stroke-width',
] as const;

function resolveCaptureColor(value: string, context: CanvasRenderingContext2D): string {
  if (!value || value === 'none' || value === 'currentcolor') return value;
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = 'rgb(1, 2, 3)';
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  if (red === 1 && green === 2 && blue === 3 && alpha === 255) return value;
  return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
}

function inlineDomainRadarSvgStyles(
  chart: HTMLElement,
): { backgroundColor?: string; restore: () => void } {
  const svg = chart.querySelector<SVGSVGElement>('svg[role="img"]');
  if (!svg) return { restore: () => {} };

  const context = document.createElement('canvas').getContext('2d');
  const cardBackground = window.getComputedStyle(chart).backgroundColor;
  const elements = [svg, ...svg.querySelectorAll<SVGElement>('*')];
  const originalStyles = elements.map((element) => ({
    element,
    style: element.getAttribute('style'),
  }));

  for (const element of elements) {
    const styles = window.getComputedStyle(element);
    for (const property of SVG_CAPTURE_PROPERTIES) {
      const value = styles.getPropertyValue(property);
      element.style.setProperty(
        property,
        context && ['color', 'fill', 'stroke'].includes(property)
          ? resolveCaptureColor(value, context)
          : value,
      );
    }
  }

  const isDark = document.documentElement.classList.contains('dark');
  const mutedForeground = isDark ? '#a1a1aa' : '#71717a';
  const gridColor = isDark
    ? 'rgba(255, 255, 255, 0.22)'
    : 'rgba(0, 0, 0, 0.2)';

  for (const element of svg.querySelectorAll<SVGElement>('*')) {
    const className = element.getAttribute('class') ?? '';
    if (className.includes('stroke-border')) {
      element.style.stroke = gridColor;
      element.style.strokeWidth =
        element.getAttribute('stroke-width') ?? '1.25';
    }
    if (className.includes('fill-muted-foreground')) {
      element.style.fill = mutedForeground;
    }
  }

  return {
    backgroundColor: context
      ? resolveCaptureColor(cardBackground ?? '', context)
      : cardBackground,
    restore: () => {
      for (const { element, style } of originalStyles) {
        if (style == null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      }
    },
  };
}

function domainDataToTsv(
  data: DomainRadarDatum[],
  axes: readonly DomainRadarAxis[],
  domain: DomainId,
): string {
  const header = [
    'Model',
    'Agent',
    ...axes.map((axis) => axis.label.toUpperCase()),
  ];
  const rows = data.map((datum) => [
    datum.label.model,
    datum.label.agent,
    ...axes.map((axis) => String(datum.scores[axis.id])),
  ]);

  return [
    [domainExportTitle(domain, 'Domain Radar Data')],
    [],
    header,
    ...rows,
  ]
    .map((line) => line.join('\t'))
    .join('\n');
}

function CopyDomainRadarActions({
  data,
  axes,
  domain,
  accentColor,
}: {
  data: DomainRadarDatum[];
  axes: readonly DomainRadarAxis[];
  domain: DomainId;
  accentColor: string;
}) {
  const [tableCopyState, setTableCopyState] = useState<
    'idle' | 'copied' | 'error'
  >('idle');
  const [imageCopyState, setImageCopyState] = useState<
    'idle' | 'copied' | 'error'
  >('idle');

  async function copyData() {
    try {
      await navigator.clipboard.writeText(domainDataToTsv(data, axes, domain));
      setTableCopyState('copied');
    } catch {
      setTableCopyState('error');
    }
    window.setTimeout(() => setTableCopyState('idle'), 1600);
  }

  async function copyChartImage() {
    const chart = document.getElementById(DOMAIN_RADAR_IMAGE_ID);
    if (
      !chart ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === 'undefined'
    ) {
      setImageCopyState('error');
      window.setTimeout(() => setImageCopyState('idle'), 1600);
      return;
    }

    const { element: exportChart, remove } = createExportClone(chart);
    const { backgroundColor, restore } =
      inlineDomainRadarSvgStyles(exportChart);
    try {
      await waitForExportImages(exportChart);
      const image = await toBlob(exportChart, {
        backgroundColor,
        cacheBust: true,
        pixelRatio: highResolutionExportScale(exportChart),
      });
      if (!image) throw new Error('Could not create domain radar image.');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': image }),
      ]);
      setImageCopyState('copied');
    } catch {
      setImageCopyState('error');
    } finally {
      restore();
      remove();
    }
    window.setTimeout(() => setImageCopyState('idle'), 1600);
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy domain radar data as TSV"
              className="active:!translate-y-0"
              onClick={copyData}
            >
              <HugeiconsIcon
                icon={tableCopyState === 'copied' ? Tick02Icon : Copy01Icon}
                strokeWidth={2}
                className="text-muted-foreground"
                style={
                  tableCopyState === 'copied' ? { color: accentColor } : undefined
                }
              />
            </Button>
          }
        />
        <TooltipContent>
          {tableCopyState === 'copied'
            ? 'Copied as TSV'
            : tableCopyState === 'error'
              ? 'Could not copy TSV'
              : 'Copy domain radar data as TSV'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy domain radar chart as PNG"
              className="active:!translate-y-0"
              onClick={copyChartImage}
            >
              <HugeiconsIcon
                icon={imageCopyState === 'copied' ? Tick02Icon : Image01Icon}
                strokeWidth={2}
                className="text-muted-foreground"
                style={
                  imageCopyState === 'copied' ? { color: accentColor } : undefined
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
              : 'Copy domain radar chart as PNG'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function DomainRadarView({ domain }: { domain: DomainId }) {
  const domainDefinition = getDomain('all');
  const filterAccentColor = getDomain(domain).color;
  const axes = ALL_DOMAIN_RADAR_AXES;
  const { data, error, isPending } = useQuery({
    queryKey: leaderboardQueryKey(
      TERMINAL_BENCH_PACKAGE,
      TERMINAL_BENCH_LEADERBOARD,
    ),
    queryFn: () =>
      fetchLeaderboard(TERMINAL_BENCH_PACKAGE, TERMINAL_BENCH_LEADERBOARD),
  });
  const facets = useMemo(() => {
    if (!data) {
      return { numberBounds: {}, dateBounds: {}, setOptions: {} };
    }
    return buildFilterFacets(data.leaderboard.columns, data.rows);
  }, [data]);
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
      data.rows,
      data.leaderboard.columns,
      filters,
      facets.numberBounds,
    );
  }, [data, facets.numberBounds, filters]);
  const chartData = useMemo(
    () => buildDomainRadarData(filteredRows, axes),
    [axes, filteredRows],
  );

  function handleFiltersChange(next: LeaderboardFilters) {
    void setUrlFilters(toUrlFilters(next, facets.numberBounds));
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
      accentColor={filterAccentColor}
      showColumnControls={false}
    />
  );

  if (isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">{toolbar}</div>
        <div className="-mx-4 rounded-none border border-x-0 px-4 py-10 text-center text-sm text-muted-foreground md:mx-0 md:rounded-xl md:border-x">
          Loading domains…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">{toolbar}</div>
        <div className="-mx-4 rounded-none border border-x-0 border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive md:mx-0 md:rounded-xl md:border-x">
          {error?.message ?? 'Failed to load domain data'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <CopyDomainRadarActions
          data={chartData}
          axes={axes}
          domain="all"
          accentColor={domainDefinition.color}
        />
        {toolbar}
      </div>
      <div
        id={DOMAIN_RADAR_IMAGE_ID}
        className="-mx-4 min-w-0 overflow-hidden rounded-none border border-x-0 bg-card md:mx-0 md:rounded-xl md:border-x"
      >
        <ViewHeader title="Terminal-Bench-Science 0.1 Domain Radar" />
        <DomainRadarChart
          data={chartData}
          axes={axes}
        />
        <ViewDescriptionBar>
          Resolution rates across scientific domains
        </ViewDescriptionBar>
      </div>
    </div>
  );
}
