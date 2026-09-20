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

function nonportablePaint(path, detail) {
  throw new SurfaceIntentError("HOLD_SURFACE_PAINT_NONPORTABLE_VALUE", path + " " + detail);
}

function clonePortablePaintValue(value, path, stack = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SurfaceIntentError(
        "HOLD_SURFACE_PAINT_NONFINITE_VALUE",
        path + " contains a non-finite number that cannot be preserved through the portable envelope"
      );
    }
    return value;
  }

  if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    nonportablePaint(path, "contains a value type that portable JSON would rewrite, drop, or reject");
  }

  if (typeof value !== "object") {
    nonportablePaint(path, "contains an unsupported portable value");
  }

  if (stack.has(value)) {
    nonportablePaint(path, "contains a cycle that portable JSON cannot represent");
  }
  stack.add(value);

  try {
    if (Array.isArray(value)) {
      const ownNames = Object.getOwnPropertyNames(value);
      const unexpected = ownNames.filter((name) => {
        if (name === "length") return false;
        if (!/^(0|[1-9][0-9]*)$/.test(name)) return true;
        return Number(name) >= value.length;
      });
      if (unexpected.length) {
        nonportablePaint(path, "contains array properties portable JSON would not preserve: " + unexpected.sort().join(", "));
      }
      if (Object.getOwnPropertySymbols(value).length) {
        nonportablePaint(path, "contains symbol-keyed array properties portable JSON would drop");
      }

      const out = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          nonportablePaint(path + "[" + index + "]", "is a sparse array slot that portable JSON would rewrite to null");
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !("value" in descriptor)) {
          nonportablePaint(path + "[" + index + "]", "uses an accessor instead of portable authored data");
        }
        out.push(clonePortablePaintValue(descriptor.value, path + "[" + index + "]", stack));
      }
      return out;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      nonportablePaint(path, "uses a non-plain object that portable JSON would reinterpret");
    }
    if (Object.getOwnPropertySymbols(value).length) {
      nonportablePaint(path, "contains symbol-keyed properties portable JSON would drop");
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const out = {};
    for (const name of Object.getOwnPropertyNames(value)) {
      const descriptor = descriptors[name];
      if (!descriptor.enumerable) {
        nonportablePaint(path + "." + name, "is non-enumerable and would not survive portable JSON unchanged");
      }
      if (!("value" in descriptor)) {
        nonportablePaint(path + "." + name, "uses an accessor instead of portable authored data");
      }
      out[name] = clonePortablePaintValue(descriptor.value, path + "." + name, stack);
    }
    return out;
  } finally {
    stack.delete(value);
  }
}

function normalizePaint(paint) {
  if (!isPlainObject(paint)) {
    throw new SurfaceIntentError("HOLD_SURFACE_PAINT_INVALID", "paint must be an object");
  }

  // Establish the portable plain-data boundary before reading any caller-owned
  // paint field. This prevents accessors from executing before Surface has
  // decided whether the authored data is admissible.
  const portablePaint = clonePortablePaintValue(paint, "paint");

  assertOnlyFields(portablePaint, PAINT_FIELDS, "HOLD_SURFACE_PAINT_FIELD_UNKNOWN", "paint");
  if (!Array.isArray(portablePaint.color) || portablePaint.color.length !== 3) {
    throw new SurfaceIntentError("HOLD_SURFACE_PAINT_INVALID", "paint.color must contain exactly three channel expressions");
  }
  if (portablePaint.vars !== undefined) {
    if (!isPlainObject(portablePaint.vars)) {
      throw new SurfaceIntentError("HOLD_SURFACE_PAINT_VARS_INVALID", "paint.vars must be an object when supplied");
    }
    const bad = Object.entries(portablePaint.vars)
      .filter(([, value]) => typeof value !== "number" || !Number.isFinite(value))
      .map(([key]) => key)
      .sort();
    if (bad.length) {
      throw new SurfaceIntentError("HOLD_SURFACE_PAINT_VARS_INVALID", "paint.vars values must be finite numbers: " + bad.join(", "));
    }
  }
  return portablePaint;
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

module.exports = {
  INTENT_FIELDS,
  PAINT_FIELDS,
  SurfaceIntentError,
  clonePortablePaintValue,
  normalizePaint,
  normalizeSurfaceIntent,
  rgb
};
