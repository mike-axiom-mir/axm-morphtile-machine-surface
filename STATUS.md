# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED/TECHNICAL RENDER EVIDENCE + NON-FINITE PORTABILITY REPAIRS INTEGRATED; PRE-SERIALIZATION SOURCE-INTEGRITY CANDIDATE OPEN
- Local test command: `npm test`
- Render evidence command: `npm run evidence:render`
- Exact tested MorphTile runtime target: v0.4 at `26b89a77f6a90715a6742dc4d084008ba63731b6`
- Current MorphTile main observed during this activation: `429a344f7d9333bef01cf9de1c292c3af09abec2` (not an automatic compatibility claim)
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
- `axis-gradient` and `stripes` are integrated as `TECHNICALLY_RENDERED_UNBASELINED` observations with explicit base-control effect-delta evidence; neither has reviewed pixel-baseline or aesthetic authority.
- Surface PR #13 integrated the exact `26b89a77f6a90715a6742dc4d084008ba63731b6` runtime re-pin plus control-relative target-pixel effect evidence.
- Surface PR #14 integrated rejection of non-finite derived gradient spans and nested non-finite caller paint before portable JSON transport can rewrite authored values. Independent Verification passed exact PR #14 head `c2c4d0a6e77945c0828abd76d4805049c4bde982`; Surface main after integration is `1d5e13ec10245d7754d04612807fad095dc81500`.

## Current candidate — pre-serialization source integrity

Surface PR #15 does not widen material vocabulary. It closes the remaining observed authoring/transport rewrite class before portable emission.

Before this candidate, `surface_rule` and `pattern` were JSON-cloned before their domain compilers validated the authored request. A caller-controlled `toJSON` hook could therefore replace unsupported authored intent with supported data before validation. Caller paint had already gained non-finite guards, but other non-portable values and nested serialization hooks could still be rewritten, dropped or rejected by JSON after Surface's structural checks.

The candidate therefore:

- sends authored `surface_rule` and `pattern` values to their existing domain validators before any serialization step;
- copies caller paint through a bounded portable-data copier that never invokes `toJSON`;
- preserves the existing `HOLD_SURFACE_PAINT_NONFINITE_VALUE` boundary for non-finite numbers;
- adds `HOLD_SURFACE_PAINT_NONPORTABLE_VALUE` for values that portable JSON would rewrite, drop or reject, including unsupported value types, sparse arrays, accessors, symbol-keyed properties, cycles, non-plain objects and non-enumerable authored object fields;
- keeps MorphTile-owned expression semantics runtime-owned rather than pretending transport validity proves expression correctness.

No MorphTile-core material primitive is missing for this repair.

## Reusable rules learned

**Validate authorship before transport.** Serialization is not validation. A transport hook or coercion must never be able to turn unsupported authored surface intent into supported machine intent.

**Portable preservation and runtime semantics are separate facts.** Surface must prove that caller-authored material data survives its envelope unchanged before handing semantic interpretation to MorphTile. Passing that preservation boundary does not prove an expression is meaningful or visually good.

**Derived values need their own finiteness boundary.** Finite endpoints do not guarantee finite derived arithmetic; the gradient compiler must still reject a non-finite derived span.

**Determinism and effect are different technical facts.** Same input → same pixels proves repeatability. Named treatment → target pixels differ from an explicit control proves rendered effect. Neither proves aesthetic quality.

**Compatibility widening is replay-earned.** A newer MorphTile main does not silently expand Surface's compatibility claim. Re-pin only when the exact Surface runtime/render suite has been replayed against that identity for a material reason.

## Placement decision

The current candidate belongs in Surface Machine. It is creation-side authoring and portable-envelope integrity around material data. MorphTile already provides the universal material substrate: base color, `emissive`, `glow`, `checker|stripes|noise`, per-triangle paint with `x/y/z`, `nx/ny/nz` and `up`, plus deterministic rendering. No bounded MorphTile-core Surface candidate is justified by this activation.

The current MorphTile main move to `429a344f7d9333bef01cf9de1c292c3af09abec2` is the merged universal compiled-mesh non-finite boundary. It is not evidence of a missing Surface representation primitive and is not mechanically re-pinned here merely to create activity.

## Evidence boundary

- Integrated Surface baseline before PR #15: `1d5e13ec10245d7754d04612807fad095dc81500`.
- Independent Verification passed the integrated PR #14 repair before Director integration.
- Producer CI for PR #15 must pass on the final exact candidate head after every candidate mutation before `TECHNICALLY VALID` is claimed for that head.
- Independent Verification of PR #15 remains separate from producer CI.
- Existing reviewed render evidence and technical observation evidence may stay green without implying that this transport repair changed appearance.
- `VISUALLY GOOD` remains `NOT_ASSESSED`.

## HELD / open

- Independent Verification and Creation Director integration of Surface PR #15.
- Compatibility beyond exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector-facing rule without a demonstrated request.
- No radial/ring/noise creation vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because MorphTile core exposes `noise` at runtime.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their portable envelope is preserved.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility widening without exact evidence.
