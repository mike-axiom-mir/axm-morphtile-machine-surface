const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("unknown enumerable request fields fail closed instead of collapsing to omission", () => {
  const request = clone(fixture);
  request.future_surface_mode = "silk";

  assert.throws(
    () => run(request),
    /request\.future_surface_mode is not part of the v0\.1 request-envelope grammar/
  );
  assert.equal(request.future_surface_mode, "silk", "Surface must not rewrite caller-owned unknown request data");
});

test("non-enumerable unknown request fields fail closed instead of disappearing", () => {
  const request = clone(fixture);
  Object.defineProperty(request, "hidden_surface_mode", {
    value: "silk",
    enumerable: false,
    configurable: true,
    writable: true
  });

  assert.throws(
    () => run(request),
    /request\.hidden_surface_mode is not part of the v0\.1 request-envelope grammar/
  );
  const descriptor = Object.getOwnPropertyDescriptor(request, "hidden_surface_mode");
  assert.equal(descriptor.value, "silk");
  assert.equal(descriptor.enumerable, false);
});

test("symbol-keyed request data fails closed before portable transport can drop it", () => {
  const request = clone(fixture);
  const key = Symbol("surface-request-extension");
  request[key] = "silk";

  assert.throws(
    () => run(request),
    /request contains symbol-keyed properties outside the v0\.1 request-envelope grammar/
  );
  assert.equal(request[key], "silk", "Surface must leave caller-owned symbol data untouched");
});

test("ordinary v0.1 request keys remain a candidate control", () => {
  const request = clone(fixture);
  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
});
