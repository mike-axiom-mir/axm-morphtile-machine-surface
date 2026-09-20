# Status

- Machine version: 0.4.0
- State: CANDIDATE — PRODUCER EVIDENCE PENDING / INDEPENDENT VERIFICATION SEPARATE
- Local test command: `npm test`
- Pinned MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- `checker` and `stripes` compile deterministically to MorphTile's existing material `pattern` + positive finite `scale` runtime fields.
- Unknown pattern names/fields and malformed scales fail closed; Surface Machine does not silently map arbitrary names to MorphTile's generic fallback/noise runtime branch.
- Pattern modulation may coexist with raw paint or a named facing rule because the runtime applies pattern shading separately from procedural paint colors.
- Thresholds and RGB colors for named facing rules are bounded and malformed rules HOLD explicitly.
- Authored numeric types are validated before normalization; strings, booleans and null are not coerced into numeric surface meaning.
- Top-level surface intent fails closed on fields the machine would otherwise ignore.
- `base_color` is validated as an authored finite-number RGB triplet in 0..1 before emission.
- Caller `paint` is bounded to `color` plus optional numeric `vars`; malformed or unknown fields HOLD rather than disappearing silently.
- Caller-authored paint expressions remain pass-through data, but Surface Machine does not present shape validation as proof of expression semantics; candidates carry `CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED`.
- Runtime conformance exercises all six named facing candidates, the existing caller-paint fixture, and checker/stripes pattern attenuation through real MorphTile `createTile`, `validateTile`, and `compileMesh`.
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.

## Reusable rules learned

Creation vocabulary may wrap a runtime primitive only when the substrate already has explicit stable semantics for the named concept. Expose the smallest proven names, validate authored types before normalization, and keep undocumented runtime fallbacks out of creation vocabulary until they earn a contract. Orthogonal material operations should compose rather than silently overwrite each other.

## Placement decision

This belongs in Surface Machine, not MorphTile core. Current MorphTile already represents and executes `checker` and `stripes` material patterns plus scale, and uses them in ordinary built-in matter. No universal material primitive is missing for this candidate.

## Evidence boundary

Producer compatibility with MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0` becomes TESTED only when GitHub Actions is green on the exact candidate head. Independent Verification is a separate evidence lane and must not be inferred from producer CI. Later MorphTile commits are not covered automatically.

## HELD / open

- Producer CI for this v0.4 candidate must pass before TECHNICALLY VALID is promoted.
- Independent Verification has not yet attacked this exact candidate head.
- No rendered observer or human visual inspection; VISUALLY GOOD remains `NOT_TESTED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No arbitrary/noise pattern vocabulary merely because the runtime currently has a fallback implementation branch.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, CANON, or compatibility beyond the exact tested runtime identity.
