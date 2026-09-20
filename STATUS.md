# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED RENDER EVIDENCE + GRADIENT/STRIPES TECHNICAL OBSERVATIONS INTEGRATED; CURRENT-CORE + EFFECT-DELTA CANDIDATE OPEN
- Local test command: `npm test`
- Render evidence command: `npm run evidence:render`
- Candidate MorphTile runtime target: v0.4 at `26b89a77f6a90715a6742dc4d084008ba63731b6`
- Envelope: provisional v0.1
- Visual quality: `NOT_ASSESSED`

## Integrated capability

- Six named facing directions compile deterministically to MorphTile normal-aware paint expressions.
- Bounded `axis_gradient` rules compile deterministic position-aware paint over MorphTile `x`, `y`, or `z` triangle-centre variables.
- Gradient endpoint clamps return exact authored endpoint colors outside the declared range and interpolate only inside it.
- `checker` and `stripes` compile deterministically to MorphTile's existing material `pattern` + positive finite `scale` runtime fields.
- Authored numeric types are validated before normalization; strings, booleans and null are not coerced into numeric surface meaning.
- Unknown surface/pattern fields fail closed instead of disappearing silently.
- Caller-authored paint remains pass-through data with `CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED`; Surface does not confuse envelope shape with runtime semantic proof.
- Reviewed render evidence uses MorphTile's real pinned rasterizer and keeps producer identity, runtime identity, reviewed pixel identity, visual observation and aesthetic quality separate.
- Reviewed pixel authority remains exactly `facing-up` + `checker`.
- `axis-gradient` and `stripes` are integrated as independently verified `TECHNICALLY_RENDERED_UNBASELINED` observations; neither has reviewed pixel-baseline or aesthetic authority.
- Independent Verification passed Surface PR #12 exact head `28fc911b9d0ff104e26b62daacdcf096fd2dee86`; that candidate was then integrated into Surface main.

## Current candidate

The current candidate does not widen material vocabulary. It addresses two evidence-backed gaps in the integrated lane.

First, MorphTile core advanced after the universal non-finite recipe boundary merged. Surface therefore re-pins its manifest, CI and reviewed-baseline runtime identity from `ef2b3c6986aa1a333247feffc43a8443f17239d0` to current MorphTile main `26b89a77f6a90715a6742dc4d084008ba63731b6` and must replay its exact runtime/render receipts rather than assuming compatibility.

Second, deterministic replay alone only proves that a render repeats. It does not prove that a named surface treatment actually changed the target. Render-evidence v0.4 adds one explicit base-only Surface control and requires both `axis-gradient` and `stripes` to preserve `mt_tower` pick coverage while changing at least one target RGBA pixel relative to that control before emitting `effect_delta: PASS`.

The control, gradient and stripes stay outside reviewed pixel-baseline authority. The producer may prove deterministic technical effect; it may not self-promote those pixels into reviewed or aesthetic truth.

## Reusable rules learned

**Compatibility widening is replay-earned.** When a universal core truth boundary changes, a creator machine that relies on that runtime should re-pin and replay public receipts rather than infer compatibility or duplicate generic core validation.

**Determinism and effect are different technical facts.** Same input → same pixels proves repeatability. Named treatment → target pixels differ from an explicit control proves that the treatment had a rendered effect. Neither proves visual quality.

**Technical controls do not acquire reviewed authority by existing.** Controls and unbaselined observations remain separate from the reviewed pixel set unless a deliberate review grants additional authority.

**Portable evidence identities must be collision-free.** Duplicate case ids or request ids fail closed instead of being resolved by order or overwrite.

## Placement decision

The creation rules and render-evidence/control harness belong in Surface Machine, not MorphTile core. MorphTile already represents position/normal-aware procedural paint, `checker|stripes|noise` material patterns, and supplies the deterministic rasterizer, render receipts and PNG encoder. The core change being re-pinned is the generic recipe finite-meaning boundary, not a missing material primitive.

No MorphTile-core Surface candidate is justified by this activation.

## Evidence boundary

- Integrated Surface main before this candidate: `191069a6dfbcfdb766128e97fa629f4ca7921be3`.
- Independent Verification already passed integrated stripes observation semantics on exact pre-merge head `28fc911b9d0ff104e26b62daacdcf096fd2dee86` against MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`.
- Producer evidence for the current-core/effect-delta candidate must pass on its final exact head before `TECHNICALLY VALID` or `TECHNICALLY RENDERED` is promoted for that head.
- Independent Verification of the final candidate remains separate even after producer CI.
- `VISUALLY GOOD` remains `NOT_ASSESSED` regardless of technical CI.

## HELD / open

- Final producer CI for the current exact candidate head.
- Independent Verification and Creation Director integration of this candidate.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector facing rule without a demonstrated request.
- No radial/ring/noise vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because the runtime has a fallback implementation branch.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their envelope is well shaped.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility beyond the exact tested runtime identity.
