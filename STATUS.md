# Status

- Machine version: 0.5.1
- State: CREATION SEMANTICS + REVIEWED/TECHNICAL RENDER EVIDENCE + SOURCE-INTEGRITY REPAIRS THROUGH PR #23 INTEGRATED; REQUEST-ENVELOPE SOURCE-INTEGRITY CANDIDATE OPEN
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

## Current candidate — request-envelope source integrity

The inner Surface intent boundary is now descriptor-safe, Proxy-safe and recursive, but one ownership boundary remained outside it. `run()` still read `request.intent` directly after a shallow `assertRequest()`, dependency lookup called `.includes()` directly on caller-owned `request.available_capabilities`, and `result()` JSON-cloned caller-owned provenance. Those reads could execute request-level accessors or Proxy traps before Surface had decided whether the envelope was admissible. A string supplied as `available_capabilities` could also inherit JavaScript `String.prototype.includes` semantics and masquerade as a capability list.

Surface PR #24 therefore:

- preserves fail-first regressions for a request-level `intent` accessor, a root request Proxy, an `available_capabilities` Proxy and provenance accessors;
- establishes a trap-free request-envelope snapshot before Surface reads intent, capability availability or provenance;
- requires `available_capabilities` to be a dense plain array of string capability ids before dependency lookup, while retaining an ordinary-array control;
- snapshots provenance as portable plain data before result transport rather than letting JSON serialization execute caller-owned behavior;
- keeps the existing deeper intent/paint/rule/pattern source boundaries intact instead of replacing them;
- changes no surface vocabulary, MorphTile runtime primitive, compatibility pin, reviewed pixel authority or aesthetic judgement.

Fail-first evidence is preserved at exact test-only head `f0c59f6b56b93010c1f5a102eb99fa409895e617`. Actions run `35552717637` failed `npm test` with the four new request-boundary regressions failing before the repair; render/evidence stages were correctly skipped. Exact repaired-head producer and render evidence must remain authoritative after every later candidate mutation.

## Reusable rules learned

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

The current candidate belongs in Surface Machine. It repairs how the Surface producer establishes its own caller/request boundary before compiling material intent. MorphTile v0.4 already defines the universal ordinary material substrate: base color, optional `emissive`, `glow`, `checker|stripes|noise` + scale, and per-triangle paint with `x/y/z`, `nx/ny/nz` and `up`, plus deterministic rendering. No missing universal material representation/runtime primitive was demonstrated, so no MorphTile-core candidate is justified.

Surface remains deliberately pinned to exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`; current-core freshness alone is not a reason to manufacture compatibility churn.

## Evidence boundary

- Integrated Surface baseline before PR #24: `5e29c258a92f522374f6819e2b470582865f8557`.
- Fail-first PR #24 head `f0c59f6b56b93010c1f5a102eb99fa409895e617`, Actions `35552717637`: 260 PASS / 4 FAIL, with exactly the four new request-envelope regressions failing; render/evidence stages skipped.
- Producer CI and the real render-evidence path must pass on every exact repaired candidate head before `TECHNICALLY VALID` is claimed for that head.
- Independent Verification remains separate from producer CI.
- Existing reviewed render evidence and technical observation evidence may remain green without implying this request-boundary repair improved appearance.
- `VISUALLY GOOD` remains `NOT_ASSESSED`.

## HELD / open

- Independent Verification and Creation Director integration of Surface PR #24.
- Compatibility beyond exact tested MorphTile `26b89a77f6a90715a6742dc4d084008ba63731b6`.
- Any promotion of gradient, stripes or base-control pixels into reviewed-baseline authority.
- `VISUALLY GOOD` / aesthetic acceptance.
- No arbitrary-direction/vector-facing rule without a demonstrated request.
- No radial/ring/noise creation vocabulary merely because raw MorphTile paint could express it.
- No arbitrary/noise pattern vocabulary merely because MorphTile core exposes `noise` at runtime.
- No speculative `emissive`/`glow` creation contract merely because those fields exist in MorphTile core; a real creation request must earn the named Surface semantics and evidence boundary.
- No Surface claim that arbitrary caller expressions are semantically valid merely because their portable envelope is preserved.
- No automatic aesthetic acceptance, production readiness, CANON, or compatibility widening without exact evidence.
