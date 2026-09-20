const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");
const { clonePortablePaintValue } = require("../src/surface-intent");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defineOwnData(target, name, value) {
  Object.defineProperty(target, name, {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
}

function assertSourcePropertyPreserved(target, name, prototype, descriptor) {
  assert.equal(Object.getPrototypeOf(target), prototype);
  assert.deepEqual(Object.getOwnPropertyDescriptor(target, name), descriptor);
}

test("outer intent preserves own __proto__ as authored data until field validation", () => {
  const intent = {};
  defineOwnData(intent, "__proto__", { authored: true });

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
  assertSourcePropertyPreserved(intent, "__proto__", sourcePrototype, sourceDescriptor);
});

test("outer intent preserves inherited-looking own constructor as authored data until field validation", () => {
  const intent = {};
  defineOwnData(intent, "constructor", { authored: "constructor" });

  const sourcePrototype = Object.getPrototypeOf(intent);
  const sourceDescriptor = Object.getOwnPropertyDescriptor(intent, "constructor");
  const request = clone(fixture);
  request.request_id = "surface-intent-constructor-inert-write";
  request.intent = intent;

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_INTENT_FIELD_UNKNOWN");
  assert.match(out.holds[0].detail, /unknown intent field: constructor/);
  assert.equal(out.candidate, null);
  assertSourcePropertyPreserved(intent, "constructor", sourcePrototype, sourceDescriptor);
});

test("paint root preserves own __proto__ as authored data until field validation", () => {
  const paint = {
    color: [0.2, 0.4, 0.6]
  };
  defineOwnData(paint, "__proto__", { authored: true });

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
  assertSourcePropertyPreserved(paint, "__proto__", sourcePrototype, sourceDescriptor);
});

test("paint root preserves inherited-looking own toString as authored data until field validation", () => {
  const paint = {
    color: [0.2, 0.4, 0.6]
  };
  defineOwnData(paint, "toString", { authored: "toString" });

  const sourcePrototype = Object.getPrototypeOf(paint);
  const sourceDescriptor = Object.getOwnPropertyDescriptor(paint, "toString");
  const request = clone(fixture);
  request.request_id = "surface-paint-tostring-inert-write";
  request.intent = { paint };

  const out = run(request);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_PAINT_FIELD_UNKNOWN");
  assert.match(out.holds[0].detail, /unknown paint field: toString/);
  assert.equal(out.candidate, null);
  assertSourcePropertyPreserved(paint, "toString", sourcePrototype, sourceDescriptor);
});

test("raw paint clone preserves nested inherited-looking own keys without prototype semantics", () => {
  const nested = { ordinary: 7 };
  defineOwnData(nested, "__proto__", { authored: "proto-value" });
  defineOwnData(nested, "constructor", { authored: "constructor-value" });
  defineOwnData(nested, "toString", { authored: "toString-value" });

  const sourcePrototype = Object.getPrototypeOf(nested);
  const sourceDescriptors = {
    __proto__: Object.getOwnPropertyDescriptor(nested, "__proto__"),
    constructor: Object.getOwnPropertyDescriptor(nested, "constructor"),
    toString: Object.getOwnPropertyDescriptor(nested, "toString")
  };

  const cloned = clonePortablePaintValue(nested, "paint.color[0]");

  assert.equal(Object.getPrototypeOf(cloned), Object.prototype);
  assert.equal(Object.prototype.hasOwnProperty.call(cloned, "__proto__"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(cloned, "constructor"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(cloned, "toString"), true);
  assert.deepEqual(cloned.__proto__, { authored: "proto-value" });
  assert.deepEqual(cloned.constructor, { authored: "constructor-value" });
  assert.deepEqual(cloned.toString, { authored: "toString-value" });
  assert.equal(cloned.ordinary, 7);
  assert.equal(Object.getPrototypeOf(nested), sourcePrototype);
  assert.deepEqual(Object.getOwnPropertyDescriptor(nested, "__proto__"), sourceDescriptors.__proto__);
  assert.deepEqual(Object.getOwnPropertyDescriptor(nested, "constructor"), sourceDescriptors.constructor);
  assert.deepEqual(Object.getOwnPropertyDescriptor(nested, "toString"), sourceDescriptors.toString);
});
