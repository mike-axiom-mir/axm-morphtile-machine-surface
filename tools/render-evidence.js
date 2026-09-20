"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { MACHINE, run } = require("../src");
const facingFixture = require("../fixtures/request.facing-up.json");
const checkerFixture = require("../fixtures/request.pattern-checker.json");
const expectedBaseline = require("../fixtures/render-evidence.expected.json");

const SURFACE_REPOSITORY = "mike-axiom-mir/axm-morphtile-machine-surface";
const COMMIT_RE = /^[0-9a-f]{40}$/;

const DEFAULT_RENDER = Object.freeze({
  width: 360,
  height: 300,
  camera: Object.freeze({ yaw: 0.7, pitch: 0.3, dist: 19 })
});

function fail(message) {
  const error = new Error(message);
  error.code = "SURFACE_RENDER_EVIDENCE_FAILED";
  throw error;
}

function requireProducerIdentity(identity, label = "producer identity") {
  if (!identity || typeof identity !== "object" || Array.isArray(identity)) {
    fail(`${label}: explicit { repository, commit } is required`);
  }
  if (identity.repository !== SURFACE_REPOSITORY) {
    fail(`${label}: repository must be ${SURFACE_REPOSITORY}`);
  }
  if (typeof identity.commit !== "string" || !COMMIT_RE.test(identity.commit)) {
    fail(`${label}: commit must be an exact 40-character lowercase git SHA`);
  }
  return Object.freeze({ repository: identity.repository, commit: identity.commit });
}

function applyCandidateToTower(MorphTile, result, label) {
  if (!result || result.status !== "CANDIDATE" || !result.candidate || result.candidate.facet !== "material") {
    fail(`${label}: Surface Machine did not produce a material candidate`);
  }

  const ws = MorphTile.createWorkspace(MorphTile.seedWorld());
  const clone = MorphTile.act(ws, { do: "clone", label: `surface evidence ${label}` });
  if (!clone || !clone.candidate) fail(`${label}: MorphTile clone failed`);

  const edit = MorphTile.act(ws, {
    do: "edit",
    candidate: clone.candidate,
    op: {
      op: "facet.swap",
      id: "mt_tower",
      facet: "material",
      value: result.candidate.value
    }
  });
  if (!edit || !edit.ok) fail(`${label}: MorphTile rejected the material candidate`);

  const planned = MorphTile.act(ws, { do: "plan", candidates: [clone.candidate] });
  if (!planned || !planned.plan || planned.plan.status !== "READY") {
    fail(`${label}: MorphTile did not produce a READY merge plan`);
  }

  const committed = MorphTile.act(ws, { do: "commit", plan: planned.plan.id });
  if (!committed || !committed.ok) fail(`${label}: MorphTile commit failed in the disposable evidence workspace`);

  return ws;
}

function renderCase(MorphTile, request, label, renderOptions = DEFAULT_RENDER) {
  const result = run(request);
  const ws = applyCandidateToTower(MorphTile, result, label);
  const frame = MorphTile.renderAsset(ws.live, renderOptions);
  const renderReceipt = MorphTile.renderReceipt(frame);

  let towerPixels = 0;
  if (typeof frame.pick === "function") {
    for (let y = 0; y < frame.height; y += 1) {
      for (let x = 0; x < frame.width; x += 1) {
        if (frame.pick(x, y) === "mt_tower") towerPixels += 1;
      }
    }
  }
  if (towerPixels <= 0) fail(`${label}: evidence camera did not render mt_tower`);

  return {
    frame,
    receipt: {
      id: label,
      request_id: request.request_id,
      candidate_status: result.status,
      technical_render: "PASS",
      visual_judgement: "NOT_REVIEWED",
      width: frame.width,
      height: frame.height,
      tower_pixels: towerPixels,
      render_sha256: renderReceipt.sha256,
      stats: frame.stats,
      producer_evidence: result.evidence,
      truth_boundary: "A deterministic render proves that the exact candidate reached the pinned MorphTile rasterizer. It does not prove that the appearance is visually good."
    }
  };
}

function buildEvidence(MorphTile, runtimeCommit, producerIdentity) {
  const producer = requireProducerIdentity(producerIdentity);
  const cases = [
    renderCase(MorphTile, facingFixture, "facing-up"),
    renderCase(MorphTile, checkerFixture, "checker")
  ];

  if (cases[0].receipt.render_sha256 === cases[1].receipt.render_sha256) {
    fail("facing-up and checker evidence unexpectedly produced identical render hashes");
  }

  return {
    schema: "axm.morphtile.surface-render-evidence/v0.2",
    machine: MACHINE,
    producer,
    runtime: {
      repository: "mike-axiom-mir/axm-morphtile",
      commit: runtimeCommit || null
    },
    status: "TECHNICALLY_RENDERED",
    visual_quality: "NOT_REVIEWED",
    cases
  };
}

