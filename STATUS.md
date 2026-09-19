# Status

- Foundation version: 0.2.0
- State: TESTED CANDIDATE
- Local tests: `npm test`
- MorphTile compatibility target: v0.4 at `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented and tested

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Thresholds and RGB colors are bounded and malformed rules HOLD explicitly.
- Raw paint remains available.
- Raw paint plus `surface_rule` conflicts HOLD rather than silently selecting one author.
- Structural and visual evidence remain separate; visual evidence is `NOT_TESTED`.

## Placement decision

The reusable rule belongs in Surface Machine, not MorphTile core. MorphTile v0.4 already exposes `nx`, `ny`, and `nz` in material paint expressions. This pass adds creation-side vocabulary over that existing substrate.

## HELD / open

- No rendered observer or human visual inspection.
- No fresh cross-repo runtime execution against newer MorphTile main; newer main was source-inspected only.
- No arbitrary-direction/vector facing rule until a real request demonstrates that need.
- No claim of autonomous creation, production readiness, canon, or visual quality.
