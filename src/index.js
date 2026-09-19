"use strict";

const { assertRequest, result } = require("./envelope");
const MACHINE = { id: "axm.morphtile.machine.surface", version: "0.1.0" };

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
  const paint = intent.paint || { color: [["if", [">", ["var", "ny"], 0.6], 0.9, 0.25], 0.55, 0.2] };
  return result(request, MACHINE, "CANDIDATE", {
    candidate: { schema: "morphtile.facet-candidate/v0.4", facet: "material", value: { type: "generated", source: null, data: { color: intent.base_color || [0.5, 0.5, 0.5], paint } } },
    evidence: [
      { kind: "STRUCTURAL", status: "PASS", check: "material uses MorphTile generated paint data" },
      { kind: "VISUAL", status: "NOT_TESTED", check: "no rendered observer ran in this foundation" }
    ]
  });
}

module.exports = { MACHINE, run };
