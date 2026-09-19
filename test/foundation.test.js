const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("../fixtures/request.up-facing.json");
const { run } = require("../src");

test("produces generated material matter and separates structural from visual evidence", () => {
  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.candidate.facet, "material");
  assert.deepEqual(out.evidence.map(x => x.status), ["PASS", "NOT_TESTED"]);
});

test("holds an unavailable external material dependency", () => {
  const out = run({ ...request, request_id: "surface-held", intent: { external_dependency: "bridge:cloth" } });
  assert.equal(out.status, "HOLD");
  assert.deepEqual(out.dependencies, ["bridge:cloth"]);
});
