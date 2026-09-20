# MorphTile integration

Tested contract target:

- repository: mike-axiom-mir/axm-morphtile
- commit: ef2b3c6986aa1a333247feffc43a8443f17239d0
- format: v0.4
- provisional envelope: v0.1
- fixture set: v0.5.1

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through clone/plan, inspect conflicts and HOLDs, commit only with the applicable authority, preserve the receipt, and retain rollback.

## Exact pinned-runtime conformance lane

CI checks out the exact `tested_against.commit` above into an isolated `.runtime/morphtile` path and asserts that the CI runtime identity equals the manifest pin.

The runtime suite passes all six named facing-rule candidates through real MorphTile `createTile`, `validateTile`, and `compileMesh`. For the pinned default box mesh, each named direction must paint exactly one face with `match_color` and the other five faces with `else_color`; exact triangle, position, material-color and face-count receipts make drift visible.

v0.5+ executes `axis_gradient` for each of `x`, `y`, and `z`. The gradient candidate must preserve baseline geometry positions and base triangle material colors, produce multiple position-dependent procedural-paint colors, reach the declared clamped endpoint colors on the pinned box, and keep every emitted paint channel finite and inside the interval bounded by the two authored endpoints.

v0.5.1 adds the adversarial boundary that v0.5.0 missed: a mixed ascending/descending RGB gradient (`start=[0.9,0.1,0.8]`, `end=[0.1,0.8,0.2]`, `from=-0.25`, `to=0.25`) must reproduce both authored endpoint triplets exactly and remain within each channel's authored interval. Endpoint identity is implemented by explicit branches; interpolation arithmetic is used only for interior positions.

The suite also executes the existing caller-authored raw-paint fixture in the same runtime. Surface Machine validates the bounded paint envelope, but MorphTile execution supplies the semantic evidence: the default box must produce exactly one upward face with the authored match channel values and five faces with the fallback values.

v0.4+ replays MorphTile's existing `checker` and `stripes` material semantics. Each named pattern must preserve the exact geometry positions and procedural-paint colors from an otherwise identical baseline while applying only its declared deterministic triangle attenuation factor (`0.62` for checker, `0.55` for stripes) to a non-empty subset of triangles and leaving a non-empty complementary subset unchanged.

Authored numeric-looking values are validated before normalization. Surface Machine must not reinterpret strings, booleans, or null through numeric coercion when the authoring contract requires a number. Pattern scale and gradient ranges follow the same rule.

Compatibility is earned by replaying these semantic receipts against the exact manifest pin rather than inferred from source similarity.

This checkout is test infrastructure only. Surface Machine does not vendor MorphTile or add a runtime dependency on the repository.

No compatibility is claimed with commits newer or older than the exact tested snapshot unless their conformance tests are run.
