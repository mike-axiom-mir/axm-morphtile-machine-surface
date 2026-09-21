"use strict";

const { types: utilTypes } = require("node:util");

const ENVELOPE_VERSION = "0.1";
const STATUSES = new Set(["CANDIDATE", "PASS", "HOLD", "FAIL"]);
const REQUEST_FIELDS = Object.freeze([
  "envelope_version",
  "request_id",
  "goal",
  "intent",
  "available_capabilities",
  "provenance"
]);

class RequestEnvelopeError extends TypeError {
  constructor(path, detail) {
    super(path + " " + detail);
    this.name = "RequestEnvelopeError";
    this.code = "HOLD_SURFACE_REQUEST_NONPORTABLE_VALUE";
  }
}

function failRequest(path, detail) {
  throw new RequestEnvelopeError(path, detail);
}

function defineOwnData(target, name, value) {
  Object.defineProperty(target, name, {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
  return target;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function clonePortableRequestValue(value, path, stack = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) failRequest(path, "contains a non-finite number that portable JSON cannot preserve");
    if (Object.is(value, -0)) failRequest(path, "contains signed negative zero that portable JSON would rewrite");
    return value;
  }

  if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    failRequest(path, "contains a value type that portable JSON would rewrite, drop, or reject");
  }

  if (typeof value !== "object") failRequest(path, "contains an unsupported portable value");

  if (utilTypes.isProxy(value)) {
    failRequest(path, "uses a Proxy instead of portable authored data");
  }
  if (stack.has(value)) failRequest(path, "contains a cycle that portable JSON cannot represent");
  stack.add(value);

  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length) {
        failRequest(path, "contains symbol-keyed array properties portable JSON would drop");
      }
      const ownNames = Object.getOwnPropertyNames(value);
      const unexpected = ownNames.filter((name) => {
        if (name === "length") return false;
        if (!/^(0|[1-9][0-9]*)$/.test(name)) return true;
        return Number(name) >= value.length;
      });
      if (unexpected.length) {
        failRequest(path, "contains array properties portable JSON would not preserve: " + unexpected.sort().join(", "));
      }

      const out = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          failRequest(path + "[" + index + "]", "is a sparse array slot that portable JSON would rewrite to null");
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !("value" in descriptor)) {
          failRequest(path + "[" + index + "]", "uses an accessor instead of portable authored data");
        }
        out.push(clonePortableRequestValue(descriptor.value, path + "[" + index + "]", stack));
      }
      return out;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      failRequest(path, "uses a non-plain object instead of portable authored data");
    }
    if (Object.getOwnPropertySymbols(value).length) {
      failRequest(path, "contains symbol-keyed properties portable JSON would drop");
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const out = {};
    for (const name of Object.getOwnPropertyNames(value)) {
      const descriptor = descriptors[name];
      if (!descriptor.enumerable) {
        failRequest(path + "." + name, "is non-enumerable and portable JSON would drop it");
      }
      if (!("value" in descriptor)) {
        failRequest(path + "." + name, "uses an accessor instead of portable authored data");
      }
      defineOwnData(out, name, clonePortableRequestValue(descriptor.value, path + "." + name, stack));
    }
    return out;
  } finally {
    stack.delete(value);
  }
}

function snapshotAvailableCapabilities(value) {
  const path = "request.available_capabilities";
  if (utilTypes.isProxy(value)) failRequest(path, "uses a Proxy instead of a plain capability list");
  if (!Array.isArray(value)) failRequest(path, "must be an array when supplied");
  if (Object.getOwnPropertySymbols(value).length) {
    failRequest(path, "contains symbol-keyed properties outside the capability-list grammar");
  }

  const ownNames = Object.getOwnPropertyNames(value);
  const unexpected = ownNames.filter((name) => {
    if (name === "length") return false;
    if (!/^(0|[1-9][0-9]*)$/.test(name)) return true;
    return Number(name) >= value.length;
  });
  if (unexpected.length) {
    failRequest(path, "contains unsupported array properties: " + unexpected.sort().join(", "));
  }

  const out = [];
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) {
      failRequest(path + "[" + index + "]", "is a sparse capability-list slot");
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor)) {
      failRequest(path + "[" + index + "]", "uses an accessor instead of plain authored data");
    }
    if (typeof descriptor.value !== "string") {
      failRequest(path + "[" + index + "]", "must be a string capability id");
    }
    out.push(descriptor.value);
  }
  return out;
}

