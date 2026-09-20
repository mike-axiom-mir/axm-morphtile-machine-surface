# Status

- Machine version: 0.3.0
- State: CANDIDATE — PRODUCER PASS / INDEPENDENT RE-VERIFICATION REQUIRED
- Local test command: `npm test`
- Pinned MorphTile runtime target: v0.4 at `a579182ae585e5722ac87dd0cc8209963b18d000`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Thresholds and RGB colors for named facing rules are bounded and malformed rules HOLD explicitly.
- Authored numeric types are validated before normalization; strings, booleans and null are not coerced into numeric surface meaning.
- Top-level surface intent fails closed on fields the machine would otherwise ignore.
- `base_color` is validated as an authored finite-number RGB triplet in 0..1 before emission.
- Caller `paint` is bounded to `color` plus optional numeric `vars`; malformed or unknown fields HOLD rather than disappearing silently.
- Caller-authored paint expressions remain pass-through data, but Surface Machine does not present shape validation as proof of expression semantics; candidates carry `CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED`.
- Runtime conformance exercises all six named facing candidates plus the existing caller-paint fixture through real MorphTile `createTile`, `validateTile`, and `compileMesh`.
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.

## Reusable rules learned

A creation machine must fail closed on intent it would otherwise ignore, pass-through expressive data must keep semantic authority with the runtime that executes it, and authored types must be validated before normalization. Numeric coercion is a semantic rewrite rather than fail-closed validation.

## Placement decision

This belongs in Surface Machine, not MorphTile core. Current MorphTile already exposes the required normal-aware paint expression/runtime substrate. No universal material primitive was missing for this pass.

## Evidence boundary

Producer compatibility with MorphTile `a579182ae585e5722ac87dd0cc8209963b18d000` is TESTED only when GitHub Actions is green on the exact candidate head. Independent Verification still owns the adversarial recheck of the repaired producer behavior before integration. Later MorphTile commits are not covered automatically.

## HELD / open

- Independent Verification has not yet re-attacked the repaired exact Surface head.
- No rendered observer or human visual inspection; VISUALLY GOOD remains `NOT_TESTED`.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No Surface-Machine claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance.
- No claim of production readiness, merge/CANON, or compatibility beyond the exact tested runtime identity.
