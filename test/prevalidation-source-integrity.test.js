const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hiddenToJSON(target, replacement, calls) {
  Object.defineProperty(target, "toJSON", {
    enumerable: false,
    configurable: true,
    value() {
      calls.count += 1;
      return replacement;
    }
  });
  return target;
}

test("surface_rule is validated before caller-controlled serialization can rewrite unsupported intent", () => {
  const calls = { count: 0 };
  const authoredRule = hiddenToJSON(
    { kind: "unsupported-authored-rule" },
    {
      kind: "facing",
      direction: "up",
      threshold: 0.6,
      match_color: [0.9, 0.8, 0.7],
      else_color: [0.1, 0.2, 0.3]
    },
    calls
  );
  const request = clone(fixture);
  request.request_id = "surface-rule-tojson-source-integrity";
  request.intent = { surface_rule: authoredRule };

  const out = run(request);

  assert.equal(calls.count, 0, "validation must not invoke the authored rule's toJSON hook");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_KIND_UNKNOWN");
  assert.equal(out.candidate, null);
  assert.equal(request.intent.surface_rule, authoredRule);
  assert.equal(request.intent.surface_rule.kind, "unsupported-authored-rule");
});

test("pattern is validated before caller-controlled serialization can rewrite unsupported intent", () => {
  const calls = { count: 0 };
  const authoredPattern = hiddenToJSON(
    { kind: "noise", scale: 0.75 },
    { kind: "checker", scale: 0.75 },
    calls
  );
  const request = clone(fixture);
  request.request_id = "surface-pattern-tojson-source-integrity";
  request.intent = { pattern: authoredPattern };

  const out = run(request);

  assert.equal(calls.count, 0, "validation must not invoke the authored pattern's toJSON hook");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PATTERN_KIND_UNKNOWN");
  assert.equal(out.candidate, null);
  assert.equal(request.intent.pattern, authoredPattern);
  assert.equal(request.intent.pattern.kind, "noise");
});
