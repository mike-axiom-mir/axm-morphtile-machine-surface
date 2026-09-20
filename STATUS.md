# Status

- Foundation version: 0.2.0
- State: STACKED CANDIDATE — EXACT-HEAD CI REQUIRED
- Local tests: `npm test`
- Pinned MorphTile runtime target: v0.4 at `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`
- Current MorphTile main: source-inspected only for surface-normal paint support; current-main runtime compatibility is not claimed
- Envelope: provisional v0.1
- Visual proof: none

## Implemented in the parent candidate

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Thresholds and RGB colors are bounded and malformed rules HOLD explicitly.
- Raw paint remains available.
- Raw paint plus `surface_rule` conflicts HOLD rather than silently selecting one author.
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.

## Added in this stacked candidate

- CI checks out the exact MorphTile runtime commit declared in `machine.json`.
- Runtime conformance executes all six named facing candidates through real MorphTile `createTile`, `validateTile`, and `compileMesh`.
- Exact pinned receipts check triangle count, position count, material-color count, and that each named direction paints exactly one box face while the other five faces use `else_color`.
- The test fails if CI runtime identity drifts away from the manifest pin.

## Placement decision

This conformance machinery belongs in Surface Machine, not MorphTile core. MorphTile already exposes the normal-aware material paint substrate required by the candidate; this pass verifies that creation-side vocabulary against the declared substrate identity.

## Evidence boundary

Pinned-runtime compatibility is TESTED only when GitHub Actions is green on the exact stacked-candidate head. Current MorphTile main is newer and remains outside the runtime compatibility claim until separately tested.

## HELD / open

- No rendered observer or human visual inspection.
- No current-main runtime compatibility claim.
- No arbitrary-direction/vector facing rule until a real request demonstrates that need.
- No automatic aesthetic acceptance.
- No claim of autonomous creation, production readiness, canon, or visual quality.
