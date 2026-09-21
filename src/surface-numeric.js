"use strict";

function canonicalizeCompiledNumber(value) {
  // Named Surface authoring is a machine-owned numeric grammar rather than a
  // raw pass-through payload. In these scalar domains, signed zero has no
  // distinct surface meaning, so normalize it deliberately before any JSON
  // envelope transport can do the same rewrite implicitly.
  return Object.is(value, -0) ? 0 : value;
}

module.exports = { canonicalizeCompiledNumber };
