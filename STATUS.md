# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS INDEPENDENTLY VERIFIED AT EXACT PIN; RENDER-EVIDENCE TOOL IS A SEPARATE OPEN CANDIDATE
- Local test command: `npm test`
- Render evidence command: `npm run evidence:render`
- Pinned MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Envelope: provisional v0.1
- Visual quality: `NOT_ASSESSED`

## Implemented

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
- Structural, runtime-render, visual-observation and aesthetic evidence remain separate claims.

## Current render-evidence candidate

The open candidate adds a deterministic look-development evidence path for one named facing request and one named pattern request. It applies each candidate through a disposable MorphTile clone → edit → plan → commit path, renders through the pinned MorphTile rasterizer, records exact render hashes and target pixel coverage, writes PNG + JSON evidence, and compares the result with an explicit fail-closed pixel baseline.

A matching pixel baseline proves identity to the reviewed technical render baseline. It is not an aesthetic score. The generated receipt keeps `visual_judgement: NOT_REVIEWED`; human/AI observation and `VISUALLY GOOD` remain separate.

## Reusable rules learned

When exact endpoint identity is part of a deterministic creation contract, endpoint values must be represented as explicit branches rather than reconstructed by floating-point interpolation. Mixed ascending/descending channel tests are required because algebraic equivalence does not imply IEEE identity.

Stable substrate semantics should become bounded creation vocabulary only when they remove repeated hand-authored reasoning without inventing a new runtime contract. Render evidence should likewise use the substrate's real renderer rather than a private approximation. Pixel hashes are useful as drift sentinels, but must never be promoted into aesthetic approval.

## Placement decision

The gradient repair and render-evidence harness belong in Surface Machine, not MorphTile core. Current MorphTile already represents position-aware procedural paint and already supplies the built-in deterministic rasterizer, render receipts, and PNG encoder needed for exact evidence. No missing universal material/runtime primitive was found.

## Evidence boundary

Independent Verification previously rejected merged v0.5.0 exact-clamp/bounds claims on mixed-direction RGB because interpolation at `t=1` produced microscopic IEEE drift. v0.5.1 repaired that defect. Verification PR #20 independently replayed the failing attack against exact Surface head `bf9db61993acb089b7d46b76135b9c4ae93392db` and exact MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`; its dedicated and full suites passed. That upgrades the repaired v0.5.1 semantic lane to exact-revision PASS only.

The render-evidence candidate has producer evidence only until independent Verification/Director review. Its first generated `facing-up` and `checker` images were opened and observed to be visibly distinct with `mt_tower` present, but no aesthetic quality judgement was promoted from that observation.

## HELD / open

- Independent Verification/Director integration of the render-evidence candidate.
- `VISUALLY GOOD` / aesthetic acceptance remains `NOT_ASSESSED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No radial/ring/noise vocabulary merely because raw MorphTile paint could express it; add named creation contracts only when a real request earns them.
- No arbitrary/noise pattern vocabulary merely because the runtime currently has a fallback implementation branch.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, CANON, or compatibility beyond the exact tested runtime identity.
