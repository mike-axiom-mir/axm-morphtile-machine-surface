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

function requestWithPaint(expression, requestId) {
  const request = clone(fixture);
  request.request_id = requestId;
  request.intent = {
    base_color: [0.5, 0.5, 0.5],
    paint: {
      color: [expression, 0.55, 0.2],
      vars: { threshold: 0.6 }
    }
  };
  return request;
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

test("caller paint rejects a serialization hook instead of letting transport rewrite an expression", () => {
  const calls = { count: 0 };
  const expression = hiddenToJSON({ authored: "opaque-expression" }, ["var", "ny"], calls);
  const request = requestWithPaint(expression, "surface-paint-tojson-source-integrity");

  const out = run(request);

  assert.equal(calls.count, 0, "paint normalization must not invoke the expression's toJSON hook");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color\[0\]\.toJSON/);
  assert.equal(out.candidate, null);
  assert.equal(request.intent.paint.color[0], expression);
});

test("caller paint rejects top-level accessors before executing caller-controlled code", () => {
  let accessorCalls = 0;
  const authoredColor = [["+", 0.2, ["*", 0.3, ["var", "ny"]]], 0.55, 0.2];
  const paint = { vars: { gain: 0.3 } };
  const colorGetter = function colorGetter() {
    accessorCalls += 1;
    return authoredColor;
  };
  Object.defineProperty(paint, "color", {
    enumerable: true,
    configurable: true,
    get: colorGetter
  });

  const request = clone(fixture);
  request.request_id = "surface-paint-accessor-source-integrity";
  request.intent = { base_color: [0.2, 0.25, 0.3], paint };
  const descriptorBefore = Object.getOwnPropertyDescriptor(paint, "color");

  const out = run(request);

  const descriptorAfter = Object.getOwnPropertyDescriptor(paint, "color");
  assert.equal(accessorCalls, 0, "paint normalization must reject the accessor without executing it");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color uses an accessor/);
  assert.equal(out.candidate, null);
  assert.equal(descriptorAfter.get, descriptorBefore.get);
  assert.equal(descriptorAfter.enumerable, descriptorBefore.enumerable);
  assert.equal(descriptorAfter.configurable, descriptorBefore.configurable);
});

test("caller paint rejects values that JSON would silently rewrite to null", () => {
  const expression = ["+", 0.2, undefined];
  const request = requestWithPaint(expression, "surface-paint-undefined-source-integrity");

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color\[0\]\[2\]/);
  assert.equal(out.candidate, null);
  assert.equal(request.intent.paint.color[0][2], undefined);
});
