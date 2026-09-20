# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED RENDER EVIDENCE + GRADIENT OBSERVATION INTEGRATED; STRIPES RENDER-OBSERVATION CANDIDATE OPEN
- Local test command: `npm test`
- Render evidence command: `npm run evidence:render`
- Pinned MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Envelope: provisional v0.1
- Visual quality: `NOT_ASSESSED`

## Integrated capability

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Bounded `axis_gradient` rules compile deterministic position-aware paint over MorphTile `x`, `y`, or `z` triangle-centre variables.
- Gradient endpoint clamps are explicit literal branches: at/below `from` returns exact authored `start_color`, at/above `to` returns exact authored `end_color`, and only interior samples interpolate.
- Gradient axes, ranges and endpoint colors fail closed: only `x|y|z`, finite authored numbers with `to > from`, and authored finite-number RGB triplets in 0..1 are accepted.
- Runtime conformance includes a mixed ascending/descending RGB adversarial receipt to catch floating-point endpoint identity and per-channel bound regressions.
- `checker` and `stripes` compile deterministically to MorphTile's existing material `pattern` + positive finite `scale` runtime fields.
- Unknown pattern names/fields and malformed scales fail closed; Surface Machine does not silently map arbitrary names to MorphTile's generic fallback/noise runtime branch.
- Pattern modulation may coexist with raw paint or a named surface rule because the runtime applies pattern shading separately from procedural paint colors.
- Thresholds and RGB colors for named facing rules are bounded and malformed rules HOLD explicitly.
- Authored numeric types are validated before normalization; strings, booleans and null are not coerced into numeric surface meaning.
- Top-level surface intent fails closed on fields the machine would otherwise ignore.
- `base_color` is validated as an authored finite-number RGB triplet in 0..1 before emission.
- Caller `paint` is bounded to `color` plus optional numeric `vars`; malformed or unknown fields HOLD rather than disappearing silently.
- Caller-authored paint expressions remain pass-through data, but Surface Machine does not present shape validation as proof of expression semantics; candidates carry `CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED`.
- Structural, runtime-render, reviewed-pixel, visual-observation and aesthetic evidence remain separate claims.
- The reviewed render-evidence foundation is integrated on main with explicit Surface producer provenance, exact MorphTile runtime identity, reviewed pixel drift sentinels for `facing-up` and `checker`, and `visual_judgement: NOT_REVIEWED`.
- The `axis-gradient` render observation is integrated and independently verified as `TECHNICALLY_RENDERED_UNBASELINED`; it does not hold reviewed-baseline or aesthetic authority.

## Current candidate

PR #12 extends the existing unbaselined render-observation path to the already-supported `stripes` material pattern. It does not add new material vocabulary or change MorphTile runtime semantics.

The exact stripes request is rendered twice through the pinned MorphTile rasterizer and must produce identical render hashes and target-pixel coverage before it can emit `deterministic_replay: PASS`. Its receipt remains `pixel_baseline: NOT_ESTABLISHED`, `TECHNICALLY_RENDERED_UNBASELINED`, and `visual_judgement: NOT_REVIEWED`.

The candidate also makes the render-evidence registry fail closed when two entries reuse the same case id or request id, preventing ambiguous portable receipts as observation coverage grows.

The existing reviewed `facing-up` and `checker` baseline remains a closed exact case set. Neither gradient nor stripes may silently enter reviewed-baseline authority merely because a deterministic PNG exists.

## Reusable rules learned

When exact endpoint identity is part of a deterministic creation contract, endpoint values must be represented as explicit branches rather than reconstructed by floating-point interpolation. Mixed ascending/descending channel tests are required because algebraic equivalence does not imply IEEE identity.

Stable substrate semantics should become bounded creation vocabulary only when they remove repeated hand-authored reasoning without inventing a new runtime contract. Render evidence should use the substrate's real renderer rather than a private approximation.

**Technical render determinism and reviewed pixel authority are different evidence layers.** A new or repaired surface rule may earn deterministic technical rendering before anyone deliberately grants its pixels reviewed-baseline status. Neither layer is an aesthetic score.

**Portable evidence identities must be collision-free.** Once more than one technical observation exists, duplicate case ids or duplicate request ids are ambiguous evidence and must fail closed rather than being resolved by array order or map overwrite.

## Placement decision

The material creation rules and render-evidence harness belong in Surface Machine, not MorphTile core. Current MorphTile already represents position/normal-aware procedural paint, `checker|stripes|noise` material patterns, and supplies the deterministic rasterizer, render receipts, and PNG encoder needed for exact evidence. The current MorphTile main still matches the Surface runtime pin, so this activation found no missing universal material/runtime primitive and no compatibility-widening event to replay.

## Evidence boundary

Independent Verification previously replayed and passed the repaired v0.5.1 gradient endpoint attack on exact Surface head `bf9db61993acb089b7d46b76135b9c4ae93392db` against exact MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`.

The render-evidence provenance repair was independently verified on exact Surface head `941779901406961190e27a6abac9307ab00b89ae`, then integrated by the Creation Director.

Surface PR #11 was independently verified by Verification PR #23 and integrated by the Creation Director. Integrated Surface main is `9d6d83fe9c898b4034d1f74685ca1744c8cd55e9`; its `axis-gradient` evidence remains an unbaselined technical observation rather than reviewed visual authority.

For PR #12, producer CI on the exact candidate head must pass before any TECHNICALLY RENDERED claim is promoted. Independent Verification and Director integration remain separate even after producer CI.

`VISUALLY GOOD` remains `NOT_ASSESSED` regardless of technical CI.

## HELD / open

- Producer CI + independent Verification/Director integration of PR #12.
- `VISUALLY GOOD` / aesthetic acceptance remains `NOT_ASSESSED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No radial/ring/noise vocabulary merely because raw MorphTile paint could express it; add named creation contracts only when a real request earns them.
- No arbitrary/noise pattern vocabulary merely because the runtime currently has a fallback implementation branch.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, CANON, or compatibility beyond the exact tested runtime identity.
