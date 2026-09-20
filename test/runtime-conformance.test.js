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
const GRADIENT_START = [0.1, 0.2, 0.3];
const GRADIENT_END = [0.9, 0.8, 0.7];
const MIXED_GRADIENT_START = [0.9, 0.1, 0.8];
const MIXED_GRADIENT_END = [0.1, 0.8, 0.2];

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

function gradientRequest(axis = "y", options = {}) {
  const from = options.from === undefined ? -0.5 : options.from;
  const to = options.to === undefined ? 0.5 : options.to;
  const startColor = options.start_color === undefined ? GRADIENT_START : options.start_color;
  const endColor = options.end_color === undefined ? GRADIENT_END : options.end_color;
  return {
    envelope_version: "0.1",
    request_id: options.request_id || `runtime-axis-gradient-${axis}`,
    goal: "Exercise bounded axis gradient semantics in MorphTile",
    intent: {
      base_color: [0.2, 0.25, 0.3],
      surface_rule: {
        kind: "axis_gradient",
        axis,
        from,
        to,
        start_color: startColor,
        end_color: endColor
      }
    },
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

function assertGradientBounds(compiled, startColor, endColor, name) {
  assert.ok(compiled.K.some((color) => sameColor(color, startColor)), `${name}: expected exact clamped start color`);
  assert.ok(compiled.K.some((color) => sameColor(color, endColor)), `${name}: expected exact clamped end color`);
  for (const color of compiled.K) {
    assert.equal(color.length, 3, `${name}: paint receipt must remain RGB`);
    for (let i = 0; i < 3; i++) {
      const low = Math.min(startColor[i], endColor[i]);
      const high = Math.max(startColor[i], endColor[i]);
      assert.ok(
        Number.isFinite(color[i]) && color[i] >= low && color[i] <= high,
        `${name}: gradient channel escaped declared bounds at channel ${i}: ${color[i]} not in [${low}, ${high}]`
      );
    }
  }
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

integrationTest("pinned MorphTile runtime executes axis gradients as clamped position-based paint", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const baseline = compileCandidate(MorphTile, run(materialRequest("surface-gradient-baseline")), "surface gradient baseline");

  for (const axis of ["x", "y", "z"]) {
    const compiled = compileCandidate(MorphTile, run(gradientRequest(axis)), `surface runtime axis gradient ${axis}`);
    assert.deepEqual(compiled.P, baseline.P, `${axis}: gradient must not rewrite geometry positions`);
    assert.deepEqual(compiled.T, baseline.T, `${axis}: gradient must not rewrite base triangle material colors`);

    const unique = new Set(compiled.K.map((color) => JSON.stringify(color)));
    assert.ok(unique.size >= 3, `${axis}: expected gradient to produce multiple position-dependent paint colors`);
    assertGradientBounds(compiled, GRADIENT_START, GRADIENT_END, axis);
  }
});

integrationTest("pinned MorphTile runtime preserves exact mixed-direction gradient endpoints and channel bounds", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const baseline = compileCandidate(MorphTile, run(materialRequest("surface-gradient-mixed-baseline")), "surface mixed gradient baseline");
  const request = gradientRequest("y", {
    request_id: "runtime-axis-gradient-y-mixed-endpoints",
    from: -0.25,
    to: 0.25,
    start_color: MIXED_GRADIENT_START,
    end_color: MIXED_GRADIENT_END
  });
  const compiled = compileCandidate(MorphTile, run(request), "surface runtime mixed-direction gradient");

  assert.deepEqual(compiled.P, baseline.P, "mixed gradient must not rewrite geometry positions");
  assert.deepEqual(compiled.T, baseline.T, "mixed gradient must not rewrite base triangle material colors");
  assertGradientBounds(compiled, MIXED_GRADIENT_START, MIXED_GRADIENT_END, "mixed gradient");
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
