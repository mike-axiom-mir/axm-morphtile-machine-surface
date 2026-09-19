const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { MACHINE, run } = require("../src");

const NORMAL_EXPR = {
  up: ["var", "ny"],
  down: ["*", -1, ["var", "ny"]],
  right: ["var", "nx"],
  left: ["*", -1, ["var", "nx"]],
  forward: ["var", "nz"],
  back: ["*", -1, ["var", "nz"]]
};

function requestFor(direction) {
  return {
    ...fixture,
    request_id: "surface-facing-" + direction,
    intent: {
      ...fixture.intent,
      surface_rule: { ...fixture.intent.surface_rule, direction }
    }
  };
}

test("machine v0.2 compiles six named facing directions into MorphTile normal variables", () => {
  assert.equal(MACHINE.version, "0.2.0");
  for (const [direction, normalExpr] of Object.entries(NORMAL_EXPR)) {
    const out = run(requestFor(direction));
    assert.equal(out.status, "CANDIDATE", direction);
    const paint = out.candidate.value.data.paint;
    assert.deepEqual(paint.color[0], ["if", [">=", normalExpr, 0.6], 0.9, 0.25], direction);
    assert.deepEqual(out.evidence.map((item) => item.status), ["PASS", "NOT_TESTED"]);
    assert.deepEqual(out.evidence[0].rule, {
      kind: "facing",
      direction,
      threshold: 0.6,
      match_color: [0.9, 0.55, 0.2],
      else_color: [0.25, 0.3, 0.4]
    });
  }
});

test("facing-rule compilation is deterministic and does not mutate the request", () => {
  const request = requestFor("up");
  const before = JSON.stringify(request);
  assert.deepEqual(run(request), run(request));
  assert.equal(JSON.stringify(request), before);
});

test("surface_rule and raw paint cannot silently compete for authorship", () => {
  const request = requestFor("up");
  request.intent.paint = { color: [0.1, 0.2, 0.3] };
  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_CONFLICT");
  assert.equal(out.candidate, null);
});

test("invalid named facing rules HOLD instead of fabricating paint", () => {
  const unknown = requestFor("diagonal-ish");
  assert.equal(run(unknown).holds[0].code, "HOLD_SURFACE_RULE_DIRECTION_UNKNOWN");

  const threshold = requestFor("up");
  threshold.intent.surface_rule.threshold = 1.5;
  assert.equal(run(threshold).holds[0].code, "HOLD_SURFACE_RULE_THRESHOLD_INVALID");

  const color = requestFor("up");
  color.intent.surface_rule.match_color = [1, 0.5, 2];
  assert.equal(run(color).holds[0].code, "HOLD_SURFACE_RULE_COLOR_INVALID");
});
