# MorphTile integration

Tested contract target:

- repository: mike-axiom-mir/axm-morphtile
- commit: 4346df01ed18cd1336064f9323d7766ff4f6338a
- format: v0.4
- provisional envelope: v0.1
- fixture set: v0.2

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through clone/plan, inspect conflicts and HOLDs, commit only with the applicable authority, preserve the receipt, and retain rollback.

## Exact pinned-runtime conformance lane

CI checks out the exact `tested_against.commit` above into an isolated `.runtime/morphtile` path. The runtime test passes all six named facing-rule candidates through real MorphTile `createTile`, `validateTile`, and `compileMesh`.

For the pinned default box mesh, each named direction must deterministically paint exactly one face with `match_color` and the other five faces with `else_color`. Exact triangle, position, material-color, and per-direction face-count receipts make runtime drift visible.

The CI-declared runtime commit must equal `machine.json.tested_against.commit`, so the compatibility claim cannot silently drift to another MorphTile checkout.

This candidate advances the pin from the older MorphTile snapshot `13d83a2b2c0d12644442d3d9e45bcbe0af19876a` to exact current-main snapshot `4346df01ed18cd1336064f9323d7766ff4f6338a`. That newer snapshot is six commits ahead and includes substantial core changes, so compatibility is earned by replaying the same semantic receipts rather than inferred from source similarity.

This checkout is test infrastructure only. Surface Machine does not vendor MorphTile or add a runtime dependency on the repository.

No compatibility is claimed with commits newer or older than the exact tested snapshot unless their conformance tests are run.
