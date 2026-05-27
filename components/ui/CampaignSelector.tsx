// Phase A.14n Wave 2b N3-SOW+SCRIPT — shared CampaignSelector primitive.
//
// Source: N1-V2 gaps #4 ("`/sow-breakdown` renders ALL campaigns expanded
// ~8000px scroll → ADD CAMPAIGN SELECTOR") + #5 ("`/script-production` 2-col
// card grid vs single-campaign 6-card lane → change to single-campaign focus").
//
// HR-4 SMALLEST: chip list + active state, no routing/query-param dance.
// Callers own the useState — this is a pure presentational primitive that
// emits onChange. Lets sow-breakdown and script-production each use it
// without forcing a shared parent.
//
// HR-2 PRESERVE: zero changes to existing card/table components. Selector
// sits ABOVE them and filters which slug renders.
//
// Mockup cites:
//   - #13 (sow-breakdown-elf.png) — single campaign per viewport, not stacked.
//   - #17 (script-production.png) — single campaign focus, 6-card lane.
//   - #21 (sow-breakdown-summer-glow.png) — per-campaign header bar pattern.
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CampaignSelectorChip {
  /** Stable slug used as React key + emitted on selection. */
  slug: string;
  /** Brand name displayed in chip label. */
  brand: string;
  /** Single-character logo mark rendered in the chip avatar. */
  logoMark: string;
  /** Brand accent color (hex) — drives chip avatar background + active ring. */
  accent: string;
}

export interface CampaignSelectorProps {
  chips: CampaignSelectorChip[];
  activeSlug: string;
  onChange: (slug: string) => void;
  /** Optional eyebrow label rendered above the chip row. */
  label?: string;
  className?: string;
}

/**
 * CampaignSelector — horizontal chip row for switching between campaigns.
 *
 * Per HR-4 SMALLEST: pure client component, controlled (caller owns useState).
 * Emil-design-eng: chips use ease-out 200ms transitions on transform + ring,
 * active state lifts subtly (no layout shift). Refactoring-ui: chip spacing
 * follows the 4/8 scale; avatar size is constrained (28px).
 */
export function CampaignSelector({
  chips,
  activeSlug,
  onChange,
  label,
  className,
}: CampaignSelectorProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-700 font-medium mb-2">
          {label}
        </p>
      )}
      <div
        role="tablist"
        aria-label={label ?? 'Select campaign'}
        className="flex flex-wrap items-center gap-2"
      >
        {chips.map((chip) => {
          const isActive = chip.slug === activeSlug;
          return (
            <button
              key={chip.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(chip.slug)}
              className={cn(
                'group/chip inline-flex items-center gap-2 rounded-full pl-1 pr-3.5 py-1 text-[12.5px] font-medium',
                'ring-1 transition-[transform,box-shadow,background-color,color] duration-200 ease-out motion-reduce:transition-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                isActive
                  ? 'bg-white text-ink-900 ring-iris-300 shadow-[0_4px_18px_-6px_rgba(157,107,255,0.35)]'
                  : 'bg-white/70 text-ink-600 ring-cloud-200 hover:bg-white hover:text-ink-900 hover:ring-cloud-300 hover:-translate-y-px',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-white text-[12px] font-display font-semibold shrink-0',
                  'shadow-soft ring-1 ring-white/30',
                )}
                style={{ background: chip.accent }}
              >
                {chip.logoMark}
              </span>
              <span className="truncate max-w-[160px]">{chip.brand}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignSelector;