function snapshotRequest(request) {
  if (utilTypes.isProxy(request)) failRequest("request", "uses a Proxy instead of a plain request envelope");
  if (!request || typeof request !== "object" || Array.isArray(request)) throw new TypeError("request must be an object");

  const prototype = Object.getPrototypeOf(request);
  if (prototype !== Object.prototype && prototype !== null) {
    failRequest("request", "uses a non-plain object instead of a portable request envelope");
  }

  // The provisional v0.1 request envelope has an exact top-level grammar.
  // Snapshotting only known names would silently reinterpret every other own
  // key as omission, including hidden or symbol-keyed authored data that JSON
  // cannot carry. Establish own-key admissibility before selecting fields.
  if (Object.getOwnPropertySymbols(request).length) {
    failRequest("request", "contains symbol-keyed properties outside the v0.1 request-envelope grammar");
  }
  const ownNames = Object.getOwnPropertyNames(request);
  const unexpected = ownNames.filter((name) => !REQUEST_FIELDS.includes(name)).sort();
  if (unexpected.length) {
    failRequest("request." + unexpected[0], "is not part of the v0.1 request-envelope grammar");
  }

  const descriptors = Object.getOwnPropertyDescriptors(request);
  const out = {};
  for (const name of REQUEST_FIELDS) {
    const descriptor = descriptors[name];
    if (!descriptor) continue;
    if (!descriptor.enumerable) {
      failRequest("request." + name, "is non-enumerable and cannot survive the portable request boundary unchanged");
    }
    if (!("value" in descriptor)) {
      failRequest("request." + name, "uses an accessor instead of portable authored data");
    }
    if (descriptor.value === undefined) {
      failRequest("request." + name, "is explicitly undefined and would collapse to omission at the portable request boundary");
    }
    defineOwnData(out, name, descriptor.value);
  }

  if (out.available_capabilities !== undefined) {
    out.available_capabilities = snapshotAvailableCapabilities(out.available_capabilities);
  }
  if (out.provenance !== undefined) {
    out.provenance = clonePortableRequestValue(out.provenance, "request.provenance");
  }
  return out;
}

function assertRequest(request) {
  const safe = snapshotRequest(request);
  if (safe.envelope_version !== ENVELOPE_VERSION) throw new Error("unsupported envelope_version");
  if (typeof safe.request_id !== "string" || !safe.request_id) throw new Error("request_id is required");
  if (typeof safe.goal !== "string" || !safe.goal) throw new Error("goal is required");
  return safe;
}

function result(request, machine, status, fields = {}) {
  const safeRequest = assertRequest(request);
  if (!STATUSES.has(status)) throw new Error("invalid result status");
  return {
    envelope_version: ENVELOPE_VERSION,
    request_id: safeRequest.request_id,
    machine: clone(machine),
    status,
    candidate: fields.candidate === undefined ? null : clone(fields.candidate),
    dependencies: clone(fields.dependencies || []),
    evidence: clone(fields.evidence || []),
    warnings: clone(fields.warnings || []),
    holds: clone(fields.holds || []),
    provenance: clone(fields.provenance || safeRequest.provenance || {}),
    suggested_missing_capability: fields.suggested_missing_capability || null
  };
}

module.exports = {
  ENVELOPE_VERSION,
  STATUSES,
  REQUEST_FIELDS,
  RequestEnvelopeError,
  clone,
  clonePortableRequestValue,
  snapshotAvailableCapabilities,
  snapshotRequest,
  assertRequest,
  result
};
