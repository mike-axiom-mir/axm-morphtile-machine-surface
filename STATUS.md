# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED/TECHNICAL RENDER EVIDENCE + SOURCE-INTEGRITY REPAIRS THROUGH PR #24 INTEGRATED; REQUEST-ENVELOPE OWN-KEY IDENTITY CANDIDATE OPEN
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
- PR #13 integrated the exact runtime re-pin plus control-relative target-pixel effect evidence.
- PR #14 integrated rejection of non-finite derived gradient spans and nested non-finite caller paint before portable JSON transport can rewrite authored values.
- PR #15 integrated pre-serialization source integrity for caller-owned intent and raw paint, including accessor/Proxy rejection before caller code can execute.
- PR #16 integrated recursive compiled-authoring source protection for `base_color`, `surface_rule`, and `pattern`, including Proxy/accessor/sparse-array handling and inert own-key writes.
- PR #17 extended inert own-key preservation across remaining intent and raw-paint snapshot boundaries.
- PR #18 promoted independently verified inherited-looking own-key cases into permanent producer regressions.
- PR #19 integrated authored-presence semantics: explicit `undefined` and hidden compiled semantic data can no longer collapse into omission/defaulting, while the established hidden `toJSON` metadata exception remains narrow and inert.
- PR #20 integrated signed-negative-zero rejection for raw pass-through paint before JSON transport can erase its sign identity.
- PR #21 integrated explicit signed-zero canonicalization for machine-owned compiled `base_color`, facing and `axis_gradient` numeric meaning. Independent Verification round 11 passed exact candidate `3e43c003a0dc54f7ae877767fd2c3dff9daaa39d`; Creation Director then merged it to Surface main `ccddcb8030125a2a93acd33365bab700b62b37d7`.
- PR #23 integrated coercion-free Surface rule discriminators. Independent Verification round 12 passed exact candidate `3dfe1ce0fdadbf83fa330a088429ed3806c14583`; Creation Director then merged it to Surface main `5e29c258a92f522374f6819e2b470582865f8557`.
- PR #24 integrated the trap-free outer request-envelope boundary, dense real-array capability semantics and recursively portable provenance. Independent Verification passed exact candidate `e37fc547f8ccdbfdf8ac49c9ca48458469fad453` via Verification PR #39 / verifier head `aae4fde440ee925d25b566ee92cd50898088645c` / targeted Actions `35554638541`; Creation Director then merged it to Surface main `3b349b70567ef3758bf951a08f2aa5e65ae56a86`.

## Current candidate — request-envelope own-key identity

PR #24 made the request envelope trap-free before Surface reads known fields, but `snapshotRequest()` still selected only the six named v0.1 fields. Any other caller-authored own string key was ignored, and symbol-keyed request data was never examined. That silently reinterpreted authored presence as omission one layer outside the already strict intent grammar. The loss affected enumerable unknown fields, non-enumerable unknown fields and symbol-keyed data even though the provisional v0.1 envelope exposes an explicit top-level field set.

Surface PR #25 therefore:

- preserves fail-first regressions for an enumerable unknown request field, a hidden unknown request field and a symbol-keyed request field, plus an ordinary v0.1 control;
- rejects symbol-keyed request data before portable transport can drop it;
- inspects all own string names before selecting known v0.1 fields and deterministically HOLDs the first unsupported name;
- leaves caller-owned unknown data/descriptors untouched;
- keeps the request Proxy gate first, so own-key inspection does not execute caller-controlled Proxy traps;
- changes no material vocabulary, MorphTile runtime primitive, compatibility claim, reviewed pixel authority or aesthetic judgement.

Fail-first evidence is preserved at exact test-only head `ae94524e9b8a02b86f8f24bc7bdec38003518799`. Actions run `35555952139` failed at `npm test`; render/evidence and artifact upload were correctly skipped. The repaired code head `abe469a9c586906e901ac6f51a7a72a770030b21` passed Actions `35556009152`, including `npm test`, the real pinned `npm run evidence:render`, and evidence upload. Artifact `10620004492` has digest `sha256:9ec0aa308345ad34b1ffe4baaff8896700213b2e2a5ccfe7014baaf798fa86f1`.

This activation also repaired one independent continuity contradiction: `INTEGRATION.md` still named the older `ef2b3c...` runtime despite `machine.json`, README and this status already pinning exact MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`. The integration contract now names the manifest pin. Because documentation commits move the candidate head, exact final-head CI/render evidence must be replayed after these continuity updates before producer PASS is claimed for the final head.

## Reusable rules learned

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

The current candidate belongs in Surface Machine. It repairs how the Surface producer applies its own provisional request-envelope grammar before compiling material intent. MorphTile v0.4 already defines the universal ordinary material substrate: base color, optional `emissive`, `glow`, `checker|stripes|noise` + scale, and per-triangle paint with `x/y/z`, `nx/ny/nz` and `up`, plus deterministic rendering. No missing universal material representation/runtime primitive was demonstrated, so no MorphTile-core candidate is justified.

Surface remains deliberately pinned to exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`; current-core freshness alone is not a reason to manufacture compatibility churn.

## Evidence boundary

- Integrated Surface baseline before PR #25: `3b349b70567ef3758bf951a08f2aa5e65ae56a86`.
- Fail-first PR #25 head `ae94524e9b8a02b86f8f24bc7bdec38003518799`, Actions `35555952139`: `npm test` failed on the new request-own-key regressions; render/evidence and upload skipped.
- Repaired code head `abe469a9c586906e901ac6f51a7a72a770030b21`, Actions `35556009152`: `npm test`, real pinned `npm run evidence:render`, and artifact upload PASS; artifact `10620004492`, digest `sha256:9ec0aa308345ad34b1ffe4baaff8896700213b2e2a5ccfe7014baaf798fa86f1`.
- Producer CI and the real render-evidence path must pass on the final exact candidate head after continuity-document updates before `TECHNICALLY VALID` is claimed for that final head.
- Independent Verification remains separate from producer CI.
- Existing reviewed render evidence and technical observation evidence may remain green without implying this request-boundary repair improved appearance.
- `VISUALLY GOOD` remains `NOT_ASSESSED`.

## HELD / open

- Independent Verification and Creation Director integration of Surface PR #25.
- Compatibility beyond exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector-facing rule without a demonstrated request.
- No radial/ring/noise creation vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because MorphTile core exposes `noise` at runtime.
- No speculative `emissive`/`glow` creation contract merely because those fields exist in MorphTile core; a real creation request must earn the named Surface semantics and evidence boundary.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their portable envelope is preserved.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility widening without exact evidence.
