"use strict";

const DIRECTIONS = Object.freeze({
  up: Object.freeze({ variable: "ny", sign: 1 }),
  down: Object.freeze({ variable: "ny", sign: -1 }),
  right: Object.freeze({ variable: "nx", sign: 1 }),
  left: Object.freeze({ variable: "nx", sign: -1 }),
  forward: Object.freeze({ variable: "nz", sign: 1 }),
  back: Object.freeze({ variable: "nz", sign: -1 })
});
const GRADIENT_AXES = Object.freeze(["x", "y", "z"]);

const FACING_FIELDS = Object.freeze(["kind", "direction", "threshold", "match_color", "else_color"]);
const AXIS_GRADIENT_FIELDS = Object.freeze(["kind", "axis", "from", "to", "start_color", "end_color"]);

class SurfaceRuleError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SurfaceRuleError";
    this.code = code;
  }
}

function assertOnlyFields(rule, allowed) {
  const unknown = Object.keys(rule).filter((key) => !allowed.includes(key)).sort();
  if (unknown.length) {
    throw new SurfaceRuleError(
      "HOLD_SURFACE_RULE_FIELD_UNKNOWN",
      "unknown surface_rule field" + (unknown.length === 1 ? ": " : "s: ") + unknown.join(", ")
    );
  }
}

function authoredFiniteNumber(value, code, message) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new SurfaceRuleError(code, message);
  }
  return value;
}

function rgb(value, field) {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_COLOR_INVALID", field + " must be an RGB triplet");
  }
  if (value.some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1)) {
    throw new SurfaceRuleError(
      "HOLD_SURFACE_RULE_COLOR_INVALID",
      field + " channels must be authored as finite numbers from 0 to 1"
    );
  }
  return value.slice();
}

function facingExpression(direction) {
  const spec = DIRECTIONS[direction];
  if (!spec) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_DIRECTION_UNKNOWN", "unknown facing direction: " + String(direction));
  }
  const normal = ["var", spec.variable];
  return spec.sign === 1 ? normal : ["*", -1, normal];
}

function compileFacing(rule) {
  assertOnlyFields(rule, FACING_FIELDS);
  const direction = rule.direction;
  const threshold = rule.threshold === undefined ? 0.6 : rule.threshold;
  if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new SurfaceRuleError(
      "HOLD_SURFACE_RULE_THRESHOLD_INVALID",
      "facing threshold must be authored as a finite number from 0 to 1"
    );
  }
  const match = rgb(rule.match_color, "match_color");
  const otherwise = rgb(rule.else_color, "else_color");
  const test = [">=", facingExpression(direction), threshold];
  return {
    normalized: { kind: "facing", direction, threshold, match_color: match, else_color: otherwise },
    paint: {
      color: match.map((channel, index) => ["if", JSON.parse(JSON.stringify(test)), channel, otherwise[index]])
    }
  };
}

function compileAxisGradient(rule) {
  assertOnlyFields(rule, AXIS_GRADIENT_FIELDS);
  if (!GRADIENT_AXES.includes(rule.axis)) {
    throw new SurfaceRuleError(
      "HOLD_SURFACE_RULE_AXIS_UNKNOWN",
      "axis_gradient axis must be one of: " + GRADIENT_AXES.join(", ")
    );
  }

  const from = authoredFiniteNumber(
    rule.from,
    "HOLD_SURFACE_RULE_RANGE_INVALID",
    "axis_gradient from must be authored as a finite number"
  );
  const to = authoredFiniteNumber(
    rule.to,
    "HOLD_SURFACE_RULE_RANGE_INVALID",
    "axis_gradient to must be authored as a finite number"
  );
  if (to <= from) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_RANGE_INVALID", "axis_gradient to must be greater than from");
  }

  const start = rgb(rule.start_color, "start_color");
  const end = rgb(rule.end_color, "end_color");
  const span = to - from;
  if (!Number.isFinite(span) || span <= 0) {
    throw new SurfaceRuleError(
      "HOLD_SURFACE_RULE_RANGE_INVALID",
      "axis_gradient derived span must remain a positive finite number"
    );
  }
  const position = ["var", rule.axis];
  const interiorT = ["/", ["-", JSON.parse(JSON.stringify(position)), from], span];
  const color = start.map((channel, index) => {
    const interior = [
      "+",
      channel,
      ["*", end[index] - channel, JSON.parse(JSON.stringify(interiorT))]
    ];
    return [
      "if",
      [">=", JSON.parse(JSON.stringify(position)), to],
      end[index],
      [
        "if",
        [">=", from, JSON.parse(JSON.stringify(position))],
        channel,
        interior
      ]
    ];
  });

  return {
    normalized: {
      kind: "axis_gradient",
      axis: rule.axis,
      from,
      to,
      start_color: start,
      end_color: end
    },
    paint: { color }
  };
}

function compileSurfaceRule(rule) {
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_INVALID", "surface_rule must be an object");
  }
  if (rule.kind === "facing") return compileFacing(rule);
  if (rule.kind === "axis_gradient") return compileAxisGradient(rule);
  throw new SurfaceRuleError("HOLD_SURFACE_RULE_KIND_UNKNOWN", "unknown surface rule kind: " + String(rule.kind));
}

module.exports = { DIRECTIONS, GRADIENT_AXES, SurfaceRuleError, compileSurfaceRule };
