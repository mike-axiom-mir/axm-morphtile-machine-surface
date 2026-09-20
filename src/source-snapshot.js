"use strict";

const { types: utilTypes } = require("node:util");

function fail(code, path, detail) {
  const error = new Error(path + " " + detail);
  error.name = "SurfaceSourceIntegrityError";
  error.code = code;
  throw error;
}

function defineAuthoredDataProperty(target, name, value) {
  // Authored keys are data, including host-language-sensitive names such as
  // "__proto__". Ordinary assignment can invoke ambient setters instead of
  // preserving own-key identity, so every Surface source snapshot writes
  // caller-owned object keys through an explicit inert data descriptor.
  Object.defineProperty(target, name, {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
  return target;
}

function snapshotCompiledAuthoringValue(value, path, code, stack = new Set()) {
  // Proxy detection must precede Array.isArray, prototype inspection, key
  // enumeration, descriptors, or any direct field access. This also catches
  // revoked Proxies without invoking caller-controlled traps.
  if (utilTypes.isProxy(value)) {
    fail(code, path, "uses a Proxy instead of plain authored data");
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    fail(code, path, "contains an executable or non-portable value type");
  }

  if (typeof value !== "object") {
    fail(code, path, "contains an unsupported authored value");
  }

  if (stack.has(value)) {
    fail(code, path, "contains a cycle instead of bounded authored data");
  }
  stack.add(value);

  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length) {
        fail(code, path, "contains symbol-keyed array properties outside the compiled authoring grammar");
      }

      const ownNames = Object.getOwnPropertyNames(value);
      const unexpected = ownNames.filter((name) => {
        if (name === "length") return false;
        if (!/^(0|[1-9][0-9]*)$/.test(name)) return true;
        return Number(name) >= value.length;
      });
      if (unexpected.length) {
        fail(code, path, "contains unsupported array properties: " + unexpected.sort().join(", "));
      }

      const out = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          fail(code, path + "[" + index + "]", "is a sparse authored array slot");
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !("value" in descriptor)) {
          fail(code, path + "[" + index + "]", "uses an accessor instead of plain authored data");
        }
        out.push(snapshotCompiledAuthoringValue(descriptor.value, path + "[" + index + "]", code, stack));
      }
      return out;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      fail(code, path, "uses a non-plain object instead of compiled authored data");
    }
    if (Object.getOwnPropertySymbols(value).length) {
      fail(code, path, "contains symbol-keyed properties outside the compiled authoring grammar");
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const out = {};
    for (const name of Object.getOwnPropertyNames(value)) {
      const descriptor = descriptors[name];
      // Non-enumerable metadata is not part of the compiled authoring grammar.
      // In particular this strips hidden toJSON hooks without executing them.
      if (!descriptor.enumerable) continue;
      if (!("value" in descriptor)) {
        fail(code, path + "." + name, "uses an accessor instead of plain authored data");
      }
      const snapped = snapshotCompiledAuthoringValue(descriptor.value, path + "." + name, code, stack);
      defineAuthoredDataProperty(out, name, snapped);
    }
    return out;
  } finally {
    stack.delete(value);
  }
}

module.exports = { defineAuthoredDataProperty, snapshotCompiledAuthoringValue };
