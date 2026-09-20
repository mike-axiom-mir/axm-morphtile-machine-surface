const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");
const { normalizeSurfaceIntent } = require("../src/surface-intent");
const { compileSurfaceRule } = require("../src/surface-rules");
const { compileSurfacePattern } = require("../src/surface-patterns");

function isNegativeZero(value) {
  return typeof value === "number" && Object.is(value, -0);
}

function request(intent) {
  return {
    envelope_version: "0.1",
    request_id: "surface-compiled-signed-zero-semantics",
    goal: "Make signed-zero normalization an explicit compiled Surface semantic instead of a JSON transport accident",
    intent,
    provenance: { caller: "compiled-signed-zero-semantics-test" }
  };
}

test("compiled base_color canonicalizes signed zero before envelope transport", () => {
  const normalized = normalizeSurfaceIntent({ base_color: [-0, 0.25, -0] });
  assert.equal(isNegativeZero(normalized.base_color[0]), false);
  assert.equal(isNegativeZero(normalized.base_color[2]), false);
  assert.deepEqual(normalized.base_color, [0, 0.25, 0]);

  const out = run(request({ base_color: [-0, 0.25, -0] }));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.value.data.color, [0, 0.25, 0]);
});

test("facing compiler canonicalizes signed zero in owned scalar and color semantics", () => {
  const compiled = compileSurfaceRule({
    kind: "facing",
    direction: "up",
    threshold: -0,
    match_color: [-0, 0.5, 1],
    else_color: [1, -0, 0.25]
  });

  assert.equal(isNegativeZero(compiled.normalized.threshold), false);
  assert.equal(isNegativeZero(compiled.normalized.match_color[0]), false);
  assert.equal(isNegativeZero(compiled.normalized.else_color[1]), false);
  assert.equal(isNegativeZero(compiled.paint.color[0][1][2]), false, "compiled threshold must already be canonical before result cloning");
});

test("axis_gradient compiler canonicalizes signed-zero endpoints and colors before transport", () => {
  const fromZero = compileSurfaceRule({
    kind: "axis_gradient",
    axis: "x",
    from: -0,
    to: 1,
    start_color: [-0, 0.2, 0.3],
    end_color: [0.8, 0.9, -0]
  });
  assert.equal(isNegativeZero(fromZero.normalized.from), false);
  assert.equal(isNegativeZero(fromZero.normalized.start_color[0]), false);
  assert.equal(isNegativeZero(fromZero.normalized.end_color[2]), false);

  const toZero = compileSurfaceRule({
    kind: "axis_gradient",
    axis: "z",
    from: -1,
    to: -0,
    start_color: [0.1, 0.2, 0.3],
    end_color: [0.7, 0.8, 0.9]
  });
  assert.equal(isNegativeZero(toZero.normalized.to), false);
});

test("pass-through paint keeps the stricter signed-zero HOLD boundary", () => {
  const out = run(request({
    paint: {
      color: [["/", 1, -0], 0.5, 0.25]
    }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
});

test("positive-only pattern scale does not reinterpret signed zero as a valid default", () => {
  assert.throws(
    () => compileSurfacePattern({ kind: "checker", scale: -0 }),
    (error) => error && error.code === "HOLD_SURFACE_PATTERN_SCALE_INVALID"
  );
});
