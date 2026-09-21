# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED/TECHNICAL RENDER EVIDENCE + SOURCE-INTEGRITY REPAIRS THROUGH PR #28 INTEGRATED; BASE-ONLY AUTHORSHIP CANDIDATE OPEN
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
- `axis-gradient` and `stripes` are integrated as `TECHNICALLY_RENDERED_UNBASELINED` observations with explicit control-relative effect evidence; neither has reviewed pixel-baseline or aesthetic authority.
- PRs #13-#24 integrated the exact runtime/evidence lane plus the source-integrity boundary from numeric derivation through nested authoring, inert writes, authored presence, signed-zero handling, semantic discriminators and the outer request envelope.
- PR #25 integrated exact request-envelope own-key accounting so unsupported caller-owned names/symbols cannot silently become omission.
- PR #26 integrated own-key membership for the facing-direction registry so inherited host-language names cannot masquerade as declared directions.
- PR #27 integrated provenance presence semantics so admitted falsey authored values remain exact rather than collapsing through truthiness.
- PR #28 promoted the independently verified Object-prototype host-name family into permanent facing-registry producer regressions.
- Creation Director round 16 converged PRs #27 and #28; Surface main entering this activation is `895c0330422e9639cac2308da38821ac44942ad9`.

## Current candidate — base-only authorship is actually base-only

`fixtures/request.base-control.json` explicitly requests the shared base material "without a named surface effect" and authors only `base_color`. The producer nevertheless applied its legacy normal-driven default paint to every request that had no raw/rule paint. That made the technical `base-control` receipt structurally different from the meaning its fixture and evidence lane claimed.

This candidate keeps the repair deliberately bounded:

- a request whose only authored visual treatment is `base_color` emits that ordinary MorphTile material color without inventing procedural `paint`;
- an actually empty Surface intent still receives the existing bounded legacy fallback paint, preserving the established no-authorship default;
- named pattern behavior is intentionally unchanged because the reviewed `checker` pixel baseline already binds that composition and changing it belongs to a separate visual-review decision;
- the legacy default-paint expression is now one deterministic `createDefaultPaint()` primitive rather than duplicated reasoning;
- the runtime pattern conformance control authors that default paint explicitly instead of depending on a base-color-only request to acquire it implicitly;
- producer evidence now describes the base-only path as authored base color without an invented procedural treatment.

Fail-first evidence is preserved at exact test-only head `3e306da596bb7874d0623c34a56c3d7de3e9ddf5`. Actions `35566649009` failed at `npm test`; render evidence and artifact upload were skipped.

The first repair head `e5f5be1dde1b828e1c9582ef63e1461dfb328feb` still failed `npm test` in Actions `35566696552`. Inspection of the runtime conformance contract showed the pattern baseline used a base-color-only request while requiring the same procedural paint colors as patterned cases. The candidate therefore made that control authorship explicit and centralized the repeated fallback expression instead of weakening the new base-only invariant.

Repaired code/test head `de56f633c234ce7056f3e0942402fec069608777` passed Actions `35566867299`: `npm test`, the real pinned `npm run evidence:render`, and evidence artifact upload all passed. Artifact `10623668699` has digest `sha256:bccf8164735095021ecff54d68ba783229636a3a668a7e5ee3e635226393d74f`.

Because this status update moves the candidate head, producer PASS for the final PR head must be based on a fresh exact-head workflow replay after this commit.

## Reusable rules learned

**A technical control must structurally mean what its evidence label says.** A fixture called base-only cannot secretly receive an unrelated normal-driven paint treatment merely because a generic fallback exists.

**Defaults are absence semantics, not decoration rights.** Once the caller has authored a complete ordinary base material, a producer default must not add an orthogonal visual treatment unless that composition is an explicit named contract.

**Repeated fallback semantics belong in one deterministic primitive.** Tests that need the same treatment must author it explicitly from the machine primitive instead of relying on an unrelated request shape to trigger it by accident.

**Reviewed pixels are authority, not implementation convenience.** The existing checker composition remains unchanged in this candidate because changing a reviewed visual baseline requires a separate visual-review decision; a technical cleanup must not silently rewrite reviewed appearance.

**An exact envelope grammar must account for every caller-owned own key before selecting the fields it understands.** Trap-free reads are incomplete if unknown own names or symbols can simply disappear. When the grammar has no extension field, unsupported own-key presence must HOLD rather than become omission.

**Source integrity must begin before the first caller-owned read, including the outer request envelope.** Protecting `intent` recursively is incomplete if `request.intent`, capability availability or provenance can execute caller code one ownership boundary earlier. Metadata used for machine decisions or later transport must first become inert plain data under its own grammar.

**Container type is semantic meaning, not merely an implementation detail.** A capability list is a list of capability ids; accepting a string because it also has `.includes()` silently delegates grammar to host-language method coincidence.

