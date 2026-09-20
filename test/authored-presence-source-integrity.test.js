const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("nested compiled authoring does not silently drop non-enumerable authored fields", () => {
  const rule = {
    kind: "facing",
    direction: "up",
    threshold: 0.6,
    match_color: [0.9, 0.8, 0.7],
    else_color: [0.1, 0.2, 0.3]
  };
  Object.defineProperty(rule, "hidden_note", {
    value: "authored",
    enumerable: false,
    writable: true,
    configurable: true
  });
  const before = Object.getOwnPropertyDescriptor(rule, "hidden_note");

  const request = clone(fixture);
  request.request_id = "surface-rule-nonenumerable-authored-presence";
  request.intent = { surface_rule: rule };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /hidden_note.*non-enumerable/);
  assert.equal(out.candidate, null);
  assert.deepEqual(Object.getOwnPropertyDescriptor(rule, "hidden_note"), before);
});

test("a non-enumerable known rule field cannot collapse into the compiler default", () => {
  const rule = {
    kind: "facing",
    direction: "up",
    match_color: [0.9, 0.8, 0.7],
    else_color: [0.1, 0.2, 0.3]
  };
  Object.defineProperty(rule, "threshold", {
    value: 0.2,
    enumerable: false,
    writable: true,
    configurable: true
  });

  const request = clone(fixture);
  request.request_id = "surface-rule-nonenumerable-known-field-presence";
  request.intent = { surface_rule: rule };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /threshold.*non-enumerable/);
  assert.equal(out.candidate, null);
});

test("explicit undefined pattern scale cannot collapse into the default scale", () => {
  const request = clone(fixture);
  request.request_id = "surface-pattern-explicit-undefined-presence";
  request.intent = { pattern: { kind: "checker", scale: undefined } };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PATTERN_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /scale.*undefined/);
  assert.equal(out.candidate, null);
});

test("explicit undefined facing threshold cannot collapse into the default threshold", () => {
  const request = clone(fixture);
  request.request_id = "surface-rule-explicit-undefined-threshold-presence";
  request.intent = {
    surface_rule: {
      kind: "facing",
      direction: "up",
      threshold: undefined,
      match_color: [0.9, 0.8, 0.7],
      else_color: [0.1, 0.2, 0.3]
    }
  };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /threshold.*undefined/);
  assert.equal(out.candidate, null);
});

test("explicit undefined top-level intent fields cannot collapse into omission", () => {
  const request = clone(fixture);
  request.request_id = "surface-intent-explicit-undefined-presence";
  request.intent = { pattern: undefined };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /intent\.pattern.*undefined/);
  assert.equal(out.candidate, null);
});