function verifyBaseline(evidence, baseline = expectedBaseline, expectedProducerIdentity) {
  const expectedProducer = requireProducerIdentity(expectedProducerIdentity, "expected producer identity");
  if (!evidence || !evidence.producer) fail("render baseline producer identity missing from evidence");
  if (evidence.producer.repository !== expectedProducer.repository) {
    fail(`render baseline producer repository mismatch: expected ${expectedProducer.repository}`);
  }
  if (evidence.producer.commit !== expectedProducer.commit) {
    fail(`render baseline producer commit mismatch: expected ${expectedProducer.commit}`);
  }
  if (!evidence.runtime || evidence.runtime.commit !== baseline.runtime_commit) {
    fail(`render baseline runtime mismatch: expected ${baseline.runtime_commit}`);
  }

  const actual = new Map(evidence.cases.map((entry) => [entry.receipt.id, entry.receipt]));
  const expectedIds = Object.keys(baseline.cases).sort();
  const actualIds = [...actual.keys()].sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    fail(`render baseline case set drifted: expected ${expectedIds.join(",")}, got ${actualIds.join(",")}`);
  }

  for (const id of expectedIds) {
    const expected = baseline.cases[id];
    const receipt = actual.get(id);
    if (receipt.request_id !== expected.request_id) fail(`${id}: request identity drifted from the render baseline`);
    if (receipt.render_sha256 !== expected.render_sha256) fail(`${id}: rendered pixels drifted from the explicit baseline`);
    if (receipt.tower_pixels !== expected.tower_pixels) fail(`${id}: target pixel coverage drifted from the explicit baseline`);
  }

  return {
    schema: baseline.schema,
    status: "PASS",
    producer: expectedProducer,
    runtime_commit: baseline.runtime_commit,
    meaning: baseline.meaning
  };
}

function writeEvidence(outputDir) {
  const runtimePath = process.env.MORPHTILE_CORE_PATH;
  const runtimeCommit = process.env.MORPHTILE_COMMIT;
  const producerRepository = process.env.SURFACE_PRODUCER_REPOSITORY;
  const producerCommit = process.env.SURFACE_PRODUCER_COMMIT;
  if (!runtimePath) fail("MORPHTILE_CORE_PATH is required");
  if (!runtimeCommit) fail("MORPHTILE_COMMIT is required");

  const producer = requireProducerIdentity({ repository: producerRepository, commit: producerCommit });
  const resolvedRuntime = path.resolve(runtimePath);
  const MorphTile = require(resolvedRuntime);
  const runtimeRoot = path.resolve(path.dirname(resolvedRuntime), "..");
  const png = require(path.join(runtimeRoot, "tools", "png.js"));
  const evidence = buildEvidence(MorphTile, runtimeCommit, producer);
  const pixelBaseline = verifyBaseline(evidence, expectedBaseline, producer);

  fs.mkdirSync(outputDir, { recursive: true });
  for (const entry of evidence.cases) {
    fs.writeFileSync(
      path.join(outputDir, `${entry.receipt.id}.png`),
      png.encode(entry.frame.width, entry.frame.height, entry.frame.pixels)
    );
  }

  const plain = {
    ...evidence,
    pixel_baseline: pixelBaseline,
    cases: evidence.cases.map((entry) => entry.receipt)
  };
  fs.writeFileSync(path.join(outputDir, "receipt.json"), `${JSON.stringify(plain, null, 2)}\n`);
  return plain;
}

if (require.main === module) {
  const out = path.resolve(process.argv[2] || path.join("evidence", "surface"));
  const receipt = writeEvidence(out);
  process.stdout.write(`${JSON.stringify({
    status: receipt.status,
    visual_quality: receipt.visual_quality,
    pixel_baseline: receipt.pixel_baseline.status,
    producer: receipt.producer,
    runtime: receipt.runtime,
    cases: receipt.cases.map(({ id, render_sha256, tower_pixels }) => ({ id, render_sha256, tower_pixels }))
  })}\n`);
}

module.exports = {
  DEFAULT_RENDER,
  applyCandidateToTower,
  renderCase,
  buildEvidence,
  verifyBaseline,
  writeEvidence,
  requireProducerIdentity
};
