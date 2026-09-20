# Status

- Machine version: 0.5.0
- State: CANDIDATE — PRODUCER TECHNICALLY VALID PASS WHEN CURRENT PR CHECKS ARE GREEN / INDEPENDENT VERIFICATION SEPARATE
- Local test command: `npm test`
- Pinned MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Bounded `axis_gradient` rules compile deterministic clamped position-aware paint over MorphTile `x`, `y`, or `z` triangle-centre variables.
- Gradient axes, ranges and endpoint colors fail closed: only `x|y|z`, finite authored numbers with `to > from`, and authored finite-number RGB triplets in 0..1 are accepted.
- `checker` and `stripes` compile deterministically to MorphTile's existing material `pattern` + positive finite `scale` runtime fields.
- Unknown pattern names/fields and malformed scales fail closed; Surface Machine does not silently map arbitrary names to MorphTile's generic fallback/noise runtime branch.
- Pattern modulation may coexist with raw paint or a named surface rule because the runtime applies pattern shading separately from procedural paint colors.
- Thresholds and RGB colors for named facing rules are bounded and malformed rules HOLD explicitly.
- Authored numeric types are validated before normalization; strings, booleans and null are not coerced into numeric surface meaning.
- Top-level surface intent fails closed on fields the machine would otherwise ignore.
- `base_color` is validated as an authored finite-number RGB triplet in 0..1 before emission.
- Caller `paint` is bounded to `color` plus optional numeric `vars`; malformed or unknown fields HOLD rather than disappearing silently.
- Caller-authored paint expressions remain pass-through data, but Surface Machine does not present shape validation as proof of expression semantics; candidates carry `CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED`.
- Runtime conformance exercises all six named facing candidates, all three axis-gradient directions, the existing caller-paint fixture, and checker/stripes pattern attenuation through real MorphTile `createTile`, `validateTile`, and `compileMesh`.
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.

## Reusable rules learned

Creation vocabulary should wrap already-stable substrate semantics when it removes repeated hand-authored expression reasoning without creating a new runtime contract. Authored numeric types must be validated before normalization. Spatial look-development rules should declare their coordinate frame and bounded interval explicitly, then compile to inspectable expressions; clamping should be part of the deterministic rule rather than an unstated aesthetic assumption. Orthogonal material operations should compose rather than silently overwrite each other.

## Placement decision

This belongs in Surface Machine, not MorphTile core. Current MorphTile already represents position-aware procedural paint using `x`, `y`, and `z`, already supplies the required arithmetic/min/max expression words, and explicitly describes gradients as paint-authored colour behavior. The new rule is deterministic creation vocabulary over that substrate, not a missing universal material primitive.

## Evidence boundary

Producer compatibility with MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0` is TECHNICALLY VALID only when the current PR head's GitHub Actions checks are green. Independent Verification is a separate evidence lane and must not be inferred from producer CI. Later MorphTile commits are not covered automatically.

## HELD / open

- Independent Verification has not yet attacked this v0.5 candidate head.
- No rendered observer or human visual inspection; VISUALLY GOOD remains `NOT_TESTED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No radial/ring/noise vocabulary merely because raw MorphTile paint could express it; add named creation contracts only when a real request earns them.
- No arbitrary/noise pattern vocabulary merely because the runtime currently has a fallback implementation branch.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, CANON, or compatibility beyond the exact tested runtime identity.
