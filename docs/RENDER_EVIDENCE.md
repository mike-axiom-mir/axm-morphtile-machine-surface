# Surface render evidence

This repository keeps **TECHNICALLY VALID**, **RENDERED**, **VISUALLY OBSERVED**, and **VISUALLY GOOD** as different claims.

The render-evidence lane exists to make the first two claims reproducible without silently upgrading either into aesthetic approval.

## Three evidence scopes

Render evidence intentionally has three scopes rather than one undifferentiated list.

### Reviewed pixel baseline

`npm run evidence:render` keeps these two previously reviewed drift sentinels under exact pixel-baseline authority:

- `fixtures/request.facing-up.json`
- `fixtures/request.pattern-checker.json`

For each reviewed request the tool requires an explicit Surface producer identity, runs Surface Machine, applies the material to `mt_tower` through a disposable MorphTile clone → edit → plan → commit path, renders with MorphTile's own pinned rasterizer, requires target coverage, records the exact render SHA-256, and compares it with `fixtures/render-evidence.expected.json`.

The baseline verifier fails closed if producer identity, runtime identity, request identity, target coverage, reviewed case set, or reviewed pixels drift.

### Unbaselined deterministic observations

Two already-existing Surface semantics run as separate technical observations:

- `fixtures/request.axis-gradient.json`
- `fixtures/request.pattern-stripes.json`

Each observation renders the exact same request twice through the pinned MorphTile runtime and requires both render hashes and target-pixel coverage values to match. The resulting receipt remains explicitly:

- `deterministic_replay: PASS`
- `pixel_baseline: NOT_ESTABLISHED`
- `evidence_tier: TECHNICALLY_RENDERED_UNBASELINED`
- `visual_judgement: NOT_REVIEWED`

This proves repeatable technical rendering, not reviewed pixel authority and not aesthetic quality.

### Explicit effect control

Repeatable rendering alone does not prove that a named surface treatment changed the target. Render-evidence v0.4 therefore adds `fixtures/request.base-control.json`, an ordinary base-only Surface request using the same base colour as the gradient and stripes fixtures.

The control is itself rendered twice and marked `TECHNICALLY_RENDERED_CONTROL`. For each named observation the harness compares subject and control frames only on `mt_tower` pixels. It requires identical target pick coverage and at least one changed target RGBA pixel before emitting:

- `effect_delta.status: PASS`
- the exact control id and request id;
- the control render SHA-256;
- total target pixels;
- changed target pixels.

If target coverage changes, comparable pixel buffers are unavailable, or the named treatment is pixel-identical to its explicit control on the target, the evidence path fails closed. This is technical effect evidence only. It still does not say the effect looks good.

The evidence registry also fails closed if two reviewed cases, observations, or controls reuse the same case id or request id. Portable receipts therefore cannot silently become ambiguous as coverage grows.

CI uploads `facing-up.png`, `checker.png`, `axis-gradient.png`, `stripes.png`, `base-control.png`, and `receipt.json` as the `surface-render-evidence` artifact.

## Evidence meanings

- exact producer provenance: the portable receipt names the Surface repository + exact producer commit supplied by the caller/CI; this is separate from both pixel identity and MorphTile runtime identity.
- `TECHNICALLY_RENDERED`: the exact Surface candidate reached the exact pinned MorphTile rasterizer and produced a frame.
- deterministic replay `PASS`: two exact-input renders on the same pinned runtime produced the same pixel hash and target coverage.
- effect delta `PASS`: the named treatment preserved target coverage and changed one or more target pixels relative to an explicit Surface-authored control.
- pixel baseline `PASS`: a reviewed case is pixel-identical to the explicit drift baseline for the exact runtime pin and externally supplied producer revision.
- pixel baseline `NOT_ESTABLISHED`: a technical render exists and is reproducible, but no reviewed pixel identity has been granted to that case.
- `VISUALLY OBSERVED`: a human or AI observer actually opened the generated image and can state only what was visibly observed.
- `VISUALLY GOOD`: a separate aesthetic judgement. Pixel identity, deterministic replay, and effect-delta evidence do not earn it.

The machine-generated receipt deliberately writes `visual_judgement: NOT_REVIEWED`. An observer must not silently rewrite that field merely because the PNG exists.

## Provenance discipline

Pixel equality is content identity, not source provenance. A portable render receipt therefore carries two independent revision identities:

- Surface producer: `mike-axiom-mir/axm-morphtile-machine-surface` + exact commit;
- MorphTile runtime: `mike-axiom-mir/axm-morphtile` + exact commit.

The Surface commit is supplied explicitly through `SURFACE_PRODUCER_REPOSITORY` and `SURFACE_PRODUCER_COMMIT`. The evidence tool does not run `git rev-parse` or infer source identity from the current checkout. The baseline verifier requires a separately supplied expected producer identity and rejects a missing or mismatched producer revision.

## Baseline discipline

A pixel hash is a **drift sentinel**, not an aesthetic score. If a reviewed hash changes, do not auto-accept the new hash. First determine whether the cause is an intentional Surface semantic change, a MorphTile raster/runtime change, camera/evidence-harness drift, or a regression.

Only after the change is understood should the explicit baseline be updated. Unbaselined observations and technical controls are deliberately excluded from reviewed-baseline authority; changing either cannot silently broaden the reviewed set.

## Current bounded observation

The reviewed `facing-up` and `checker` frames were previously opened and `mt_tower` was visible in both materially distinct frames. That observation is **not** a claim that either look is aesthetically good.

Current reviewed drift sentinels:

- `facing-up`: `54ca8766c52bb13e8a55268f5794a638befc49fc6045189826059e30f327fb1e`
- `checker`: `a440cf8410e48730fef743fd1c86bfd88c49e982c912c662a89d68b27549d73d`

Axis-gradient and stripes remain outside reviewed pixel authority. Their deterministic replay and effect-delta receipts are technical evidence only until separate observation/review establishes broader visual claims.

## Run locally

Point the machine at the exact MorphTile core identity declared in `machine.json` and explicitly identify the Surface source revision being tested:

```sh
MORPHTILE_CORE_PATH=/path/to/axm-morphtile/core/morphtile.js \
MORPHTILE_COMMIT=26b89a77f6a90715a6742dc4d084008ba63731b6 \
SURFACE_PRODUCER_REPOSITORY=mike-axiom-mir/axm-morphtile-machine-surface \
SURFACE_PRODUCER_COMMIT=<exact-40-char-surface-commit> \
npm run evidence:render
```

The command is offline after both repositories are present locally. No Surface runtime dependency on MorphTile is introduced; the exact runtime and producer revision are supplied only to this evidence path.
