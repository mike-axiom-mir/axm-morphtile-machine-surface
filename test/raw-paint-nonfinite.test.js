const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.up-facing.json");
const { run } = require("../src");

function requestWithPaintExpression(expression, id) {
  return {
    envelope_version: fixture.envelope_version,
    request_id: id,
    goal: fixture.goal,
    intent: {
      base_color: fixture.intent.base_color.slice(),
      paint: {
        color: [expression, 0.55, 0.2],
        vars: { ...(fixture.intent.paint.vars || {}) }
      }
    },
    provenance: { caller: "raw-paint-nonfinite-test" }
  };
}

test("caller paint rejects nested Infinity before JSON cloning can rewrite it to null", () => {
  const request = requestWithPaintExpression(["+", 0.2, Infinity], "surface-paint-infinity");
  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONFINITE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color\[0\]\[2\]/);
  assert.equal(out.candidate, null);
  assert.equal(request.intent.paint.color[0][2], Infinity, "validation must not rewrite the caller request while rejecting it");
});

test("caller paint rejects nested NaN before portable-envelope cloning", () => {
  const request = requestWithPaintExpression(["*", NaN, ["var", "ny"]], "surface-paint-nan");
  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONFINITE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color\[0\]\[1\]/);
  assert.equal(out.candidate, null);
  assert.equal(Number.isNaN(request.intent.paint.color[0][1]), true);
});

test("finite nested caller paint still passes through unchanged and stays runtime-owned", () => {
  const expression = ["+", 0.2, ["*", 0.3, ["var", "ny"]]];
  const request = requestWithPaintExpression(expression, "surface-paint-finite-nested");
  const before = JSON.stringify(request.intent.paint);
  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(out.candidate.value.data.paint), before);
  assert.equal(out.warnings[0].code, "CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED");
});
