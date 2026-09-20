"use strict";

const PATTERN_KINDS = Object.freeze(["checker", "stripes"]);
const PATTERN_FIELDS = Object.freeze(["kind", "scale"]);

class SurfacePatternError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SurfacePatternError";
    this.code = code;
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function compileSurfacePattern(pattern) {
  if (!isPlainObject(pattern)) {
    throw new SurfacePatternError("HOLD_SURFACE_PATTERN_INVALID", "pattern must be an object");
  }

  const unknown = Object.keys(pattern).filter((key) => !PATTERN_FIELDS.includes(key)).sort();
  if (unknown.length) {
    throw new SurfacePatternError(
      "HOLD_SURFACE_PATTERN_FIELD_UNKNOWN",
      "unknown pattern field" + (unknown.length === 1 ? ": " : "s: ") + unknown.join(", ")
    );
  }

  if (!PATTERN_KINDS.includes(pattern.kind)) {
    throw new SurfacePatternError(
      "HOLD_SURFACE_PATTERN_KIND_UNKNOWN",
      "pattern.kind must be one of: " + PATTERN_KINDS.join(", ")
    );
  }

  const scale = pattern.scale === undefined ? 0.5 : pattern.scale;
  if (typeof scale !== "number" || !Number.isFinite(scale) || scale <= 0) {
    throw new SurfacePatternError(
      "HOLD_SURFACE_PATTERN_SCALE_INVALID",
      "pattern.scale must be authored as a positive finite number"
    );
  }

  return {
    normalized: { kind: pattern.kind, scale },
    material: { pattern: pattern.kind, scale }
  };
}

module.exports = { PATTERN_KINDS, PATTERN_FIELDS, SurfacePatternError, compileSurfacePattern };
