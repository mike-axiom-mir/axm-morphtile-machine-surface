"use strict";

const { assertRequest, result } = require("./envelope");
const { SurfaceRuleError, compileSurfaceRule } = require("./surface-rules");
const MACHINE = { id: "axm.morphtile.machine.surface", version: "0.2.0" };

function holdRule(request, error) {
  const code = error instanceof SurfaceRuleError ? error.code : "HOLD_SURFACE_RULE_INVALID";
  return result(request, MACHINE, "HOLD", {
    holds: [{ code, detail: error && error.message ? error.message : String(error) }],
    suggested_missing_capability: null
  });
}

function run(request) {
  assertRequest(request);
  const intent = request.intent || {};
  if (intent.external_dependency && !(request.available_capabilities || []).includes(intent.external_dependency)) {
    return result(request, MACHINE, "HOLD", {
      dependencies: [intent.external_dependency],
      holds: [{ code: "HOLD_MATERIAL_DEPENDENCY_MISSING", dependency: intent.external_dependency }],
      suggested_missing_capability: intent.external_dependency
    });
  }

  if (intent.paint && intent.surface_rule) {
    return holdRule(request, new SurfaceRuleError("HOLD_SURFACE_RULE_CONFLICT", "paint and surface_rule cannot both author the same material candidate"));
  }

  let paint = intent.paint;
  let normalizedRule = null;
  if (intent.surface_rule) {
    try {
      const compiled = compileSurfaceRule(intent.surface_rule);
      paint = compiled.paint;
      normalizedRule = compiled.normalized;
    } catch (error) {
      return holdRule(request, error);
    }
  }

  paint = paint || { color: [["if", [">", ["var", "ny"], 0.6], 0.9, 0.25], 0.55, 0.2] };
  const structural = normalizedRule
    ? { kind: "STRUCTURAL", status: "PASS", check: "named surface rule compiled to MorphTile normal paint expression", rule: normalizedRule }
    : { kind: "STRUCTURAL", status: "PASS", check: "material uses MorphTile generated paint data" };

  return result(request, MACHINE, "CANDIDATE", {
    candidate: { schema: "morphtile.facet-candidate/v0.4", facet: "material", value: { type: "generated", source: null, data: { color: intent.base_color || [0.5, 0.5, 0.5], paint } } },
    evidence: [
      structural,
      { kind: "VISUAL", status: "NOT_TESTED", check: "no rendered observer ran in this machine pass" }
    ]
  });
}

module.exports = { MACHINE, run };
