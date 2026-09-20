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

function gradientRequest(overrides = {}) {
  return {
    envelope_version: "0.1",
    request_id: "surface-axis-gradient",
    goal: "Create a bounded deterministic vertical surface gradient",
    intent: {
      base_color: [0.2, 0.25, 0.3],
      surface_rule: {
        kind: "axis_gradient",
        axis: "y",
        from: -0.5,
        to: 0.5,
        start_color: [0.1, 0.2, 0.3],
        end_color: [0.9, 0.8, 0.7],
        ...overrides
      }
    },
    provenance: { caller: "surface-rules-test" }
  };
}

test("machine v0.5.1 compiles six named facing directions into MorphTile normal variables", () => {
  assert.equal(MACHINE.version, "0.5.1");
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

test("axis_gradient compiles explicit endpoint branches with interior interpolation without mutating intent", () => {
  const request = gradientRequest();
  const before = JSON.stringify(request);
  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(request), before);
  assert.deepEqual(out.evidence[0].rule, {
    kind: "axis_gradient",
    axis: "y",
    from: -0.5,
    to: 0.5,
    start_color: [0.1, 0.2, 0.3],
    end_color: [0.9, 0.8, 0.7]
  });
  assert.deepEqual(out.candidate.value.data.paint.color[0], [
    "if",
    [">=", ["var", "y"], 0.5],
    0.9,
    [
      "if",
      [">=", -0.5, ["var", "y"]],
      0.1,
      ["+", 0.1, ["*", 0.8, ["/", ["-", ["var", "y"], -0.5], 1]]]
    ]
  ]);
  assert.deepEqual(run(request), out);
});

test("axis_gradient keeps authored mixed-direction endpoints as literal branch values", () => {
  const start = [0.9, 0.1, 0.8];
  const end = [0.1, 0.8, 0.2];
  const out = run(gradientRequest({ from: -0.25, to: 0.25, start_color: start, end_color: end }));
  assert.equal(out.status, "CANDIDATE");
  const colors = out.candidate.value.data.paint.color;
  for (let i = 0; i < 3; i++) {
    const expression = colors[i];
    assert.equal(expression[0], "if");
    assert.deepEqual(expression[1], [">=", ["var", "y"], 0.25]);
    assert.equal(expression[2], end[i]);
    assert.equal(expression[3][0], "if");
    assert.deepEqual(expression[3][1], [">=", -0.25, ["var", "y"]]);
    assert.equal(expression[3][2], start[i]);
  }
});

test("axis_gradient fails closed on unknown axes, malformed ranges, unknown fields and numeric lookalikes", () => {
  assert.equal(run(gradientRequest({ axis: "ny" })).holds[0].code, "HOLD_SURFACE_RULE_AXIS_UNKNOWN");
  assert.equal(run(gradientRequest({ to: -0.5 })).holds[0].code, "HOLD_SURFACE_RULE_RANGE_INVALID");
  assert.equal(run(gradientRequest({ from: "-0.5" })).holds[0].code, "HOLD_SURFACE_RULE_RANGE_INVALID");
  assert.equal(run(gradientRequest({ to: false })).holds[0].code, "HOLD_SURFACE_RULE_RANGE_INVALID");

  const unknown = gradientRequest({ typo_axis: "y" });
  const unknownOut = run(unknown);
  assert.equal(unknownOut.status, "HOLD");
  assert.equal(unknownOut.holds[0].code, "HOLD_SURFACE_RULE_FIELD_UNKNOWN");
  assert.match(unknownOut.holds[0].detail, /typo_axis/);

  const color = gradientRequest({ end_color: [1, "0.8", 0.7] });
  assert.equal(run(color).holds[0].code, "HOLD_SURFACE_RULE_COLOR_INVALID");
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

test("unknown facing-rule fields HOLD instead of being silently ignored", () => {
  const typo = requestFor("up");
  typo.intent.surface_rule.threshhold = 0.9;
  const typoOut = run(typo);
  assert.equal(typoOut.status, "HOLD");
  assert.equal(typoOut.holds[0].code, "HOLD_SURFACE_RULE_FIELD_UNKNOWN");
  assert.match(typoOut.holds[0].detail, /threshhold/);

  const multiple = requestFor("up");
  multiple.intent.surface_rule.z_extra = true;
  multiple.intent.surface_rule.a_extra = true;
  assert.equal(run(multiple).holds[0].detail, "unknown surface_rule fields: a_extra, z_extra");
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

test("facing rules reject authored numeric lookalikes instead of coercing meaning", () => {
  const threshold = requestFor("up");
  threshold.request_id = "surface-facing-threshold-string";
  threshold.intent.surface_rule.threshold = "0.6";
  const thresholdOut = run(threshold);
  assert.equal(thresholdOut.status, "HOLD");
  assert.equal(thresholdOut.holds[0].code, "HOLD_SURFACE_RULE_THRESHOLD_INVALID");
  assert.equal(thresholdOut.candidate, null);

  for (const [label, bad] of [
    ["null", null],
    ["string", "0.8"],
    ["boolean", false]
  ]) {
    const request = requestFor("up");
    request.request_id = "surface-facing-match-color-" + label;
    request.intent.surface_rule.match_color = [bad, 0.8, 0.7];
    const out = run(request);
    assert.equal(out.status, "HOLD", label);
    assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_COLOR_INVALID", label);
    assert.equal(out.candidate, null, label);
  }
});
