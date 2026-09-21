"use strict";

const { assertRequest, result } = require("./envelope");
const { SurfaceIntentError, normalizeSurfaceIntent } = require("./surface-intent");
const { SurfaceRuleError, compileSurfaceRule } = require("./surface-rules");
const { SurfacePatternError, compileSurfacePattern } = require("./surface-patterns");
const MACHINE = { id: "axm.morphtile.machine.surface", version: "0.5.1" };

function hold(request, error, fallbackCode) {
  const code = error && error.code ? error.code : fallbackCode;
  return result(request, MACHINE, "HOLD", {
    holds: [{ code, detail: error && error.message ? error.message : String(error) }],
    suggested_missing_capability: null
  });
}

function run(request) {
  // Establish a trap-free request-envelope view before Surface reads intent,
  // capability availability, provenance, or any other caller-owned envelope
  // field. Intent keeps its own deeper Surface-specific source boundary.
  request = assertRequest(request);

  let intent;
  try {
    intent = normalizeSurfaceIntent(request.intent);
  } catch (error) {
    return hold(request, error, "HOLD_SURFACE_INTENT_INVALID");
  }

  if (intent.external_dependency && !(request.available_capabilities || []).includes(intent.external_dependency)) {
    return result(request, MACHINE, "HOLD", {
      dependencies: [intent.external_dependency],
      holds: [{ code: "HOLD_MATERIAL_DEPENDENCY_MISSING", dependency: intent.external_dependency }],
      suggested_missing_capability: intent.external_dependency
    });
  }

  if (intent.paint && intent.surface_rule !== undefined) {
    return hold(
      request,
      new SurfaceRuleError("HOLD_SURFACE_RULE_CONFLICT", "paint and surface_rule cannot both author the same material candidate"),
      "HOLD_SURFACE_RULE_INVALID"
    );
  }

  let paint = intent.paint;
  let normalizedRule = null;
  if (intent.surface_rule !== undefined) {
    try {
      const compiled = compileSurfaceRule(intent.surface_rule);
      paint = compiled.paint;
      normalizedRule = compiled.normalized;
    } catch (error) {
      return hold(request, error, "HOLD_SURFACE_RULE_INVALID");
    }
  }

  let normalizedPattern = null;
  let patternMaterial = {};
  if (intent.pattern !== undefined) {
    try {
      const compiled = compileSurfacePattern(intent.pattern);
      normalizedPattern = compiled.normalized;
      patternMaterial = compiled.material;
    } catch (error) {
      return hold(request, error, "HOLD_SURFACE_PATTERN_INVALID");
    }
  }

  paint = paint || { color: [["if", [">", ["var", "ny"], 0.6], 0.9, 0.25], 0.55, 0.2] };

  const evidence = [];
  const warnings = [];
  if (normalizedRule) {
    evidence.push({
      kind: "STRUCTURAL",
      status: "PASS",
      check: "named surface rule compiled to a bounded MorphTile paint expression",
      rule: normalizedRule
    });
  } else if (intent.paint) {
    evidence.push({
      kind: "STRUCTURAL",
      status: "PASS",
      check: "caller paint shape and numeric vars passed Surface Machine intent validation; expression semantics remain runtime-owned"
    });
    warnings.push({
      code: "CALLER_PAINT_RUNTIME_VALIDATION_REQUIRED",
      detail: "caller-authored paint expressions are preserved but their runtime meaning belongs to MorphTile"
    });
  } else {
    evidence.push({
      kind: "STRUCTURAL",
      status: "PASS",
      check: "default generated paint emitted after bounded surface intent validation"
    });
  }

  if (normalizedPattern) {
    evidence.push({
      kind: "STRUCTURAL",
      status: "PASS",
      check: "named material pattern compiled to MorphTile pattern/scale fields",
      pattern: normalizedPattern
    });
  }

  evidence.push({ kind: "VISUAL", status: "NOT_TESTED", check: "no rendered observer ran in this machine pass" });

  return result(request, MACHINE, "CANDIDATE", {
    candidate: {
      schema: "morphtile.facet-candidate/v0.4",
      facet: "material",
      value: {
        type: "generated",
        source: null,
        data: {
          color: intent.base_color || [0.5, 0.5, 0.5],
          paint,
          ...patternMaterial
        }
      }
    },
    evidence,
    warnings
  });
}

module.exports = { MACHINE, run };
