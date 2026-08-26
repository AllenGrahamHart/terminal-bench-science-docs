import { createParser } from 'nuqs';

export const DOMAIN_IDS = [
  'all',
  'life',
  'physical',
  'earth',
  'mathematical',
  'engineering',
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

export type DomainRadarAxis = {
  id: string;
  label: string;
};

type DomainDefinition = {
  id: DomainId;
  label: string;
  title: string;
  color: string;
};

export const ALL_DOMAIN_RADAR_AXES = [
  { id: 'life', label: 'Life Sciences' },
  { id: 'physical', label: 'Physical Sciences' },
  { id: 'earth', label: 'Earth Sciences' },
  { id: 'mathematical', label: 'Mathematical Sciences' },
  { id: 'engineering', label: 'Engineering Sciences' },
] as const satisfies readonly DomainRadarAxis[];

export const DOMAINS: readonly DomainDefinition[] = [
  { id: 'all', label: 'ALL', title: 'All Domains', color: '#038f99' },
  { id: 'life', label: 'LIFE', title: 'Life Sciences', color: '#3D8A2D' },
  { id: 'physical', label: 'PHYSICAL', title: 'Physical Sciences', color: '#C23637' },
  { id: 'earth', label: 'EARTH', title: 'Earth Sciences', color: '#0168A9' },
  {
    id: 'mathematical',
    label: 'MATHEMATICAL',
    title: 'Mathematical Sciences',
    color: '#C59527',
  },
  {
    id: 'engineering',
    label: 'ENGINEERING',
    title: 'Engineering Sciences',
    color: '#657086',
  },
];

export function getDomain(domain: DomainId): DomainDefinition {
  return DOMAINS.find((entry) => entry.id === domain) ?? DOMAINS[0]!;
}

export function domainExportTitle(domain: DomainId, view: string): string {
  const prefix = 'Terminal-Bench-Science 0.1';
  return domain === 'all'
    ? `${prefix} ${view}`
    : `${prefix} ${getDomain(domain).title} ${view}`;
}

export const parseHomeDomain = createParser({
  parse(value) {
    return (DOMAIN_IDS as readonly string[]).includes(value)
      ? (value as DomainId)
      : null;
  },
  serialize(value) {
    return value;
  },
})
  .withDefault('all' satisfies DomainId)
  .withOptions({ clearOnDefault: true });
