const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const facingFixture = require("../fixtures/request.facing-up.json");
const rawFixture = require("../fixtures/request.up-facing.json");
const { run } = require("../src");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

const DIRECTIONS = ["up", "down", "left", "right", "forward", "back"];
const MATCH = [0.9, 0.55, 0.2];
const OTHERWISE = [0.25, 0.3, 0.4];

function requestFor(direction) {
  return {
    ...facingFixture,
    request_id: `runtime-facing-${direction}`,
    intent: {
      ...facingFixture.intent,
      surface_rule: {
        ...facingFixture.intent.surface_rule,
        direction,
        match_color: MATCH,
        else_color: OTHERWISE
      }
    }
  };
}

function materialRequest(id, pattern) {
  const intent = { base_color: [0.2, 0.25, 0.3] };
  if (pattern) intent.pattern = pattern;
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Exercise bounded material pattern semantics in MorphTile",
    intent,
    provenance: { caller: "runtime-conformance" }
  };
}

function sameColor(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function compileCandidate(MorphTile, result, name) {
  assert.equal(result.status, "CANDIDATE", name);
  assert.equal(result.candidate.facet, "material", name);

  const tile = MorphTile.createTile({
    name,
    facets: { material: result.candidate.value }
  });
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, `${name}: ${validity.errors.join(", ")}`);

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, null, name);
  assert.equal(compiled.T.length, 108, `${name}: pinned box triangle receipt drifted`);
  assert.equal(compiled.P.length, 108 * 9, `${name}: pinned box position receipt drifted`);
  assert.equal(compiled.K.length, 108, `${name}: material receipt length drifted`);
  return compiled;
}

function assertPatternFactors(patterned, baseline, factor, name) {
  assert.deepEqual(patterned.P, baseline.P, `${name}: pattern must not rewrite geometry positions`);
  assert.deepEqual(patterned.K, baseline.K, `${name}: pattern must not rewrite procedural paint colors`);

  let attenuated = 0;
  let unchanged = 0;
  for (let i = 0; i < baseline.T.length; i++) {
    if (patterned.T[i] === baseline.T[i]) unchanged += 1;
    else if (patterned.T[i] === baseline.T[i] * factor) attenuated += 1;
    else assert.fail(`${name}: triangle ${i} changed by an undeclared factor`);
  }
  assert.ok(attenuated > 0, `${name}: runtime never applied the attenuation factor`);
  assert.ok(unchanged > 0, `${name}: runtime never preserved the complementary cells`);
}

integrationTest("pinned MorphTile runtime executes every named facing rule with stable surface receipts", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  for (const direction of DIRECTIONS) {
    const compiled = compileCandidate(MorphTile, run(requestFor(direction)), `surface runtime ${direction}`);
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

integrationTest("pinned MorphTile runtime executes the caller-paint fixture instead of treating shape validation as semantic proof", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const compiled = compileCandidate(MorphTile, run(rawFixture), "surface runtime caller paint");

  let upward = 0;
  let other = 0;
  for (const color of compiled.K) {
    if (sameColor(color, [0.9, 0.5, 0.25])) upward += 1;
    else if (sameColor(color, [0.2, 0.5, 0.25])) other += 1;
    else assert.fail(`caller paint: unexpected painted color ${JSON.stringify(color)}`);
  }

  assert.equal(upward, 18, "caller paint: expected one upward-facing box face");
  assert.equal(other, 90, "caller paint: expected remaining five faces to use the fallback channel value");
});

integrationTest("pinned MorphTile runtime executes checker and stripes as bounded orthogonal material patterns", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const baseline = compileCandidate(MorphTile, run(materialRequest("surface-pattern-baseline")), "surface pattern baseline");

  const checker = compileCandidate(
    MorphTile,
    run(materialRequest("surface-pattern-checker", { kind: "checker", scale: 0.4 })),
    "surface runtime checker"
  );
  assertPatternFactors(checker, baseline, 0.62, "checker");

  const stripes = compileCandidate(
    MorphTile,
    run(materialRequest("surface-pattern-stripes", { kind: "stripes", scale: 0.4 })),
    "surface runtime stripes"
  );
  assertPatternFactors(stripes, baseline, 0.55, "stripes");
});
