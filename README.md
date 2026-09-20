# MorphTile Surface Machine

Turns bounded surface intent into candidate MorphTile material facets. The machine keeps structural validity separate from visual quality and turns repeated surface-orientation reasoning into deterministic paint rules.

## v0.2 facing vocabulary

A caller may provide a bounded `surface_rule` instead of hand-authoring MorphTile paint expressions:

```json
{
  "kind": "facing",
  "direction": "up",
  "threshold": 0.6,
  "match_color": [0.9, 0.55, 0.2],
  "else_color": [0.25, 0.3, 0.4]
}
```

Supported named directions are `up`, `down`, `left`, `right`, `forward`, and `back`. They compile deterministically to MorphTile's existing `nx`, `ny`, and `nz` paint variables. Thresholds are bounded to 0..1 and both colors must be finite RGB triplets in 0..1.

Raw `paint` remains supported. A request that supplies both `paint` and `surface_rule` is HELD rather than silently choosing an author.

## Boundary answers

1. **What it does:** Turns bounded surface intent into candidate MorphTile material facets, including deterministic named facing rules.
2. **What it does not own:** Geometry topology, canonical worlds, merge authority, or automatic aesthetic truth.
3. **What it accepts:** `axm.morphtile.surface-request/v0.1` in the provisional v0.1 envelope.
4. **What it produces:** A `morphtile.facet-candidate/v0.4` material candidate.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and clone → plan → commit → receipt → rollback path. MorphTile does not depend on this repository.
6. **Evidence:** Structural and visual evidence are separate; local tests prove deterministic rule compilation and explicit HOLD behavior while visual evidence remains `NOT_TESTED`.
7. **When it cannot satisfy a request:** Missing external material capability returns `HOLD_MATERIAL_DEPENDENCY_MISSING`; malformed or conflicting surface rules return explicit `HOLD_SURFACE_RULE_*` codes.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: the tiny adapter, local envelope, and six-direction `facing` rule compiler.
- TESTED: the claims named by the local test files, including exact cross-repository runtime conformance when `MORPHTILE_CORE_PATH` is supplied by CI.
- EXPERIMENTAL: envelope v0.1, surface-rule vocabulary v0.1, and every candidate schema in this foundation.
- COMPATIBILITY TARGET: exact MorphTile v0.4 snapshot `4346df01ed18cd1336064f9323d7766ff4f6338a`, current main when this candidate was created.
- NOT IMPLIED: later MorphTile main commits are not covered automatically; compatibility is widened only by rerunning the deterministic receipts against an exact identity.
- NOT TESTED: rendered appearance or aesthetic quality.
- HELD: no rendered observer or bridge execution in this repository.

This is a bounded deterministic creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
