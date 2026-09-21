const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function requestWithRule(rule) {
  return {
    ...fixture,
    request_id: "surface-rule-discriminator-coercion",
    intent: {
      ...fixture.intent,
      surface_rule: rule
    }
  };
}

function hostileStructuredValue() {
  return {
    toString: "not-callable",
    valueOf: "not-callable"
  };
}

test("structured surface_rule.kind HOLDs with stable Surface identity instead of host coercion failure", () => {
  const request = requestWithRule({
    ...fixture.intent.surface_rule,
    kind: hostileStructuredValue()
  });
  const before = JSON.stringify(request);
  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_KIND_UNKNOWN");
  assert.match(out.holds[0].detail, /surface_rule\.kind/);
  assert.equal(out.candidate, null);
  assert.equal(JSON.stringify(request), before);
});

test("structured facing direction HOLDs with stable Surface identity instead of property-key coercion", () => {
  const request = requestWithRule({
    ...fixture.intent.surface_rule,
    direction: hostileStructuredValue()
  });
  request.request_id = "surface-rule-direction-coercion";
  const before = JSON.stringify(request);
  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_DIRECTION_UNKNOWN");
  assert.match(out.holds[0].detail, /surface_rule\.direction/);
  assert.equal(out.candidate, null);
  assert.equal(JSON.stringify(request), before);
});
