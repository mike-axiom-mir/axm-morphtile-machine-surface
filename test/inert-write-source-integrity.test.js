const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");
const { clonePortablePaintValue } = require("../src/surface-intent");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defineProtoData(target, value) {
  Object.defineProperty(target, "__proto__", {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
}

test("outer intent preserves own __proto__ as authored data until field validation", () => {
  const intent = {};
  defineProtoData(intent, { authored: true });

  const sourcePrototype = Object.getPrototypeOf(intent);
  const sourceDescriptor = Object.getOwnPropertyDescriptor(intent, "__proto__");
  const request = clone(fixture);
  request.request_id = "surface-intent-proto-inert-write";
  request.intent = intent;

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_FIELD_UNKNOWN");
  assert.match(out.holds[0].detail, /unknown intent field: __proto__/);
  assert.equal(out.candidate, null);
  assert.equal(Object.getPrototypeOf(intent), sourcePrototype);
  assert.deepEqual(Object.getOwnPropertyDescriptor(intent, "__proto__"), sourceDescriptor);
});

test("paint root preserves own __proto__ as authored data until field validation", () => {
  const paint = {
    color: [0.2, 0.4, 0.6]
  };
  defineProtoData(paint, { authored: true });

  const sourcePrototype = Object.getPrototypeOf(paint);
  const sourceDescriptor = Object.getOwnPropertyDescriptor(paint, "__proto__");
  const request = clone(fixture);
  request.request_id = "surface-paint-proto-inert-write";
  request.intent = { paint };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_FIELD_UNKNOWN");
  assert.match(out.holds[0].detail, /unknown paint field: __proto__/);
  assert.equal(out.candidate, null);
  assert.equal(Object.getPrototypeOf(paint), sourcePrototype);
  assert.deepEqual(Object.getOwnPropertyDescriptor(paint, "__proto__"), sourceDescriptor);
});

test("raw paint clone preserves nested own __proto__ keys without prototype semantics", () => {
  const nested = { ordinary: 7 };
  defineProtoData(nested, { authored: "value" });
  const sourcePrototype = Object.getPrototypeOf(nested);
  const sourceDescriptor = Object.getOwnPropertyDescriptor(nested, "__proto__");

  const cloned = clonePortablePaintValue(nested, "paint.color[0]");

  assert.equal(Object.getPrototypeOf(cloned), Object.prototype);
  assert.equal(Object.prototype.hasOwnProperty.call(cloned, "__proto__"), true);
  assert.deepEqual(cloned.__proto__, { authored: "value" });
  assert.equal(cloned.ordinary, 7);
  assert.equal(Object.getPrototypeOf(nested), sourcePrototype);
  assert.deepEqual(Object.getOwnPropertyDescriptor(nested, "__proto__"), sourceDescriptor);
});
