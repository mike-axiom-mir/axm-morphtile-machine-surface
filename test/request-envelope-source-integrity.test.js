const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.facing-up.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function trappingProxy(target, calls) {
  return new Proxy(target, {
    getPrototypeOf(value) {
      calls.count += 1;
      return Reflect.getPrototypeOf(value);
    },
    ownKeys(value) {
      calls.count += 1;
      return Reflect.ownKeys(value);
    },
    getOwnPropertyDescriptor(value, key) {
      calls.count += 1;
      return Reflect.getOwnPropertyDescriptor(value, key);
    },
    get(value, key, receiver) {
      calls.count += 1;
      return Reflect.get(value, key, receiver);
    }
  });
}

test("request intent accessor is rejected before caller code executes", () => {
  const request = clone(fixture);
  let calls = 0;
  const authoredIntent = request.intent;
  Object.defineProperty(request, "intent", {
    enumerable: true,
    configurable: true,
    get() {
      calls += 1;
      return authoredIntent;
    }
  });

  assert.throws(() => run(request), /request\.intent uses an accessor/);
  assert.equal(calls, 0, "Surface must not execute a request-level intent accessor before deciding admissibility");
});

test("proxied request envelope is rejected before reflective traps execute", () => {
  const calls = { count: 0 };
  const request = trappingProxy(clone(fixture), calls);

  assert.throws(() => run(request), /request uses a Proxy/);
  assert.equal(calls.count, 0, "request Proxy traps must not execute before Surface rejects the envelope");
});

test("available capability lists are inertly snapshotted before dependency lookup", () => {
  const calls = { count: 0 };
  const request = clone(fixture);
  request.request_id = "surface-request-capability-proxy";
  request.intent = { external_dependency: "bridge:cloth" };
  request.available_capabilities = trappingProxy(["bridge:cloth"], calls);

  assert.throws(() => run(request), /request\.available_capabilities uses a Proxy/);
  assert.equal(calls.count, 0, "capability-list Proxy traps must not execute during dependency lookup");
});

test("available capability semantics require a real list instead of String.includes lookalikes", () => {
  const request = clone(fixture);
  request.request_id = "surface-request-capability-string";
  request.intent = { external_dependency: "bridge:cloth" };
  request.available_capabilities = "prefix-bridge:cloth-suffix";

  assert.throws(() => run(request), /request\.available_capabilities must be an array when supplied/);
});

test("ordinary capability arrays remain usable after inert snapshotting", () => {
  const request = clone(fixture);
  request.request_id = "surface-request-capability-control";
  request.intent = { external_dependency: "bridge:cloth" };
  request.available_capabilities = ["bridge:cloth"];

  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.holds.length, 0);
});

test("provenance accessors cannot execute during result transport", () => {
  const request = clone(fixture);
  request.request_id = "surface-request-provenance-accessor";
  let calls = 0;
  const provenance = {};
  Object.defineProperty(provenance, "caller", {
    enumerable: true,
    configurable: true,
    get() {
      calls += 1;
      return "caller-controlled";
    }
  });
  request.provenance = provenance;

  assert.throws(() => run(request), /request\.provenance\.caller uses an accessor/);
  assert.equal(calls, 0, "result provenance cloning must not execute caller-controlled accessors");
});
