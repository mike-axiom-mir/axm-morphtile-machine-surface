# Status

- Machine version: 0.5.1
- State: CANDIDATE REPAIR — PRODUCER TECHNICALLY VALID ONLY WHEN CURRENT PR CHECKS ARE GREEN / INDEPENDENT VERIFICATION SEPARATE
- Local test command: `npm test`
- Pinned MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Envelope: provisional v0.1
- Visual proof: none

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
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.

## Reusable rules learned

When exact endpoint identity is part of a deterministic creation contract, endpoint values must be represented as explicit branches rather than reconstructed by floating-point interpolation. Mixed ascending/descending channel tests are required because algebraic equivalence does not imply IEEE identity. Creation vocabulary should wrap already-stable substrate semantics when it removes repeated hand-authored expression reasoning without creating a new runtime contract.

## Placement decision

This repair belongs in Surface Machine, not MorphTile core. Current MorphTile already represents position-aware procedural paint and supplies the existing expression words required for explicit endpoint branches and interior interpolation. Independent Verification diagnosed a producer compilation error rather than a missing universal material primitive.

## Evidence boundary

Independent Verification rejected merged v0.5.0 exact-clamp/bounds claims on mixed-direction RGB because interpolation at `t=1` produced microscopic IEEE drift. v0.5.1 adds the producer repair and exact adversarial runtime receipt. Producer TECHNICALLY VALID is earned only by the current candidate head's green GitHub Actions against exact MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`. Independent re-verification of the repaired head remains separate and required before upgrading that lane to PASS.

## HELD / open

- Independent Verification of the repaired v0.5.1 exact head.
- No rendered observer or human visual inspection; VISUALLY GOOD remains `NOT_TESTED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No radial/ring/noise vocabulary merely because raw MorphTile paint could express it; add named creation contracts only when a real request earns them.
- No arbitrary/noise pattern vocabulary merely because the runtime currently has a fallback implementation branch.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, CANON, or compatibility beyond the exact tested runtime identity.
