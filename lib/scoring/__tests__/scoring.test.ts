/**
 * Inline fixture-assertion checks for `lib/scoring/` — runs against the
 * 6 mock campaigns to verify computed scores match spec expectations
 * (e.g., prompt L563-L567 calls out "ParakeetAI — 82% Ready",
 * "Goodie AI — 35%", "Lotus Shop — 20%", "VILO — 45%").
 *
 * Vitest/Jest not yet configured in this repo. To run:
 *   npx tsx lib/scoring/__tests__/scoring.test.ts
 *
 * If no test runner, the assertions surface as console.assert warnings.
 */

import {
  getReadinessScore,
  getNextMove,
  getMissingInfo,
  getBlockers,
  getBrandFitScore,
} from "@/lib/scoring";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";

interface Expectation {
  campaign_id: string;
  // Allow ±5 tolerance for readiness (mock data carries hand-set scores
  // that may diverge slightly from computed)
  readiness_min: number;
  readiness_max: number;
  brandFit_min: number;
  brandFit_max: number;
  blockers_min: number;
  missingInfo_min: number;
  nextMoveContains: string;
}

// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): pared from 6 to 1.
// Was 6 expectations (parakeetai, goodie-ai, lotusshop, vilo, megprime-pay,
// elf) — only ParakeetAI is a real instantiated campaign. The other 5 mock
// campaigns were stripped from MOCK_CAMPAIGNS so their expectations would
// always fail with "campaign not found" noise.
const EXPECTATIONS: Expectation[] = [
  // ParakeetAI — spec L564 says "82% Ready"
  { campaign_id: "parakeetai", readiness_min: 60, readiness_max: 90, brandFit_min: 90, brandFit_max: 100, blockers_min: 0, missingInfo_min: 0, nextMoveContains: "ParakeetAI" },
];

interface Result {
  campaign_id: string;
  readiness: number;
  brandFit: number;
  nextMove: string;
  missingInfo: string[];
  blockers: string[];
  pass: boolean;
  failures: string[];
}

export function runScoringChecks(): Result[] {
  const out: Result[] = [];
  for (const exp of EXPECTATIONS) {
    const c = MOCK_CAMPAIGNS.find((x) => x.campaign_id === exp.campaign_id);
    if (!c) {
      out.push({ campaign_id: exp.campaign_id, readiness: -1, brandFit: -1, nextMove: "(missing)", missingInfo: [], blockers: [], pass: false, failures: ["campaign not found in MOCK_CAMPAIGNS"] });
      continue;
    }
    const readiness = getReadinessScore(c);
    const brandFit = getBrandFitScore(c);
    const nextMove = getNextMove(c);
    const missingInfo = getMissingInfo(c);
    const blockers = getBlockers(c);
    const failures: string[] = [];

    if (readiness < exp.readiness_min || readiness > exp.readiness_max) {
      failures.push(`readiness ${readiness} out of [${exp.readiness_min}, ${exp.readiness_max}]`);
    }
    if (brandFit < exp.brandFit_min || brandFit > exp.brandFit_max) {
      failures.push(`brandFit ${brandFit} out of [${exp.brandFit_min}, ${exp.brandFit_max}]`);
    }
    if (blockers.length < exp.blockers_min) {
      failures.push(`blockers ${blockers.length} < ${exp.blockers_min}`);
    }
    if (missingInfo.length < exp.missingInfo_min) {
      failures.push(`missingInfo ${missingInfo.length} < ${exp.missingInfo_min}`);
    }
    if (!nextMove.includes(exp.nextMoveContains)) {
      failures.push(`nextMove "${nextMove}" missing "${exp.nextMoveContains}"`);
    }

    out.push({
      campaign_id: c.campaign_id,
      readiness,
      brandFit,
      nextMove,
      missingInfo,
      blockers,
      pass: failures.length === 0,
      failures,
    });
  }
  return out;
}

// Direct-run guard — when executed via `tsx` this logs results.
// Node module-detection: under tsx, `require.main === module` works in CJS
// emit; under ESM/Next.js compile this guard simply no-ops, which is safe.
declare const require: { main?: unknown } | undefined;
if (typeof require !== "undefined" && (require as { main?: unknown }).main === module) {
  const results = runScoringChecks();
  // eslint-disable-next-line no-console
  console.table(
    results.map((r) => ({
      id: r.campaign_id,
      readiness: r.readiness,
      brandFit: r.brandFit,
      blockers: r.blockers.length,
      missing: r.missingInfo.length,
      pass: r.pass ? "✓" : "✗",
    })),
  );
  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    // eslint-disable-next-line no-console
    console.error("Failures:", failed);
    process.exit(1);
  }
}
