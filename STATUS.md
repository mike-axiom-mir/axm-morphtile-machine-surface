# Status

- Foundation version: 0.2.0
- State: STACKED CANDIDATE — EXACT-HEAD CI REQUIRED
- Local tests: `npm test`
- Pinned MorphTile runtime target: v0.4 at `4346df01ed18cd1336064f9323d7766ff4f6338a`
- Relationship to prior pin: six commits ahead of `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented in the parent candidates

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Thresholds and RGB colors are bounded and malformed rules HOLD explicitly.
- Raw paint remains available.
- Raw paint plus `surface_rule` conflicts HOLD rather than silently selecting one author.
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.
- Runtime conformance executes all six named facing candidates through real MorphTile `createTile`, `validateTile`, and `compileMesh`.
- Exact receipts check triangle count, position count, material-color count, and one selected face per named direction.

## Added in this stacked candidate

- The declared MorphTile compatibility pin advances to exact main snapshot `4346df01ed18cd1336064f9323d7766ff4f6338a`.
- CI checks out that exact snapshot and must agree with `machine.json.tested_against.commit`.
- The same semantic facing receipts are replayed against the newer substrate rather than assuming source compatibility.

## Placement decision

This conformance machinery belongs in Surface Machine, not MorphTile core. MorphTile already exposes the normal-aware material paint substrate required by the candidate; this pass verifies creation-side vocabulary against a newer exact substrate identity.

## Evidence boundary

Compatibility with MorphTile `4346df01ed18cd1336064f9323d7766ff4f6338a` is TESTED only when GitHub Actions is green on the exact stacked-candidate head. A later MorphTile main commit is not automatically covered.

## HELD / open

- No rendered observer or human visual inspection.
- No compatibility claim for MorphTile commits newer than the exact tested snapshot.
- No arbitrary-direction/vector facing rule until a real request demonstrates that need.
- No automatic aesthetic acceptance.
- No claim of autonomous creation, production readiness, canon, or visual quality.
