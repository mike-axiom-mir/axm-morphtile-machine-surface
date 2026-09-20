const test = require("node:test");
const assert = require("node:assert/strict");
const facingFixture = require("../fixtures/request.facing-up.json");
const { MACHINE, run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function requestWith(pattern) {
  const request = clone(facingFixture);
  request.request_id = "surface-pattern-" + String(pattern && pattern.kind || "invalid");
  request.intent = { base_color: [0.2, 0.25, 0.3], pattern };
  return request;
}

test("machine v0.5.1 preserves the two MorphTile-backed named material patterns", () => {
  assert.equal(MACHINE.version, "0.5.1");

  for (const kind of ["checker", "stripes"]) {
    const request = requestWith({ kind, scale: 0.4 });
    const before = JSON.stringify(request);
    const out = run(request);

    assert.equal(out.status, "CANDIDATE", kind);
    assert.equal(out.candidate.value.data.pattern, kind);
    assert.equal(out.candidate.value.data.scale, 0.4);
    assert.equal(out.evidence.some((entry) => entry.kind === "STRUCTURAL" && entry.pattern && entry.pattern.kind === kind), true);
    assert.equal(out.evidence.at(-1).kind, "VISUAL");
    assert.equal(out.evidence.at(-1).status, "NOT_TESTED");
    assert.equal(JSON.stringify(request), before, kind + " request mutated");
  }
});

test("pattern scale defaults deterministically only when omitted", () => {
  const omitted = run(requestWith({ kind: "checker" }));
  assert.equal(omitted.status, "CANDIDATE");
  assert.equal(omitted.candidate.value.data.scale, 0.5);

  for (const bad of [0, -0.1, "0.4", false, null, Infinity, NaN]) {
    const out = run(requestWith({ kind: "checker", scale: bad }));
    assert.equal(out.status, "HOLD", String(bad));
    assert.equal(out.holds[0].code, "HOLD_SURFACE_PATTERN_SCALE_INVALID", String(bad));
    assert.equal(out.candidate, null, String(bad));
  }
});

test("material pattern vocabulary fails closed on malformed, unknown and ignored fields", () => {
  for (const pattern of ["checker", [], 4, null]) {
    const out = run(requestWith(pattern));
    assert.equal(out.status, "HOLD", JSON.stringify(pattern));
    assert.equal(out.holds[0].code, "HOLD_SURFACE_PATTERN_INVALID", JSON.stringify(pattern));
  }

  const unknownKind = run(requestWith({ kind: "noise", scale: 0.4 }));
  assert.equal(unknownKind.status, "HOLD");
  assert.equal(unknownKind.holds[0].code, "HOLD_SURFACE_PATTERN_KIND_UNKNOWN");

  const unknownFields = run(requestWith({ kind: "checker", scale: 0.4, z_extra: true, a_extra: true }));
  assert.equal(unknownFields.status, "HOLD");
  assert.equal(unknownFields.holds[0].code, "HOLD_SURFACE_PATTERN_FIELD_UNKNOWN");
  assert.equal(unknownFields.holds[0].detail, "unknown pattern fields: a_extra, z_extra");
});

test("pattern is orthogonal to named paint rules rather than silently replacing them", () => {
  const request = clone(facingFixture);
  request.request_id = "surface-facing-plus-checker";
  request.intent.pattern = { kind: "checker", scale: 0.4 };
  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.candidate.value.data.pattern, "checker");
  assert.equal(out.candidate.value.data.scale, 0.4);
  assert.deepEqual(out.evidence[0].rule, {
    kind: "facing",
    direction: "up",
    threshold: 0.6,
    match_color: [0.9, 0.55, 0.2],
    else_color: [0.25, 0.3, 0.4]
  });
  assert.equal(out.evidence[1].pattern.kind, "checker");
});
