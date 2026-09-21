"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

for (const [label, value] of [
  ["null", null],
  ["false", false],
  ["zero", 0],
  ["empty-string", ""]
]) {
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

test("absent provenance still receives the documented empty-object default", () => {
  const request = clone(fixture);
  request.request_id = "surface-provenance-absent-control";
  delete request.provenance;

  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.provenance, {});
});
