# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED/TECHNICAL RENDER EVIDENCE + SOURCE-INTEGRITY REPAIRS INTEGRATED; AUTHORED-PRESENCE SOURCE-INTEGRITY CANDIDATE OPEN
- Local test command: `npm test`
- Render evidence command: `npm run evidence:render`
- Exact tested MorphTile runtime target: v0.4 at `26b89a77f6a90715a6742dc4d084008ba63731b6`
- Current MorphTile main observed during this activation: `2bdf8eade1376055473b9cc1b11734b72a5566e5` (not an automatic compatibility claim)
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
- Surface PR #15 integrated pre-serialization source integrity for the caller-owned intent and raw-paint boundaries, including accessor/Proxy rejection before caller code can execute. Independent Verification round 4 passed exact repaired head `3026016693e1132c219876c92cd24b801aa7d25f`; PR #15 merged as Surface main `5184275314503333912cf30c97c203323a1ab7e1`.
- Surface PR #16 integrated recursive compiled-authoring source protection for `base_color`, `surface_rule`, and `pattern`, including Proxy/accessor/sparse-array handling and inert own-key writes.
- Surface PR #17 extended inert own-key preservation across the remaining intent and raw-paint snapshot boundaries; independent Verification passed its exact candidate before integration.
- Surface PR #18 promoted the independently verified inherited-looking own-key family into permanent producer regressions and merged to current Surface main `536a745ddea4d996d0daf193649db939fe3ade83`.

## Current candidate — authored-presence source integrity

Current integrated source protection preserves own-key identity, blocks caller execution through accessors/Proxies, and rejects many transport rewrites. A remaining family was exposed by exact regression execution: an authored field could still be present in the caller's source but collapse into absence before semantic validation.

The candidate therefore:

- rejects explicit `undefined` values at the top-level Surface intent boundary instead of treating a present field as omitted;
- rejects explicit `undefined` inside compiled rule/pattern authoring before a domain compiler can reinterpret it as a defaulted field;
- rejects non-enumerable nested compiled semantic data instead of silently stripping it from the semantic snapshot;
- preserves the established hidden `toJSON` source-integrity boundary: a non-enumerable data-property `toJSON` function is excluded inertly, never executed, so semantic authored fields keep their validation/error priority;
- preserves the existing rule that genuinely omitted optional fields may still receive their documented deterministic defaults;
- leaves raw paint on its existing stricter portable-preservation path, which already rejects `undefined` and non-enumerable data;
- changes no material vocabulary, runtime expression meaning, reviewed pixel authority, or aesthetic judgement.

Regression-only head `6e2ab64055222b6d959a39282182db110eb1f6e9` failed Actions run `35540284912` at `npm test`: all three initial authored-presence probes returned `CANDIDATE` where an explicit HOLD was required. The run reported 246 PASS / 3 FAIL and skipped render evidence after the test failure. This preserves fail-first evidence before the repair.

The first repaired candidate head `bcd30a470974a9aa9b457edd74c8350a3e131efa` closed all authored-presence probes but correctly exposed a regression against two existing pre-serialization priority tests: hidden non-enumerable `toJSON` hooks on unsupported rule/pattern authoring were being rejected as nonportable before the semantic unknown-kind HOLD could win. Actions run `35540436381` reported 249 PASS / 2 FAIL. The candidate was then narrowed so only that already-established hidden data-property serialization hook remains inertly excluded; other hidden compiled semantic data still HOLDs.

No MorphTile-core material primitive is missing for this repair.

## Reusable rules learned

**Authored presence is meaning.** A caller field that exists but cannot survive the Surface boundary unchanged must not be reinterpreted as omission. Explicit `undefined`, non-enumerable authored semantic data, and genuinely absent fields are distinct source states.

**Defaults apply only to absence.** A compiler may default an omitted optional field, but it must not reach that default by silently deleting a field that the caller actually supplied.

