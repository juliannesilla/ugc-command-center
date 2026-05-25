# 06 — A.14m Skill Registry Investigation (M5-REGISTRY-PROBE, Stream 4)

## 🟢 BOTTOM LINE

The `Skill` tool and the `ToolSearch` deferred-tool registry are **two separate systems**. Skills installed at `~/.claude/skills/` and via plugins under `~/.claude/plugins/` are NOT exposed as deferred tools — they are a parallel registry that only the `Skill` tool itself can resolve. ToolSearch returning "No matching deferred tools found" for skill names is expected behavior, not a bug. HR-21 (CITE = INVOKE) cannot be mechanically verified by `tool_call_id` against the deferred-tool registry. **Recommended path: (b) accepted floor with HR-21 revision.** Verification CAN still be mechanical — just via `Skill` tool call records in the agent transcript, not via ToolSearch / deferred-tool IDs.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. Approve the HR-21 revision text in section "Recommended HR-21 Revision" below (or push back).
2. Once approved, ELON appends revised HR-21 to `~/.claude/JULZ-RULES.md` and updates ELON QA checklist item that referenced ToolSearch verification.
3. Add `~/.claude/sessions/catch-ledger.jsonl` entry classifying this as a permanent class (HR-28 back-propagation): "skill-registry-decoupled-from-tool-registry".

---

## Probes Run (Exact Results)

| # | Probe | Tool Call | Result |
|---|-------|-----------|--------|
| 1 | `ToolSearch select:refactoring-ui:refactoring-ui` | ToolSearch | `No matching deferred tools found` |
| 2 | `ToolSearch refactoring-ui` (keyword) | ToolSearch | `No matching deferred tools found` |
| 3 | `ToolSearch select:superpowers:using-superpowers` | ToolSearch | `No matching deferred tools found` |
| 4 | `ToolSearch select:chrome-devtools-mcp:lighthouse-audit` | ToolSearch | `No matching deferred tools found` |
| 5 | `Skill superpowers:using-superpowers` | Skill | SUCCESS — full skill body returned |
| 6 | `Skill superpowers:verification-before-completion` | Skill | SUCCESS — full skill body returned |
| 7 | `Skill refactoring-ui` (local, no plugin namespace) | Skill | SUCCESS — full skill body returned from `~/.claude/skills/refactoring-ui/SKILL.md` |

**Pattern:** ToolSearch and `Skill` operate on independent registries. The session-start `<system-reminder>` lists 600+ skills as "available for use with the Skill tool" — these are pre-registered with the `Skill` tool's own resolver, NOT injected into the deferred-tool registry that ToolSearch queries.

## Sources Read

- `~/.claude/plugins/installed_plugins.json` (552 lines) — Confirms 56+ plugins installed. Each plugin entry is metadata only (installPath, version, gitCommitSha). No `skills[]` array, no `tools[]` array. Skills are discovered by the runtime at session-start by scanning the install paths, NOT registered as callable tools.
- `~/.claude/skills/elon/SKILL.md` (frontmatter lines 1-50) — Standard YAML frontmatter (name, description, metadata). No tool-registry hook. The skill name `elon` is what `Skill` resolves against — not a tool name.
- Session-start `<system-reminder>` — Lists ~600 skills under "available for use with the Skill tool" header. Separately lists deferred tools (`EnterWorktree`, MCP tools, etc.) under "available via ToolSearch." The two lists do not overlap.

## Why ToolSearch Returns Empty for Skills

The deferred-tool registry exists to lazy-load MCP server tool schemas (e.g., `mcp__chrome-devtools__click` has a JSONSchema that costs tokens to load up-front). Skills are markdown files with frontmatter, not JSONSchema-described callable tools. They don't HAVE a schema to defer. The `Skill` tool itself accepts `{skill: string, args?: string}` — one universal schema — and dispatches by name internally.

This is a fundamental architecture decision, not a configurable registry. There is no "skill exposure" config in plugin manifests or in `~/.claude/CLAUDE.md` that would make skills appear as deferred tools. An Anthropic-side change to the `Skill` tool definition (registering each skill as a synthetic tool with `tool_call_id` returned) would be required to expose them via ToolSearch.

## Recommendation: PATH (b) — Accepted Floor + HR-21 Revision

Mechanical `tool_call_id` verification against ToolSearch is impossible. But mechanical verification is still possible via a different mechanism: **the `Skill` tool call itself produces a tool_use entry in the agent transcript with the skill name in the input.** ELON can grep agent transcripts for `Skill` tool calls and match against cited skills in the deliverable.

### Recommended HR-21 Revision Text (for JULZ-RULES.md)

```
| 21 | **CITE = INVOKE (skills)** | If a sub-agent prompt names a skill, the agent MUST call the `Skill` tool with that exact name during execution. ELON verifies via the agent's tool-use transcript (grep for `Skill` tool calls; match `skill` input against cited skill names), NOT via ToolSearch deferred-tool registry (skills are not in that registry — architectural, not configurable). For each cited skill, sub-agent return payload MUST include: (a) skill name, (b) timestamp of Skill tool call, (c) one-line summary of how the skill influenced the deliverable. ELON gate FAILS if any cited skill lacks a corresponding `Skill` tool call in the transcript. |
```

### Why this works

- Mechanical: ELON can verify by reading the agent's tool-use history (already captured by the harness).
- No upstream change required.
- Closes the loophole where agents cite skills cosmetically without actually loading them.
- Aligns with HR-15 (verify artifact not proxy) — the artifact is "skill was loaded," the verifiable proxy is "Skill tool call in transcript."

### CAPA back-propagation (HR-28)

Add to `~/.claude/sessions/catch-ledger.jsonl`:

```json
{"id": "skill-registry-decoupled", "phase": "A.14m", "class": "permanent", "summary": "ToolSearch deferred-tool registry and Skill tool registry are separate. ToolSearch will never resolve skill names. HR-21 verification path is Skill-tool-call-in-transcript, not ToolSearch tool_call_id.", "discovered": "2026-05-25", "rule_added": "HR-21 revised"}
```

## Self-QA Checklist

| # | Item | Status |
|---|------|--------|
| 1 | HR-1 paths cited | PASS — all 3 sources cited with absolute paths |
| 2 | HR-10 access honesty | PASS — exact error strings ("No matching deferred tools found") quoted verbatim |
| 3 | HR-21 META: Skill tool invoked | PASS — 3 Skill tool calls in this session (superpowers:using-superpowers, superpowers:verification-before-completion, refactoring-ui) |
| 4 | HR-26 problem ships with solution | PASS — recommendation + revision text included |
| 5 | HR-30 2-block header at top | PASS |
| 6 | Word count under 600 (return payload) | See parent message |
| 7 | Concrete recommendation given | PASS — Path (b) + ready-to-paste HR-21 text |

## Tool Call IDs Attempted

| Skill | Call Type | Result |
|-------|-----------|--------|
| superpowers:using-superpowers | Skill tool | SUCCESS |
| superpowers:verification-before-completion | Skill tool | SUCCESS |
| refactoring-ui | Skill tool | SUCCESS (proves local-skill resolution works) |
| refactoring-ui:refactoring-ui | ToolSearch select: | FAIL — no such deferred tool |
| refactoring-ui | ToolSearch keyword | FAIL — no match in deferred registry |
| superpowers:using-superpowers | ToolSearch select: | FAIL — no match |
| chrome-devtools-mcp:lighthouse-audit | ToolSearch select: | FAIL — no match |

The asymmetry (Skill SUCCESS, ToolSearch FAIL on same name) is the diagnostic proving the two registries are decoupled.
