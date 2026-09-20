# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED/TECHNICAL RENDER EVIDENCE + SOURCE-INTEGRITY REPAIRS INTEGRATED; NESTED COMPILED-AUTHORING SOURCE-INTEGRITY CANDIDATE OPEN
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
- Surface PR #14 integrated rejection of non-finite derived gradient spans and nested non-finite caller paint before portable JSON transport can rewrite authored values. Independent Verification passed exact PR #14 head `c2c4d0a6e77945c0828abd76d4805049c4bde982`.
- Surface PR #15 integrated pre-serialization source integrity for the caller-owned intent and raw-paint boundaries, including accessor/Proxy rejection before caller code can execute. Independent Verification round 4 passed exact repaired head `3026016693e1132c219876c92cd24b801aa7d25f`; PR #15 merged as Surface main `5184275314503333912cf30c97c203323a1ab7e1`, and post-merge CI passed.

## Current candidate — nested compiled-authoring source integrity

Surface PR #16 does not widen material vocabulary. It closes a deeper source boundary left after PR #15: `base_color`, `surface_rule`, and `pattern` could still contain caller-controlled Proxies, accessors, sparse arrays or other nested authored structures that their semantic compilers would read directly after the top-level intent envelope had passed.

The candidate therefore:

- snapshots compiled authoring data recursively before domain compilers read nested fields;
- detects live or revoked Proxies before `Array.isArray`, prototype inspection, key enumeration or descriptors can cross the caller boundary;
- rejects enumerable accessor-backed rule/pattern fields and accessor-backed array channels without executing them;
- rejects sparse authored arrays before a later JSON transport can manufacture `null` channels;
- strips hidden non-enumerable metadata such as `toJSON` from the compiled semantic snapshot without executing it, preserving the existing rule that hidden serialization hooks cannot rewrite authored meaning;
- keeps ordinary portable rule/pattern/base-colour data on the existing semantic compiler path, so domain validation remains responsible for direction, range, color and pattern meaning.

Regression-only head `88456cc862d31c451da38d01f51c71799ead2b7b` failed `npm test` as expected before the repair. Producer CI must pass again on the final exact PR #16 head after every candidate mutation before `TECHNICALLY VALID` is claimed.

No MorphTile-core material primitive is missing for this repair.

## Reusable rules learned

**Source-integrity boundaries are recursive.** A top-level descriptor/Proxy gate is incomplete if a later semantic compiler directly reads nested caller-owned objects or arrays. Every ownership boundary must be converted to a trap-free plain-data snapshot before semantic reads begin.

**Compiled authoring and pass-through authoring have different preservation duties.** Raw paint is transported onward and therefore must preserve its complete portable meaning. Named rule/pattern authoring is compiled into a new normalized representation, so hidden non-enumerable metadata is outside that grammar and may be discarded only after proving it cannot execute.

**Sparse arrays are authored ambiguity, not valid RGB.** Array iteration can skip holes while JSON later rewrites those holes to `null`; Surface must HOLD before transport invents a channel value.

**Validate authorship before transport.** Serialization is not validation. A transport hook or coercion must never be able to turn unsupported authored surface intent into supported machine intent.

**Portable preservation and runtime semantics are separate facts.** Surface must prove that caller-authored material data survives its envelope unchanged before handing semantic interpretation to MorphTile. Passing that preservation boundary does not prove an expression is meaningful or visually good.

**Derived values need their own finiteness boundary.** Finite endpoints do not guarantee finite derived arithmetic; the gradient compiler must still reject a non-finite derived span.

**Determinism and effect are different technical facts.** Same input → same pixels proves repeatability. Named treatment → target pixels differ from an explicit control proves rendered effect. Neither proves aesthetic quality.

**Compatibility widening is replay-earned.** A newer MorphTile main does not silently expand Surface's compatibility claim. Re-pin only when the exact Surface runtime/render suite has been replayed against that identity for a material reason.

## Placement decision

The current candidate belongs in Surface Machine. It is creation-side source integrity around Surface-owned material authoring before existing Surface semantic compilers run. MorphTile already provides the universal material substrate: base color, `emissive`, `glow`, `checker|stripes|noise`, per-triangle paint with `x/y/z`, `nx/ny/nz` and `up`, plus deterministic rendering. No bounded MorphTile-core Surface candidate is justified by this activation.

The current MorphTile main move to `429a344f7d9333bef01cf9de1c292c3af09abec2` is the merged universal compiled-mesh non-finite boundary. It is not evidence of a missing Surface representation primitive and is not mechanically re-pinned here merely to create activity.

## Evidence boundary

- Integrated Surface baseline before PR #16: `5184275314503333912cf30c97c203323a1ab7e1`.
- Independent Verification round 4 passed the exact repaired PR #15 head before Creation Director integration.
- Regression-only PR #16 head `88456cc862d31c451da38d01f51c71799ead2b7b`: Actions run `35527508876` = FAILURE at `npm test`, preserving the nested-authoring gap before repair.
- Producer CI for PR #16 must pass on the final exact candidate head after every candidate mutation before `TECHNICALLY VALID` is claimed for that head.
- Independent Verification of PR #16 remains separate from producer CI.
- Existing reviewed render evidence and technical observation evidence may stay green without implying that this source-integrity repair changed appearance.
- `VISUALLY GOOD` remains `NOT_ASSESSED`.

## HELD / open

- Independent Verification and Creation Director integration of Surface PR #16.
- Compatibility beyond exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector-facing rule without a demonstrated request.
- No radial/ring/noise creation vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because MorphTile core exposes `noise` at runtime.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their portable envelope is preserved.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility widening without exact evidence.