**Metadata exclusion and semantic omission are different.** A known hidden serialization hook may be deliberately excluded without execution when it is explicitly outside the compiled grammar and existing tests require semantic-field validation to retain priority. That exception must stay named and narrow; it is not permission to drop arbitrary hidden authored data.

**Source-integrity boundaries are recursive.** A top-level descriptor/Proxy gate is incomplete if a later semantic compiler directly reads nested caller-owned objects or arrays. Every ownership boundary must be converted to a trap-free plain-data snapshot before semantic reads begin.

**Compiled authoring and pass-through authoring have different preservation duties, but neither may invent omission.** Raw paint is transported onward and therefore must preserve its complete portable meaning. Named rule/pattern authoring is compiled into a normalized representation, yet the compiler must still distinguish absent grammar from authored data it cannot safely represent.

**Sparse arrays are authored ambiguity, not valid RGB.** Array iteration can skip holes while JSON later rewrites those holes to `null`; Surface must HOLD before transport invents a channel value.

**Validate authorship before transport.** Serialization is not validation. A transport hook or coercion must never be able to turn unsupported authored surface intent into supported machine intent.

**Portable preservation and runtime semantics are separate facts.** Surface must prove that caller-authored material data survives its envelope unchanged before handing semantic interpretation to MorphTile. Passing that preservation boundary does not prove an expression is meaningful or visually good.

**Derived values need their own finiteness boundary.** Finite endpoints do not guarantee finite derived arithmetic; the gradient compiler must still reject a non-finite derived span.

**Determinism and effect are different technical facts.** Same input → same pixels proves repeatability. Named treatment → target pixels differ from an explicit control proves rendered effect. Neither proves aesthetic quality.

**Compatibility widening is replay-earned.** A newer MorphTile main does not silently expand Surface's compatibility claim. Re-pin only when the exact Surface runtime/render suite has been replayed against that identity for a material reason.

## Placement decision

The current candidate belongs in Surface Machine. It is creation-side source integrity around Surface-owned material authoring before existing Surface semantic compilers run. Current MorphTile main `2bdf8eade1376055473b9cc1b11734b72a5566e5` carries general own-key registry continuity, while MorphTile already provides the universal material substrate: base color, `emissive`, `glow`, `checker|stripes|noise`, per-triangle paint with `x/y/z`, `nx/ny/nz` and `up`, plus deterministic rendering. No bounded MorphTile-core Surface candidate is justified by this activation.

Surface remains deliberately pinned to exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`; current-core freshness alone is not a reason to manufacture compatibility churn.

## Evidence boundary

- Integrated Surface baseline before this candidate: `536a745ddea4d996d0daf193649db939fe3ade83`.
- Regression-only candidate head `6e2ab64055222b6d959a39282182db110eb1f6e9`: Actions run `35540284912` = FAILURE at `npm test`, 246 PASS / 3 FAIL, preserving the authored-presence gap before repair.
- The three initial failing cases were: nested non-enumerable compiled authoring silently dropped, explicit `pattern.scale: undefined` collapsed into the pattern default, and explicit top-level `intent.pattern: undefined` collapsed into omission.
- Intermediate repaired head `bcd30a470974a9aa9b457edd74c8350a3e131efa`: Actions run `35540436381` = FAILURE at `npm test`, 249 PASS / 2 FAIL, showing the initial repair over-broadened hidden-field rejection and changed established `toJSON` semantic-error priority.
- Producer CI must pass on the final exact candidate head after every candidate mutation before `TECHNICALLY VALID` is claimed for that head.
- Independent Verification remains separate from producer CI.
- Existing reviewed render evidence and technical observation evidence may stay green without implying that this source-integrity repair changed appearance.
- `VISUALLY GOOD` remains `NOT_ASSESSED`.

## HELD / open

- Independent Verification and Creation Director integration of the current authored-presence candidate.
- Compatibility beyond exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector-facing rule without a demonstrated request.
- No radial/ring/noise creation vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because MorphTile core exposes `noise` at runtime.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their portable envelope is preserved.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility widening without exact evidence.
