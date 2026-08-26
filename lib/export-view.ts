export function highResolutionExportScale(element: HTMLElement): number {
  const width = Math.max(element.scrollWidth, element.offsetWidth, 1);
  const height = Math.max(element.scrollHeight, element.offsetHeight, 1);
  const maximumDimension = 16_000;
  const maximumPixels = 100_000_000;

  return Math.max(
    1,
    Math.min(
      3,
      maximumDimension / width,
      maximumDimension / height,
      Math.sqrt(maximumPixels / (width * height)),
    ),
  );
}

export async function waitForExportImages(element: HTMLElement): Promise<void> {
  await Promise.all(
    [...element.querySelectorAll<HTMLImageElement>('img')].map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );
}

export function createExportClone(source: HTMLElement): {
  element: HTMLElement;
  remove: () => void;
} {
  const clone = source.cloneNode(true) as HTMLElement;
  const bounds = source.getBoundingClientRect();
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.inset = '0 auto auto -100000px';
  host.style.pointerEvents = 'none';

  clone.removeAttribute('id');
  clone.style.position = 'static';
  clone.style.inset = 'auto';
  clone.style.width = `${bounds.width}px`;
  clone.style.maxWidth = 'none';
  clone.style.margin = '0';
  clone.style.pointerEvents = 'none';

  const useDarkLogo = document.documentElement.classList.contains('dark');
  for (const logo of clone.querySelectorAll<HTMLElement>('[data-export-logo]')) {
    logo.style.display = 'flex';
    const image = document.createElement('img');
    image.src = useDarkLogo
      ? '/tb-science-logo-dark-bold.png'
      : '/tb-science-logo-light-bold.png';
    image.alt = 'Terminal-Bench-Science';
    image.style.display = 'block';
    image.style.width = 'auto';
    image.style.height = '32px';
    logo.replaceChildren(image);
  }
  for (const meta of clone.querySelectorAll<HTMLElement>('[data-export-meta]')) {
    meta.style.display = 'none';
  }
  for (const subtitle of clone.querySelectorAll<HTMLElement>(
    '[data-export-subtitle]',
  )) {
    subtitle.style.display = 'block';
  }
  for (const domain of clone.querySelectorAll<HTMLElement>(
    '[data-export-domain-accent]',
  )) {
    domain.style.color = domain.dataset.exportDomainAccent ?? '';
  }
  for (const ignored of clone.querySelectorAll('[data-export-ignore]')) {
    ignored.remove();
  }

  host.appendChild(clone);
  document.body.appendChild(host);
  return {
    element: clone,
    remove: () => host.remove(),
  };
}
