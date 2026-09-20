const test = require("node:test");
const assert = require("node:assert/strict");
const rawFixture = require("../fixtures/request.up-facing.json");
const facingFixture = require("../fixtures/request.facing-up.json");
const { MACHINE, run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("machine v0.3 fails closed on malformed or unknown top-level surface intent", () => {
  assert.equal(MACHINE.version, "0.3.0");

  for (const intent of ["paint", [], 7]) {
    const out = run({ ...rawFixture, request_id: "surface-intent-invalid-" + String(intent), intent });
    assert.equal(out.status, "HOLD");
    assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_INVALID");
  }

  const request = clone(rawFixture);
  request.request_id = "surface-intent-unknown";
  request.intent.z_extra = true;
  request.intent.a_extra = true;
  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_FIELD_UNKNOWN");
  assert.equal(out.holds[0].detail, "unknown intent fields: a_extra, z_extra");
});

test("base color is bounded instead of being emitted as unverified material data", () => {
  const malformed = clone(facingFixture);
  malformed.request_id = "surface-base-color-shape";
  malformed.intent.base_color = [0.2, 0.3];
  assert.equal(run(malformed).holds[0].code, "HOLD_SURFACE_COLOR_INVALID");

  const outOfRange = clone(facingFixture);
  outOfRange.request_id = "surface-base-color-range";
  outOfRange.intent.base_color = [0.2, 1.2, 0.3];
  assert.equal(run(outOfRange).holds[0].code, "HOLD_SURFACE_COLOR_INVALID");
});

test("caller paint fails closed on ignored fields, malformed channels and non-numeric vars", () => {
  const unknown = clone(rawFixture);
  unknown.request_id = "surface-paint-unknown";
  unknown.intent.paint.threshhold = 0.5;
  assert.equal(run(unknown).holds[0].code, "HOLD_SURFACE_PAINT_FIELD_UNKNOWN");

  const shape = clone(rawFixture);
  shape.request_id = "surface-paint-shape";
  shape.intent.paint.color = [0.1, 0.2];
  assert.equal(run(shape).holds[0].code, "HOLD_SURFACE_PAINT_INVALID");

  const vars = clone(rawFixture);
  vars.request_id = "surface-paint-vars";
  vars.intent.paint.vars = { good: 1, bad: "one" };
  assert.equal(run(vars).holds[0].code, "HOLD_SURFACE_PAINT_VARS_INVALID");
});

test("valid caller paint remains pass-through but no longer overclaims expression semantics", () => {
  const request = clone(rawFixture);
  const before = JSON.stringify(request);
  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.value.data.paint, rawFixture.intent.paint);
  assert.equal(out.evidence[0].status, "PASS");
  assert.match(out.evidence[0].check, /runtime-owned/);
  assert.equal(out.warnings[0].code, "CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED");
  assert.equal(JSON.stringify(request), before);
});

test("external dependency must be an explicit non-empty capability name", () => {
  const request = clone(rawFixture);
  request.request_id = "surface-dependency-invalid";
  request.intent = { external_dependency: "   " };
  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_DEPENDENCY_INVALID");
});