**Machine-owned semantic discriminators must be validated before host-language coercion.** Source-safe snapshots stop caller execution, but deterministic grammar also requires that structured authored values cannot fall through to `String()`, property-key conversion or another ambient coercion path that replaces a precise machine HOLD with a native runtime error.

**Transport must never be the hidden author of normalization.** Pass-through grammars preserve authored identity or HOLD. Machine-owned compiled grammars may deliberately collapse equivalent representations, but normalization must happen explicitly at the semantic boundary before serialization and be regression-tested there.

**Authored presence is meaning.** A caller field that exists but cannot survive the Surface boundary unchanged must not be reinterpreted as omission. Explicit `undefined`, non-enumerable authored semantic data, and genuinely absent fields are distinct source states.

**Defaults apply only to absence.** A compiler may default an omitted optional field, but it must not reach that default by silently deleting a field the caller actually supplied.

**Metadata exclusion and semantic omission are different.** A known hidden serialization hook may be deliberately excluded without execution when it is explicitly outside the compiled grammar and existing tests require semantic-field validation to retain priority. That exception must stay named and narrow.

**Source-integrity boundaries are recursive.** A top-level descriptor/Proxy gate is incomplete if a later semantic compiler directly reads nested caller-owned objects or arrays. Every ownership boundary must be converted to a trap-free plain-data snapshot before semantic reads begin.

**Compiled authoring and pass-through authoring have different preservation duties, but neither may invent omission.** Raw paint is transported onward and therefore must preserve its complete portable meaning. Named rule/pattern authoring is compiled into a normalized representation, yet the compiler must still distinguish absent grammar from authored data it cannot safely represent.

**Source-safe snapshots require inert writes as well as inert reads.** Authored own keys such as `__proto__`, `constructor`, and `toString` remain data until Surface grammar validation; ordinary assignment must not activate host-language object semantics.

**Sparse arrays are authored ambiguity, not valid RGB.** Array iteration can skip holes while JSON later rewrites those holes to `null`; Surface must HOLD before transport invents a channel value.

**Validate authorship before transport.** Serialization is not validation. A transport hook or coercion must never turn unsupported authored surface intent into supported machine intent.

**Portable preservation and runtime semantics are separate facts.** Surface must prove that caller-authored material data survives its envelope unchanged before handing semantic interpretation to MorphTile. Passing that preservation boundary does not prove an expression is meaningful or visually good.

**Derived values need their own finiteness boundary.** Finite endpoints do not guarantee finite derived arithmetic; the gradient compiler must still reject a non-finite derived span.

**Determinism and effect are different technical facts.** Same input → same pixels proves repeatability. Named treatment → target pixels differ from an explicit control proves rendered effect. Neither proves aesthetic quality.

**Compatibility widening is replay-earned.** A newer MorphTile main does not silently expand Surface's compatibility claim. Re-pin only when the exact Surface runtime/render suite has been replayed against that identity for a material reason.

## Placement decision

The current candidate belongs in Surface Machine. It repairs producer-side default authorship and evidence-control semantics. MorphTile v0.4 already defines ordinary `material.data.color` with optional `paint`, so a base-color-only material needs no new universal representation/runtime primitive. No MorphTile-core candidate is justified.

Surface remains deliberately pinned to exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`; current-core freshness alone is not a reason to manufacture compatibility churn.

## Evidence boundary

- Integrated Surface baseline entering this activation: `895c0330422e9639cac2308da38821ac44942ad9`.
- Fail-first head `3e306da596bb7874d0623c34a56c3d7de3e9ddf5`, Actions `35566649009`: `npm test` failed; render/evidence and upload skipped.
- First repair head `e5f5be1dde1b828e1c9582ef63e1461dfb328feb`, Actions `35566696552`: `npm test` still failed; render/evidence and upload skipped.
- Repaired code/test head `de56f633c234ce7056f3e0942402fec069608777`, Actions `35566867299`: `npm test`, real pinned `npm run evidence:render`, and artifact upload PASS; artifact `10623668699`, digest `sha256:bccf8164735095021ecff54d68ba783229636a3a668a7e5ee3e635226393d74f`.
- Producer CI and the real render-evidence path must pass on the final exact candidate head after this status update before `TECHNICALLY VALID` is claimed for that final head.
- Independent Verification remains separate from producer CI.
- Existing reviewed `facing-up` and `checker` pixel authority is unchanged by this candidate.
- `VISUALLY GOOD` remains `NOT_ASSESSED`.

## HELD / open

- Independent Verification and Creation Director integration of the current Surface candidate.
- Compatibility beyond exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- Any change to the reviewed checker composition/default-paint relationship without a separate visual-review decision.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector-facing rule without a demonstrated request.
- No radial/ring/noise creation vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because MorphTile core exposes `noise` at runtime.
- No speculative `emissive`/`glow` creation contract merely because those fields exist in MorphTile core; a real creation request must earn the named Surface semantics and evidence boundary.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their portable envelope is preserved.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility widening without exact evidence.
