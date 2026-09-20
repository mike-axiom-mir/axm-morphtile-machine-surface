# MorphTile Surface Machine

Turns bounded surface intent into candidate MorphTile material facets. The machine keeps structural validity separate from visual quality and converts repeated surface reasoning into deterministic, fail-closed creation rules.

## v0.5 bounded axis gradients

MorphTile already exposes triangle-centre `x`, `y`, and `z` values to material paint expressions, and its public format explicitly treats gradients as data-driven colour behavior. Surface Machine wraps that stable substrate in a bounded named rule instead of requiring callers to hand-author interpolation trees:

```json
{
  "surface_rule": {
    "kind": "axis_gradient",
    "axis": "y",
    "from": -0.5,
    "to": 0.5,
    "start_color": [0.1, 0.2, 0.3],
    "end_color": [0.9, 0.8, 0.7]
  }
}
```

Supported axes are `x`, `y`, and `z`. `from` and `to` must already be finite numbers, `to` must be greater than `from`, and both colors must be authored finite-number RGB triplets in 0..1. Numeric-looking strings, booleans, null, unknown fields, invalid axes, reversed/zero ranges, and malformed colors HOLD instead of being coerced. The generated interpolation clamps below `from` to `start_color`, above `to` to `end_color`, and interpolates only inside the declared range.

This remains creation vocabulary, not a new MorphTile primitive: the emitted matter is ordinary MorphTile `paint` using existing position variables and expression operators.

## v0.4 material pattern vocabulary

MorphTile already has deterministic runtime semantics for two ordinary named material patterns used by its own matter: `checker` and `stripes`. Surface Machine exposes only those proven names through a bounded creation-side object instead of requiring callers to hand-author raw material fields:

```json
{
  "pattern": {
    "kind": "checker",
    "scale": 0.4
  }
}
```

`scale` defaults to `0.5` only when omitted. If it is authored, it must already be a positive finite number; numeric-looking strings, booleans, null, zero and negative values HOLD. Unknown pattern fields and unsupported names also HOLD. Pattern modulation is orthogonal to procedural paint, so a named surface rule may be combined with a named pattern without either silently replacing the other.

The machine intentionally does not expose arbitrary pattern strings. MorphTile currently treats other non-empty runtime pattern names as a deterministic noise branch, but that implementation behavior is not promoted into creation vocabulary without a demonstrated request and an explicit contract.

## Intent integrity

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

## Render evidence boundary

`npm run evidence:render` uses MorphTile's own pinned rasterizer rather than a Surface-private renderer. Two reviewed drift sentinels (`facing-up` and `checker`) retain explicit pixel-baseline authority. Two existing semantics (`axis-gradient` and `stripes`) remain unbaselined deterministic observations.

Render-evidence v0.4 also renders one explicit base-only Surface control. Each observation must preserve `mt_tower` pick coverage and change at least one target RGBA pixel relative to that control before it can emit `effect_delta: PASS`. This closes a narrower technical gap: repeatable pixels prove determinism, while control-relative target-pixel change proves the named treatment had a rendered effect. Neither fact says the look is aesthetically good.

The reviewed baseline remains a drift sentinel, not an aesthetic score. Unbaselined observations and the technical control remain `pixel_baseline: NOT_ESTABLISHED` and `visual_judgement: NOT_REVIEWED`. The evidence registry also fails closed on duplicate case ids or request ids so portable receipts cannot silently become ambiguous as coverage grows. See `docs/RENDER_EVIDENCE.md`.

## Boundary answers

1. **What it does:** Turns bounded surface intent into candidate MorphTile material facets, including deterministic facing rules, bounded `x|y|z` axis gradients, two MorphTile-backed material patterns, fail-closed intent normalization, and a separate deterministic render-evidence harness.
2. **What it does not own:** Geometry topology, arbitrary caller-expression semantics, canonical worlds, merge authority, or automatic aesthetic truth.
3. **What it accepts:** `axm.morphtile.surface-request/v0.1` in the provisional v0.1 envelope.
4. **What it produces:** A `morphtile.facet-candidate/v0.4` material candidate. The evidence harness separately produces PNG + JSON receipts for reviewed fixtures, unbaselined observations, and explicit technical controls.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and clone → plan → commit → receipt → rollback path. MorphTile does not depend on this repository.
6. **Evidence:** Structural/runtime validity, deterministic rendering, control-relative rendered effect, reviewed pixel identity, visual observation, and aesthetic quality remain separate. Exact runtime conformance covers facing rules, axis-gradient execution, the caller-paint fixture, named pattern attenuation, and fixed raster evidence; aesthetic quality is not inferred from those receipts.
7. **When it cannot satisfy a request:** malformed or unsupported creation intent returns explicit `HOLD_SURFACE_*` codes; missing external material capability returns `HOLD_MATERIAL_DEPENDENCY_MISSING`; reviewed pixel drift, ambiguous evidence identities, target-coverage drift, or a pixel-identical named treatment/control pair fail the render-evidence path instead of being silently accepted.

## Run

    npm test

To generate pinned render evidence, provide the exact MorphTile runtime declared in `machine.json` and run:

    npm run evidence:render

Node 18 or later; zero Surface runtime dependencies; no secrets or network required after the two repositories are present locally.

## Truth boundary

- IMPLEMENTED: fail-closed surface intent normalization, six-direction `facing` compiler, bounded `axis_gradient` compiler, bounded `checker|stripes` pattern compiler, and deterministic render-evidence harness with explicit effect controls.
- TESTED: only the claims named by the local and exact cross-repository runtime/render tests.
- EXPERIMENTAL: envelope v0.1, surface-rule vocabulary, material-pattern vocabulary, every candidate schema, and the render-evidence harness in this machine.
- COMPATIBILITY TARGET: exact MorphTile v0.4 snapshot `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- NOT IMPLIED: later MorphTile commits are not covered automatically; compatibility is widened only by rerunning deterministic receipts against an exact identity.
- RENDERED: fixed `facing-up` and `checker` fixtures retain reviewed deterministic pixel receipts; `axis-gradient` and `stripes` remain separate unbaselined deterministic render observations with explicit base-control effect-delta evidence.
- OBSERVED: prior reviewed render artifacts were opened and the target tower was visible in materially distinct `facing-up` and `checker` frames. New candidate evidence remains `NOT_REVIEWED` until actually opened and described.
- NOT ASSESSED: aesthetic quality / `VISUALLY GOOD`.
- HELD: automatic aesthetic acceptance; independent review of any new render-evidence candidate remains separate from producer evidence.

This is a bounded deterministic creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
