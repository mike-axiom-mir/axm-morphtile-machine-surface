# Surface render evidence

This repository keeps **TECHNICALLY VALID**, **RENDERED**, **VISUALLY OBSERVED**, and **VISUALLY GOOD** as different claims.

The render-evidence lane exists to make the first two claims reproducible without silently upgrading either into aesthetic approval.

## Deterministic path

`npm run evidence:render` runs two existing bounded Surface requests:

- `fixtures/request.facing-up.json`
- `fixtures/request.pattern-checker.json`

For each request the tool:

1. runs Surface Machine and requires a material `CANDIDATE`;
2. creates a disposable workspace from the exact pinned MorphTile runtime;
3. applies the material to `mt_tower` through MorphTile clone → edit → plan → commit;
4. renders the workspace with MorphTile's own built-in rasterizer at one fixed camera and resolution;
5. requires the target tower to occupy rendered pixels;
6. records MorphTile's exact `renderReceipt` SHA-256;
7. encodes the frame with the pinned runtime's own dependency-free PNG encoder;
8. compares the result with the explicit pixel baseline in `fixtures/render-evidence.expected.json`;
9. fails closed if runtime identity, request identity, target coverage, case set, or rendered pixels drift.

CI uploads `facing-up.png`, `checker.png`, and `receipt.json` as the `surface-render-evidence` artifact.

## Evidence meanings

- `TECHNICALLY_RENDERED`: the exact Surface candidate reached the exact pinned MorphTile rasterizer and produced a frame.
- pixel baseline `PASS`: the frame is pixel-identical to the explicit reviewed baseline for the exact pin.
- `VISUALLY OBSERVED`: a human or AI observer actually opened the generated image and can state only what was visibly observed.
- `VISUALLY GOOD`: a separate aesthetic judgement. Pixel identity and technical rendering do not earn it.

The machine-generated receipt deliberately writes `visual_judgement: NOT_REVIEWED`. An observer must not silently rewrite that field merely because the PNG exists.

## Baseline discipline

A pixel hash is a **drift sentinel**, not an aesthetic score. If it changes, do not auto-accept the new hash. First determine whether the cause is:

- an intentional Surface semantic change;
- a MorphTile raster/runtime change;
- camera/evidence-harness drift;
- or a regression.

Only after the change is understood should the explicit baseline be updated. This keeps visual drift visible while still allowing intentional visual evolution.

## Current bounded observation

The first generated artifact for the exact runtime pin `ef2b3c6986aa1a333247feffc43a8443f17239d0` was opened during the producer activation. In both frames `mt_tower` is visible, and the `facing-up` and `checker` frames are visibly distinct. That observation is **not** a claim that either look is aesthetically good.

Current reviewed drift sentinels:

- `facing-up`: `54ca8766c52bb13e8a55268f5794a638befc49fc6045189826059e30f327fb1e`
- `checker`: `a440cf8410e48730fef743fd1c86bfd88c49e982c912c662a89d68b27549d73d`

## Run locally

Point the machine at the exact MorphTile core identity declared in `machine.json`:

```sh
MORPHTILE_CORE_PATH=/path/to/axm-morphtile/core/morphtile.js \
MORPHTILE_COMMIT=ef2b3c6986aa1a333247feffc43a8443f17239d0 \
npm run evidence:render
```

The command is offline after both repositories are present locally. No Surface runtime dependency on MorphTile is introduced; the exact runtime is supplied only to this evidence path.
