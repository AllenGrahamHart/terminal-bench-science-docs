import type { ReactNode } from 'react';

export function ViewDescriptionBar({ children }: { children: ReactNode }) {
  return (
    <footer className="flex min-h-12 items-center justify-center border-t px-6 py-3 text-center text-sm text-muted-foreground">
      {children}
    </footer>
  );
}
