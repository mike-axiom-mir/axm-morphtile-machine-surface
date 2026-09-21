"use strict";

function createDefaultPaint() {
  // Return fresh authored data each time so callers/tests cannot mutate a
  // shared singleton and silently change later Surface candidates.
  return {
    color: [["if", [">", ["var", "ny"], 0.6], 0.9, 0.25], 0.55, 0.2]
  };
}

module.exports = { createDefaultPaint };
