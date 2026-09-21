"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");
const { DIRECTIONS } = require("../src/surface-rules");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const AMBIENT_OBJECT_NAMES = Object.getOwnPropertyNames(Object.prototype)
  .filter((name) => !Object.prototype.hasOwnProperty.call(DIRECTIONS, name))
  .sort();

for (const direction of AMBIENT_OBJECT_NAMES) {
  test(`facing direction ${direction} cannot inherit a host-object property as a valid direction`, () => {
    const request = clone(fixture);
    request.request_id = `surface-direction-own-key-${direction}`;
    request.intent.surface_rule.direction = direction;

    const out = run(request);

    assert.equal(out.status, "HOLD");
    assert.equal(out.candidate, null);
    assert.equal(out.holds.length, 1);
    assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_DIRECTION_UNKNOWN");
  });
}

test("declared own direction names remain accepted", () => {
  const request = clone(fixture);
  request.request_id = "surface-direction-own-key-control";
  request.intent.surface_rule.direction = "up";

  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.holds.length, 0);
});
