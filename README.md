# MorphTile Surface Machine

Turns bounded surface intent into candidate MorphTile material facets. The machine keeps structural validity separate from visual quality and converts repeated surface reasoning into deterministic, fail-closed creation rules.

## v0.3 intent integrity

Surface Machine rejects top-level intent fields it does not understand instead of silently dropping them. `base_color` must be an authored finite-number RGB triplet in 0..1; strings, booleans and null are not coerced into numeric meaning. Caller-authored `paint` is still supported, but its small envelope is bounded to `color` and optional numeric `vars`.

Caller paint expressions are preserved as data; Surface Machine does not claim their runtime meaning merely because their envelope is structurally valid. Such candidates carry `CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED`, and exact cross-repository conformance executes the existing raw-paint fixture in MorphTile.

## Facing vocabulary

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

Supported named directions are `up`, `down`, `left`, `right`, `forward`, and `back`. They compile deterministically to MorphTile's existing `nx`, `ny`, and `nz` paint variables. Thresholds must be authored finite numbers in 0..1 and both colors must be authored finite-number RGB triplets in 0..1; numeric-looking non-number values HOLD rather than being coerced.

Raw `paint` remains supported. A request that supplies both `paint` and `surface_rule` is HELD rather than silently choosing an author.

## Boundary answers

1. **What it does:** Turns bounded surface intent into candidate MorphTile material facets, including deterministic named facing rules and fail-closed intent normalization.
2. **What it does not own:** Geometry topology, arbitrary caller-expression semantics, canonical worlds, merge authority, or automatic aesthetic truth.
3. **What it accepts:** `axm.morphtile.surface-request/v0.1` in the provisional v0.1 envelope.
4. **What it produces:** A `morphtile.facet-candidate/v0.4` material candidate.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and clone → plan → commit → receipt → rollback path. MorphTile does not depend on this repository.
6. **Evidence:** Structural and visual evidence are separate; exact runtime conformance covers the named facing rules and the existing caller-paint fixture while visual quality remains `NOT_TESTED`.
7. **When it cannot satisfy a request:** malformed or unsupported creation intent returns explicit `HOLD_SURFACE_*` codes; missing external material capability returns `HOLD_MATERIAL_DEPENDENCY_MISSING`.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: fail-closed surface intent normalization plus the six-direction `facing` rule compiler.
- TESTED: only the claims named by the local and exact cross-repository runtime tests.
- EXPERIMENTAL: envelope v0.1, surface-rule vocabulary v0.1, and every candidate schema in this machine.
- COMPATIBILITY TARGET: exact MorphTile v0.4 snapshot `a579182ae585e5722ac87dd0cc8209963b18d000`.
- NOT IMPLIED: later MorphTile commits are not covered automatically; compatibility is widened only by rerunning deterministic receipts against an exact identity.
- NOT TESTED: rendered appearance or aesthetic quality.
- HELD: no rendered observer or bridge execution in this repository; independent Verification must re-attack the repaired producer head before integration.

This is a bounded deterministic creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
