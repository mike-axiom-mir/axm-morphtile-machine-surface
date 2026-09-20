# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS AND REVIEWED RENDER-EVIDENCE FOUNDATION INTEGRATED; GRADIENT RENDER-OBSERVATION CANDIDATE UNDER TEST
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
- Structural, runtime-render, visual-observation and aesthetic evidence remain separate claims.
- The reviewed render-evidence foundation is integrated on main with explicit Surface producer provenance, exact MorphTile runtime identity, reviewed pixel drift sentinels for `facing-up` and `checker`, and `visual_judgement: NOT_REVIEWED`.

## Current candidate

The current bounded candidate extends look-development evidence to the already-existing `axis_gradient` request without inventing new surface vocabulary and without silently widening reviewed visual authority.

It renders the same gradient request twice through the exact pinned MorphTile rasterizer and requires identical render hashes and target-pixel coverage. The resulting observation is explicitly labeled `TECHNICALLY_RENDERED_UNBASELINED`, `deterministic_replay: PASS`, `pixel_baseline: NOT_ESTABLISHED`, and `visual_judgement: NOT_REVIEWED`.

The existing reviewed `facing-up` and `checker` baseline remains a closed exact case set. Gradient evidence is emitted separately as an observation and cannot silently become a reviewed pixel baseline merely because a deterministic PNG exists.

## Reusable rules learned

When exact endpoint identity is part of a deterministic creation contract, endpoint values must be represented as explicit branches rather than reconstructed by floating-point interpolation. Mixed ascending/descending channel tests are required because algebraic equivalence does not imply IEEE identity.

Stable substrate semantics should become bounded creation vocabulary only when they remove repeated hand-authored reasoning without inventing a new runtime contract. Render evidence should use the substrate's real renderer rather than a private approximation.

**Technical render determinism and reviewed pixel authority are different evidence layers.** A new or repaired surface rule may earn deterministic technical rendering before anyone deliberately grants its pixels reviewed-baseline status. Neither layer is an aesthetic score.

## Placement decision

The gradient creation rule and render-evidence harness belong in Surface Machine, not MorphTile core. Current MorphTile already represents position-aware procedural paint and supplies the deterministic rasterizer, render receipts, and PNG encoder needed for exact evidence. The current MorphTile main still matches the Surface runtime pin, so this activation found no missing universal material/runtime primitive and no compatibility-widening event to replay.

## Evidence boundary

Independent Verification previously replayed and passed the repaired v0.5.1 gradient endpoint attack on exact Surface head `bf9db61993acb089b7d46b76135b9c4ae93392db` against exact MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`.

The render-evidence provenance repair was independently verified on exact Surface head `941779901406961190e27a6abac9307ab00b89ae`, then integrated by the Creation Director. Surface main after that convergence is `a44a6a210e9099075cb67886f3d64187c3051924`; its post-merge test run `35503160116` passed.

The new gradient render-observation candidate must still earn producer exact-head CI before any new technical-render claim is published. `VISUALLY GOOD` remains `NOT_ASSESSED` regardless of CI outcome.

## HELD / open

- Producer exact-head CI for the current gradient render-observation candidate until completed.
- Independent Verification/Director integration of the current candidate after producer evidence exists.
- `VISUALLY GOOD` / aesthetic acceptance remains `NOT_ASSESSED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No radial/ring/noise vocabulary merely because raw MorphTile paint could express it; add named creation contracts only when a real request earns them.
- No arbitrary/noise pattern vocabulary merely because the runtime currently has a fallback implementation branch.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, CANON, or compatibility beyond the exact tested runtime identity.
