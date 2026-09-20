# MorphTile integration

Tested contract target:

- repository: mike-axiom-mir/axm-morphtile
- commit: a579182ae585e5722ac87dd0cc8209963b18d000
- format: v0.4
- provisional envelope: v0.1
- fixture set: v0.3

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through clone/plan, inspect conflicts and HOLDs, commit only with the applicable authority, preserve the receipt, and retain rollback.

## Exact pinned-runtime conformance lane

CI checks out the exact `tested_against.commit` above into an isolated `.runtime/morphtile` path and asserts that the CI runtime identity equals the manifest pin.

The runtime suite passes all six named facing-rule candidates through real MorphTile `createTile`, `validateTile`, and `compileMesh`. For the pinned default box mesh, each named direction must paint exactly one face with `match_color` and the other five with `else_color`; exact triangle, position, material-color and face-count receipts make drift visible.

The suite also executes the existing caller-authored raw-paint fixture in the same runtime. Surface Machine validates the bounded paint envelope, but MorphTile execution supplies the semantic evidence: the default box must produce exactly one upward face with the authored match channel values and five faces with the fallback values.

Authored numeric-looking values are validated before normalization. Surface Machine must not reinterpret strings, booleans, or null through numeric coercion when the authoring contract requires a number.

The compatibility pin advances from `59ae96ef5394ca4b68441aa7da6e1c4084c48673` to `a579182ae585e5722ac87dd0cc8209963b18d000`. Compatibility is earned by replaying the semantic receipts rather than inferred from source similarity.

This checkout is test infrastructure only. Surface Machine does not vendor MorphTile or add a runtime dependency on the repository.

No compatibility is claimed with commits newer or older than the exact tested snapshot unless their conformance tests are run.
