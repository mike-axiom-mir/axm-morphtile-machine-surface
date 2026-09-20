const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const baseRequest = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

const DIRECTIONS = ["up", "down", "left", "right", "forward", "back"];
const MATCH = [0.9, 0.55, 0.2];
const OTHERWISE = [0.25, 0.3, 0.4];

function requestFor(direction) {
  return {
    ...baseRequest,
    request_id: `runtime-facing-${direction}`,
    intent: {
      ...baseRequest.intent,
      surface_rule: {
        ...baseRequest.intent.surface_rule,
        direction,
        match_color: MATCH,
        else_color: OTHERWISE
      }
    }
  };
}

function sameColor(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

integrationTest("pinned MorphTile runtime executes every named facing rule with stable surface receipts", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  for (const direction of DIRECTIONS) {
    const result = run(requestFor(direction));
    assert.equal(result.status, "CANDIDATE", direction);
    assert.equal(result.candidate.facet, "material", direction);

    const tile = MorphTile.createTile({
      name: `surface runtime ${direction}`,
      facets: { material: result.candidate.value }
    });
    const validity = MorphTile.validateTile(tile);
    assert.equal(validity.ok, true, `${direction}: ${validity.errors.join(", ")}`);

    const compiled = MorphTile.compileMesh(tile);
    assert.equal(compiled.hold, null, direction);
    assert.equal(compiled.T.length, 108, `${direction}: pinned box triangle receipt drifted`);
    assert.equal(compiled.P.length, 108 * 9, `${direction}: pinned box position receipt drifted`);
    assert.equal(compiled.K.length, 108, `${direction}: material receipt length drifted`);

    let matched = 0;
    let otherwise = 0;
    for (const color of compiled.K) {
      if (sameColor(color, MATCH)) matched += 1;
      else if (sameColor(color, OTHERWISE)) otherwise += 1;
      else assert.fail(`${direction}: unexpected painted color ${JSON.stringify(color)}`);
    }

    assert.equal(matched, 18, `${direction}: expected exactly one box face to match`);
    assert.equal(otherwise, 90, `${direction}: expected the other five box faces to use else_color`);
  }
});
