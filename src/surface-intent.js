"use strict";

const INTENT_FIELDS = Object.freeze(["base_color", "paint", "surface_rule", "pattern", "external_dependency"]);
const PAINT_FIELDS = Object.freeze(["color", "vars"]);

class SurfaceIntentError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SurfaceIntentError";
    this.code = code;
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function assertOnlyFields(value, allowed, code, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key)).sort();
  if (unknown.length) {
    throw new SurfaceIntentError(
      code,
      "unknown " + label + " field" + (unknown.length === 1 ? ": " : "s: ") + unknown.join(", ")
    );
  }
}

function rgb(value, field) {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new SurfaceIntentError("HOLD_SURFACE_COLOR_INVALID", field + " must be an RGB triplet");
  }
  if (value.some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1)) {
    throw new SurfaceIntentError(
      "HOLD_SURFACE_COLOR_INVALID",
      field + " channels must be authored as finite numbers from 0 to 1"
    );
  }
  return value.slice();
}

function assertFinitePaintNumbers(value, path) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SurfaceIntentError(
        "HOLD_SURFACE_PAINT_NONFINITE_VALUE",
        path + " contains a non-finite number that cannot be preserved through the portable envelope"
      );
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFinitePaintNumbers(item, path + "[" + index + "]"));
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      assertFinitePaintNumbers(item, path + "." + key);
    }
  }
}

function normalizePaint(paint) {
  if (!isPlainObject(paint)) {
    throw new SurfaceIntentError("HOLD_SURFACE_PAINT_INVALID", "paint must be an object");
  }
  assertOnlyFields(paint, PAINT_FIELDS, "HOLD_SURFACE_PAINT_FIELD_UNKNOWN", "paint");
  if (!Array.isArray(paint.color) || paint.color.length !== 3) {
    throw new SurfaceIntentError("HOLD_SURFACE_PAINT_INVALID", "paint.color must contain exactly three channel expressions");
  }
  assertFinitePaintNumbers(paint.color, "paint.color");
  if (paint.vars !== undefined) {
    if (!isPlainObject(paint.vars)) {
      throw new SurfaceIntentError("HOLD_SURFACE_PAINT_VARS_INVALID", "paint.vars must be an object when supplied");
    }
    const bad = Object.entries(paint.vars)
      .filter(([, value]) => typeof value !== "number" || !Number.isFinite(value))
      .map(([key]) => key)
      .sort();
    if (bad.length) {
      throw new SurfaceIntentError("HOLD_SURFACE_PAINT_VARS_INVALID", "paint.vars values must be finite numbers: " + bad.join(", "));
    }
  }
  return JSON.parse(JSON.stringify(paint));
}

function normalizeSurfaceIntent(intent) {
  if (intent === undefined || intent === null) return {};
  if (!isPlainObject(intent)) {
    throw new SurfaceIntentError("HOLD_SURFACE_INTENT_INVALID", "intent must be an object");
  }
  assertOnlyFields(intent, INTENT_FIELDS, "HOLD_SURFACE_INTENT_FIELD_UNKNOWN", "intent");

  const out = {};
  if (intent.base_color !== undefined) out.base_color = rgb(intent.base_color, "base_color");
  if (intent.paint !== undefined) out.paint = normalizePaint(intent.paint);

  // Rule and pattern semantics are validated by their domain compilers. Keep the
  // authored values intact until those validators run: JSON serialization may
  // invoke caller-controlled toJSON hooks or rewrite non-finite values before
  // the machine has decided whether the authored request is valid.
  if (intent.surface_rule !== undefined) out.surface_rule = intent.surface_rule;
  if (intent.pattern !== undefined) out.pattern = intent.pattern;

  if (intent.external_dependency !== undefined) {
    if (typeof intent.external_dependency !== "string" || !intent.external_dependency.trim()) {
      throw new SurfaceIntentError("HOLD_SURFACE_DEPENDENCY_INVALID", "external_dependency must be a non-empty string");
    }
    out.external_dependency = intent.external_dependency;
  }
  return out;
}

module.exports = { INTENT_FIELDS, PAINT_FIELDS, SurfaceIntentError, normalizePaint, normalizeSurfaceIntent, rgb };
