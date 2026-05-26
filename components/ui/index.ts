// Phase A.14n Wave 2a N3-PRIMITIVES — barrel for shared layout-shell primitives.
// Wave 2b agents import via: `import { PageHeader, ContentArea, RightRail } from '@/components/ui'`.
//
// HR-2 PRESERVE: only NEW primitives re-exported. Existing components keep
// their direct-import paths (e.g., `@/components/ui/header`) — this barrel
// does NOT shadow them, callers can use either.
export { PageHeader, type PageHeaderProps } from './PageHeader';
export { ContentArea, type ContentAreaProps } from './ContentArea';
export { RightRail, type RightRailProps } from './RightRail';

// A.14n Wave 2a — N3-PRIMITIVES-HEROKPI
// Content-area hero band + KPI density primitives.
// Wave 2b agents import via: `import { HeroBand, StatStrip } from '@/components/ui'`.
export { HeroBand } from './HeroBand';
export type { HeroBandGradient, HeroBandProps } from './HeroBand';
export { StatStrip } from './StatStrip';
export type { StatTile, StatStripProps } from './StatStrip';

// A.14n Wave 2b — N3-SOW+SCRIPT
// CampaignSelector: shared chip-list primitive for switching between active
// campaigns on /sow-breakdown + /script-production (single-campaign focus
// per N1-V2 gaps #4 + #5). See components/ui/CampaignSelector.tsx.
export { CampaignSelector } from './CampaignSelector';
export type { CampaignSelectorChip, CampaignSelectorProps } from './CampaignSelector';
