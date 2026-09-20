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

function trappingProxy(target, calls) {
  return new Proxy(target, {
    getPrototypeOf(value) {
      calls.count += 1;
      return Reflect.getPrototypeOf(value);
    },
    ownKeys(value) {
      calls.count += 1;
      return Reflect.ownKeys(value);
    },
    getOwnPropertyDescriptor(value, key) {
      calls.count += 1;
      return Reflect.getOwnPropertyDescriptor(value, key);
    },
    get(value, key, receiver) {
      calls.count += 1;
      return Reflect.get(value, key, receiver);
    }
  });
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

test("caller intent descriptor-gates every authored field before executing accessors", () => {
  const fields = ["base_color", "paint", "surface_rule", "pattern", "external_dependency"];

  for (const field of fields) {
    let accessorCalls = 0;
    const request = clone(fixture);
    request.request_id = "surface-intent-accessor-" + field.replace(/_/g, "-");
    request.intent = {};
    const getter = function authoredIntentGetter() {
      accessorCalls += 1;
      return null;
    };
    Object.defineProperty(request.intent, field, {
      enumerable: true,
      configurable: true,
      get: getter
    });
    const descriptorBefore = Object.getOwnPropertyDescriptor(request.intent, field);

    const out = run(request);

    const descriptorAfter = Object.getOwnPropertyDescriptor(request.intent, field);
    assert.equal(accessorCalls, 0, field + " accessor must not execute before Surface decides admissibility");
    assert.equal(out.status, "HOLD");
    assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_NONPORTABLE_VALUE");
    assert.match(out.holds[0].detail, new RegExp("intent\\." + field + " uses an accessor"));
    assert.equal(out.candidate, null);
    assert.equal(descriptorAfter.get, descriptorBefore.get);
    assert.equal(descriptorAfter.enumerable, descriptorBefore.enumerable);
    assert.equal(descriptorAfter.configurable, descriptorBefore.configurable);
  }
});

test("proxied authored intent fails closed before reflective traps execute", () => {
  const calls = { count: 0 };
  const target = {
    base_color: [0.2, 0.25, 0.3],
    paint: { color: [0.4, 0.5, 0.6], vars: { gain: 0.2 } }
  };
  const request = clone(fixture);
  request.request_id = "surface-intent-proxy-source-integrity";
  request.intent = trappingProxy(target, calls);

  const out = run(request);

  assert.equal(calls.count, 0, "intent Proxy traps must not execute before Surface rejects it");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_NONPORTABLE_VALUE");
  assert.equal(out.candidate, null);
  assert.deepEqual(target, {
    base_color: [0.2, 0.25, 0.3],
    paint: { color: [0.4, 0.5, 0.6], vars: { gain: 0.2 } }
  });
});

test("proxied caller paint fails closed before reflective traps execute", () => {
  const calls = { count: 0 };
  const paintTarget = {
    color: [["+", 0.2, ["*", 0.3, ["var", "ny"]]], 0.55, 0.2],
    vars: { gain: 0.3 }
  };
  const request = clone(fixture);
  request.request_id = "surface-paint-proxy-source-integrity";
  request.intent = {
    base_color: [0.2, 0.25, 0.3],
    paint: trappingProxy(paintTarget, calls)
  };

  const out = run(request);

  assert.equal(calls.count, 0, "paint Proxy traps must not execute before Surface rejects it");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.equal(out.candidate, null);
  assert.deepEqual(paintTarget, {
    color: [["+", 0.2, ["*", 0.3, ["var", "ny"]]], 0.55, 0.2],
    vars: { gain: 0.3 }
  });
});

test("deep paint Proxy values are rejected without executing traps", () => {
  const calls = { count: 0 };
  const expressionTarget = { authored: "opaque-expression" };
  const expression = trappingProxy(expressionTarget, calls);
  const request = requestWithPaint(expression, "surface-deep-paint-proxy-source-integrity");

  const out = run(request);

  assert.equal(calls.count, 0, "nested paint Proxy traps must not execute during recursive portability checks");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color\[0\] uses a Proxy/);
  assert.equal(out.candidate, null);
  assert.deepEqual(expressionTarget, { authored: "opaque-expression" });
});

test("revoked intent and paint Proxies reach explicit HOLDs instead of throwing", () => {
  const revokedIntent = Proxy.revocable({ base_color: [0.2, 0.25, 0.3] }, {});
  revokedIntent.revoke();
  const intentRequest = clone(fixture);
  intentRequest.request_id = "surface-revoked-intent-proxy-source-integrity";
  intentRequest.intent = revokedIntent.proxy;

  let intentOut;
  assert.doesNotThrow(() => {
    intentOut = run(intentRequest);
  });
  assert.equal(intentOut.status, "HOLD");
  assert.equal(intentOut.holds[0].code, "HOLD_SURFACE_INTENT_NONPORTABLE_VALUE");
  assert.equal(intentOut.candidate, null);

  const revokedPaint = Proxy.revocable({ color: [0.4, 0.5, 0.6], vars: { gain: 0.3 } }, {});
  revokedPaint.revoke();
  const paintRequest = clone(fixture);
  paintRequest.request_id = "surface-revoked-paint-proxy-source-integrity";
  paintRequest.intent = { base_color: [0.2, 0.25, 0.3], paint: revokedPaint.proxy };

  let paintOut;
  assert.doesNotThrow(() => {
    paintOut = run(paintRequest);
  });
  assert.equal(paintOut.status, "HOLD");
  assert.equal(paintOut.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.equal(paintOut.candidate, null);
});

test("ordinary portable intent remains unchanged across the descriptor preflight", () => {
  const request = clone(fixture);
  request.request_id = "surface-intent-portable-control";
  const before = clone(request.intent);

  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(request.intent, before);
  assert.equal(out.holds.length, 0);
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

test("caller paint rejects signed negative zero before JSON transport erases its sign", () => {
  const expression = ["/", 1, -0];
  const request = requestWithPaint(expression, "surface-paint-negative-zero-source-integrity");

  assert.equal(Object.is(request.intent.paint.color[0][2], -0), true, "fixture must preserve authored negative zero");

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /paint\.color\[0\]\[2\].*negative zero/i);
  assert.equal(out.candidate, null);
  assert.equal(Object.is(request.intent.paint.color[0][2], -0), true, "Surface must not mutate caller-authored sign");
});

test("caller paint vars reject signed negative zero before portable envelope cloning", () => {
  const request = requestWithPaint(["var", "bias"], "surface-paint-var-negative-zero-source-integrity");
  request.intent.paint.vars.bias = -0;

  assert.equal(Object.is(request.intent.paint.vars.bias, -0), true, "fixture must preserve authored negative zero");

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.match(out.holds[0].detail, /paint\.vars\.bias.*negative zero/i);
  assert.equal(out.candidate, null);
  assert.equal(Object.is(request.intent.paint.vars.bias, -0), true, "Surface must not mutate caller-authored sign");
});
