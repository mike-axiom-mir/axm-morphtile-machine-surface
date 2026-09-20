const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function gradientRequest(from, to) {
  return {
    envelope_version: "0.1",
    request_id: "surface-axis-gradient-derived-finite",
    goal: "Keep compiled gradient arithmetic JSON-safe and finite",
    intent: {
      base_color: [0.2, 0.25, 0.3],
      surface_rule: {
        kind: "axis_gradient",
        axis: "y",
        from,
        to,
        start_color: [0.1, 0.2, 0.3],
        end_color: [0.9, 0.8, 0.7]
      }
    },
    provenance: { caller: "gradient-derived-finite-test" }
  };
}

function collectNonFiniteNumbers(value, path = "$") {
  const found = [];
  if (typeof value === "number") {
    if (!Number.isFinite(value)) found.push(path);
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => found.push(...collectNonFiniteNumbers(item, `${path}[${index}]`)));
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      found.push(...collectNonFiniteNumbers(item, `${path}.${key}`));
    }
  }
  return found;
}

test("axis_gradient rejects finite authored bounds whose derived span overflows", () => {
  const from = -Number.MAX_VALUE;
  const to = Number.MAX_VALUE;
  assert.equal(Number.isFinite(from), true);
  assert.equal(Number.isFinite(to), true);
  assert.equal(to > from, true);
  assert.equal(Number.isFinite(to - from), false, "the derived span is Infinity even though both authored endpoints are finite");

  const out = run(gradientRequest(from, to));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_SURFACE_RULE_RANGE_INVALID");
  assert.match(out.holds[0].detail, /derived span must remain a positive finite number/);
  assert.equal(out.candidate, null);
});

test("axis_gradient accepts a very large representable span without inventing a magnitude quota", () => {
  const from = -Number.MAX_VALUE / 4;
  const to = Number.MAX_VALUE / 4;
  assert.equal(Number.isFinite(to - from), true);

  const out = run(gradientRequest(from, to));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(collectNonFiniteNumbers(out), []);
  assert.equal(out.evidence[0].status, "PASS");
});
