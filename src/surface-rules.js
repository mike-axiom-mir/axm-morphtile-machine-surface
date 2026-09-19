"use strict";

const DIRECTIONS = Object.freeze({
  up: Object.freeze({ variable: "ny", sign: 1 }),
  down: Object.freeze({ variable: "ny", sign: -1 }),
  right: Object.freeze({ variable: "nx", sign: 1 }),
  left: Object.freeze({ variable: "nx", sign: -1 }),
  forward: Object.freeze({ variable: "nz", sign: 1 }),
  back: Object.freeze({ variable: "nz", sign: -1 })
});

class SurfaceRuleError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SurfaceRuleError";
    this.code = code;
  }
}

function rgb(value, field) {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_COLOR_INVALID", field + " must be an RGB triplet");
  }
  const out = value.map(Number);
  if (out.some((v) => !Number.isFinite(v) || v < 0 || v > 1)) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_COLOR_INVALID", field + " channels must be finite numbers from 0 to 1");
  }
  return out;
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
  const direction = rule.direction;
  const threshold = rule.threshold === undefined ? 0.6 : Number(rule.threshold);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_THRESHOLD_INVALID", "facing threshold must be a finite number from 0 to 1");
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

function compileSurfaceRule(rule) {
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
    throw new SurfaceRuleError("HOLD_SURFACE_RULE_INVALID", "surface_rule must be an object");
  }
  if (rule.kind === "facing") return compileFacing(rule);
  throw new SurfaceRuleError("HOLD_SURFACE_RULE_KIND_UNKNOWN", "unknown surface rule kind: " + String(rule.kind));
}

module.exports = { DIRECTIONS, SurfaceRuleError, compileSurfaceRule };
