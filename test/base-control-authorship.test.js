"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const baseControlFixture = require("../fixtures/request.base-control.json");
const { run } = require("../src");

test("base-color-only intent stays base-only instead of inventing procedural paint", () => {
  const out = run(baseControlFixture);

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.value.data.color, baseControlFixture.intent.base_color);
  assert.equal(
    Object.prototype.hasOwnProperty.call(out.candidate.value.data, "paint"),
    false,
    "an explicit base color is already complete material authorship; Surface must not add an unrelated paint effect"
  );
  assert.match(
    out.evidence[0].check,
    /base color/i,
    "producer evidence must describe the authored base-only path rather than claiming a default paint was emitted"
  );
});

test("empty surface intent keeps the bounded legacy fallback paint", () => {
  const out = run({
    envelope_version: "0.1",
    request_id: "surface-empty-fallback-control",
    goal: "Create the bounded default Surface material",
    intent: {}
  });

  assert.equal(out.status, "CANDIDATE");
  assert.equal(Object.prototype.hasOwnProperty.call(out.candidate.value.data, "paint"), true);
  assert.deepEqual(out.candidate.value.data.color, [0.5, 0.5, 0.5]);
});
