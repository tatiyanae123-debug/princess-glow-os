'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ARCHITECTURE_CONSTITUTION_STATUS,
  architectureContractViolations,
  architectureDefinitionFor,
  architectureManifestFor,
} from '@/lib/glow/architecture-constitution';

/**
 * Architecture is app-level context, not page-local chrome.
 * This bridge projects the declared architecture into the permanent Global Glow Shell
 * so current and future pages can inherit one location/architecture contract without
 * creating their own navigation or architecture controller.
 */
export function ArchitectureContextBridge() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;
  const manifest = useMemo(() => architectureManifestFor(currentPath), [currentPath]);
  const violations = useMemo(() => architectureContractViolations(currentPath), [currentPath]);
  const definition = manifest ? architectureDefinitionFor(manifest.architecture) : null;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.glowArchitectureDeclared = manifest ? 'true' : 'false';
    root.dataset.glowArchitectureId = manifest?.architecture ?? 'undeclared';
    root.dataset.glowArchitectureManifest = manifest?.id ?? 'unregistered';
    root.dataset.glowConstitutionWorld = manifest?.world ?? 'unknown';
    root.dataset.glowArchitectureConformance = violations.length ? 'required' : 'declared';
    root.dataset.glowArchitectureConstitution = ARCHITECTURE_CONSTITUTION_STATUS.status;

    document.dispatchEvent(new CustomEvent('glow:architecture-context', {
      detail: {
        path: currentPath,
        manifest,
        definition,
        violations,
        constitution: ARCHITECTURE_CONSTITUTION_STATUS,
      },
    }));

    if (violations.length) {
      document.dispatchEvent(new CustomEvent('glow:architecture-regression', {
        detail: { path: currentPath, violations },
      }));
      if (process.env.NODE_ENV !== 'production') console.warn('[Glow OS architecture contract]', currentPath, violations);
    }
  }, [currentPath, definition, manifest, violations]);

  return null;
}
