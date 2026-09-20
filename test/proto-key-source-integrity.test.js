const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("compiled authoring preserves an own enumerable __proto__ key until semantic validation", () => {
  const rule = {
    kind: "facing",
    direction: "up",
    threshold: 0.6,
    match_color: [0.9, 0.8, 0.7],
    else_color: [0.1, 0.2, 0.3]
  };
  Object.defineProperty(rule, "__proto__", {
    value: "authored-data",
    enumerable: true,
    writable: true,
    configurable: true
  });

  const sourcePrototype = Object.getPrototypeOf(rule);
  const sourceDescriptor = Object.getOwnPropertyDescriptor(rule, "__proto__");
  const objectPrototypeBefore = Object.getOwnPropertyDescriptor(Object.prototype, "authored-data");

  const request = clone(fixture);
  request.request_id = "surface-rule-proto-key-source-integrity";
  request.intent = { surface_rule: rule };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_FIELD_UNKNOWN");
  assert.match(out.holds[0].detail, /unknown surface_rule field: __proto__/);
  assert.equal(out.candidate, null);

  assert.equal(Object.getPrototypeOf(rule), sourcePrototype, "caller source prototype must remain unchanged");
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(rule, "__proto__"),
    sourceDescriptor,
    "caller-authored __proto__ descriptor must remain unchanged"
  );
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(Object.prototype, "authored-data"),
    objectPrototypeBefore,
    "snapshotting must not mutate Object.prototype"
  );
});
