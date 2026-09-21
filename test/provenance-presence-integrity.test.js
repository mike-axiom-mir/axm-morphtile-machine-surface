"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");
const { result } = require("../src/envelope");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const FALSEY_PORTABLE_PROVENANCE = [
  ["null", null],
  ["false", false],
  ["zero", 0],
  ["empty-string", ""]
];

for (const [label, value] of FALSEY_PORTABLE_PROVENANCE) {
  test(`request provenance preserves supplied ${label} instead of defaulting by truthiness`, () => {
    const request = clone(fixture);
    request.request_id = `surface-provenance-${label}`;
    request.provenance = value;

    const out = run(request);

    assert.equal(out.status, "CANDIDATE");
    assert.deepEqual(out.provenance, value);
    assert.deepEqual(request.provenance, value, "Surface must not rewrite caller-authored provenance");
  });
}

for (const [label, value] of FALSEY_PORTABLE_PROVENANCE) {
  test(`explicit result provenance override preserves supplied ${label}`, () => {
    const request = clone(fixture);
    request.request_id = `surface-result-provenance-${label}`;
    request.provenance = { caller: "request" };

    const out = result(request, { id: "test.machine", version: "0" }, "PASS", { provenance: value });

    assert.deepEqual(out.provenance, value);
    assert.deepEqual(request.provenance, { caller: "request" });
  });
}

test("absent provenance still receives the documented empty-object default", () => {
  const request = clone(fixture);
  request.request_id = "surface-provenance-absent-control";
  delete request.provenance;

  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.provenance, {});
});
