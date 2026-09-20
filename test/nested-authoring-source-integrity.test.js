const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

test("surface_rule fields are descriptor-gated before semantic compilation", () => {
  let getterCalls = 0;
  const rule = {
    direction: "up",
    threshold: 0.6,
    match_color: [0.9, 0.8, 0.7],
    else_color: [0.1, 0.2, 0.3]
  };
  Object.defineProperty(rule, "kind", {
    enumerable: true,
    configurable: true,
    get() {
      getterCalls += 1;
      return "facing";
    }
  });

  const request = clone(fixture);
  request.request_id = "surface-rule-field-accessor-source-integrity";
  request.intent = { surface_rule: rule };

  const out = run(request);

  assert.equal(getterCalls, 0, "surface_rule accessors must not execute during admissibility checks");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_NONPORTABLE_VALUE");
  assert.equal(out.candidate, null);
});

test("surface pattern Proxy is rejected before reflective traps execute", () => {
  const calls = { count: 0 };
  const target = { kind: "checker", scale: 0.5 };
  const request = clone(fixture);
  request.request_id = "surface-pattern-proxy-source-integrity";
  request.intent = { pattern: trappingProxy(target, calls) };

  const out = run(request);

  assert.equal(calls.count, 0, "pattern Proxy traps must not execute before Surface rejects it");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PATTERN_NONPORTABLE_VALUE");
  assert.equal(out.candidate, null);
  assert.deepEqual(target, { kind: "checker", scale: 0.5 });
});

test("nested surface_rule color accessors are rejected without execution", () => {
  let getterCalls = 0;
  const matchColor = [0.9, 0.8, 0.7];
  Object.defineProperty(matchColor, "0", {
    enumerable: true,
    configurable: true,
    get() {
      getterCalls += 1;
      return 0.9;
    }
  });

  const request = clone(fixture);
  request.request_id = "surface-rule-color-accessor-source-integrity";
  request.intent = {
    surface_rule: {
      kind: "facing",
      direction: "up",
      threshold: 0.6,
      match_color: matchColor,
      else_color: [0.1, 0.2, 0.3]
    }
  };

  const out = run(request);

  assert.equal(getterCalls, 0, "nested rule color accessors must not execute during compilation");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_NONPORTABLE_VALUE");
  assert.equal(out.candidate, null);
});

test("base_color Proxy is rejected before channel reads execute traps", () => {
  const calls = { count: 0 };
  const target = [0.2, 0.25, 0.3];
  const request = clone(fixture);
  request.request_id = "surface-base-color-proxy-source-integrity";
  request.intent = { base_color: trappingProxy(target, calls) };

  const out = run(request);

  assert.equal(calls.count, 0, "base_color Proxy traps must not execute before Surface rejects it");
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_NONPORTABLE_VALUE");
  assert.equal(out.candidate, null);
  assert.deepEqual(target, [0.2, 0.25, 0.3]);
});
