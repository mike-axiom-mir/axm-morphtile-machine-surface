"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { MACHINE, run } = require("../src");
const facingFixture = require("../fixtures/request.facing-up.json");
const checkerFixture = require("../fixtures/request.pattern-checker.json");
const stripesFixture = require("../fixtures/request.pattern-stripes.json");
const gradientFixture = require("../fixtures/request.axis-gradient.json");
const baseControlFixture = require("../fixtures/request.base-control.json");
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

function assertUniqueEvidenceIdentities(entries) {
  const ids = new Set();
  const requestIds = new Set();
  for (const entry of entries) {
    if (!entry || !entry.receipt) fail("render evidence entry is missing its receipt");
    const id = entry.receipt.id;
    const requestId = entry.receipt.request_id;
    if (typeof id !== "string" || !id) fail("render evidence case id must be a non-empty string");
    if (typeof requestId !== "string" || !requestId) fail(`${id}: render evidence request_id must be a non-empty string`);
    if (ids.has(id)) fail(`duplicate render evidence case id: ${id}`);
    if (requestIds.has(requestId)) fail(`duplicate render evidence request_id: ${requestId}`);
    ids.add(id);
    requestIds.add(requestId);
  }
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

function renderDeterministicObservation(MorphTile, request, label, renderOptions = DEFAULT_RENDER) {
  const first = renderCase(MorphTile, request, label, renderOptions);
  const second = renderCase(MorphTile, request, label, renderOptions);

  if (first.receipt.render_sha256 !== second.receipt.render_sha256) {
    fail(`${label}: repeated exact-input renders produced different pixel hashes`);
  }
  if (first.receipt.tower_pixels !== second.receipt.tower_pixels) {
    fail(`${label}: repeated exact-input renders produced different target coverage`);
  }

  return {
    frame: first.frame,
    receipt: {
      ...first.receipt,
      deterministic_replay: "PASS",
      pixel_baseline: "NOT_ESTABLISHED",
      evidence_tier: "TECHNICALLY_RENDERED_UNBASELINED",
      truth_boundary: "Repeated exact-input rendering proves deterministic technical rendering on the pinned runtime. This case has no reviewed pixel baseline and makes no aesthetic-quality claim."
    }
  };
}

function measureTargetPixelDelta(subjectFrame, controlFrame, targetId = "mt_tower") {
  if (!subjectFrame || !controlFrame) fail("effect delta requires subject and control frames");
  if (subjectFrame.width !== controlFrame.width || subjectFrame.height !== controlFrame.height) {
    fail("effect delta requires subject and control frames with identical dimensions");
  }
  if (typeof subjectFrame.pick !== "function" || typeof controlFrame.pick !== "function") {
    fail("effect delta requires target picking on subject and control frames");
  }
  if (!subjectFrame.pixels || !controlFrame.pixels || subjectFrame.pixels.length !== controlFrame.pixels.length) {
    fail("effect delta requires comparable subject and control pixel buffers");
  }

  let targetPixels = 0;
  let changedTargetPixels = 0;
  for (let y = 0; y < subjectFrame.height; y += 1) {
    for (let x = 0; x < subjectFrame.width; x += 1) {
      const subjectOwnsTarget = subjectFrame.pick(x, y) === targetId;
      const controlOwnsTarget = controlFrame.pick(x, y) === targetId;
      if (subjectOwnsTarget !== controlOwnsTarget) {
        fail(`effect delta target coverage drifted at ${x},${y}`);
      }
      if (!subjectOwnsTarget) continue;

      targetPixels += 1;
      const offset = (y * subjectFrame.width + x) * 4;
      let changed = false;
      for (let channel = 0; channel < 4; channel += 1) {
        if (subjectFrame.pixels[offset + channel] !== controlFrame.pixels[offset + channel]) {
          changed = true;
          break;
        }
      }
      if (changed) changedTargetPixels += 1;
    }
  }

  if (targetPixels <= 0) fail(`effect delta did not contain target ${targetId}`);
  return {
    target_id: targetId,
    target_pixels: targetPixels,
    changed_target_pixels: changedTargetPixels
  };
}

function attachEffectDelta(observation, control, targetId = "mt_tower") {
  const delta = measureTargetPixelDelta(observation.frame, control.frame, targetId);
  if (delta.changed_target_pixels <= 0) {
    fail(`${observation.receipt.id}: rendered surface effect is pixel-identical to control on ${targetId}`);
  }

  return {
    frame: observation.frame,
    receipt: {
      ...observation.receipt,
      effect_delta: {
        status: "PASS",
        ...delta,
        control_id: control.receipt.id,
        control_request_id: control.receipt.request_id,
        control_render_sha256: control.receipt.render_sha256
      },
      truth_boundary: "Repeated exact-input rendering proves deterministic technical rendering, and the explicit control proves the named surface treatment changes target pixels on the pinned runtime. Neither fact is an aesthetic-quality claim."
    }
  };
}

function buildEvidence(MorphTile, runtimeCommit, producerIdentity) {
  const producer = requireProducerIdentity(producerIdentity);
  const cases = [
    renderCase(MorphTile, facingFixture, "facing-up"),
    renderCase(MorphTile, checkerFixture, "checker")
  ];

  const baseControl = renderDeterministicObservation(MorphTile, baseControlFixture, "base-control");
  baseControl.receipt.evidence_tier = "TECHNICALLY_RENDERED_CONTROL";
  baseControl.receipt.control_for = ["axis-gradient", "stripes"];
  baseControl.receipt.truth_boundary = "This deterministic base-only render is an explicit technical control for effect-delta evidence. It has no reviewed-baseline or aesthetic authority.";

  const observations = [
    attachEffectDelta(renderDeterministicObservation(MorphTile, gradientFixture, "axis-gradient"), baseControl),
    attachEffectDelta(renderDeterministicObservation(MorphTile, stripesFixture, "stripes"), baseControl)
  ];
  const controls = [baseControl];

  assertUniqueEvidenceIdentities([...cases, ...observations, ...controls]);

  if (cases[0].receipt.render_sha256 === cases[1].receipt.render_sha256) {
    fail("facing-up and checker evidence unexpectedly produced identical render hashes");
  }
  for (const observation of observations) {
    for (const reviewed of cases) {
      if (observation.receipt.render_sha256 === reviewed.receipt.render_sha256) {
        fail(`${observation.receipt.id}: observation unexpectedly collapsed to reviewed case ${reviewed.receipt.id}`);
      }
    }
  }

  return {
    schema: "axm.morphtile.surface-render-evidence/v0.4",
    machine: MACHINE,
    producer,
    runtime: {
      repository: "mike-axiom-mir/axm-morphtile",
      commit: runtimeCommit || null
    },
    status: "TECHNICALLY_RENDERED",
    visual_quality: "NOT_REVIEWED",
    baseline_scope: cases.map((entry) => entry.receipt.id),
    cases,
    observations,
    controls
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
    reviewed_case_ids: expectedIds,
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
  for (const entry of [...evidence.cases, ...evidence.observations, ...evidence.controls]) {
    fs.writeFileSync(
      path.join(outputDir, `${entry.receipt.id}.png`),
      png.encode(entry.frame.width, entry.frame.height, entry.frame.pixels)
    );
  }

  const plain = {
    ...evidence,
    pixel_baseline: pixelBaseline,
    cases: evidence.cases.map((entry) => entry.receipt),
    observations: evidence.observations.map((entry) => entry.receipt),
    controls: evidence.controls.map((entry) => entry.receipt)
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
    cases: receipt.cases.map(({ id, render_sha256, tower_pixels }) => ({ id, render_sha256, tower_pixels })),
    observations: receipt.observations.map(({ id, render_sha256, tower_pixels, deterministic_replay, pixel_baseline, effect_delta }) => ({
      id,
      render_sha256,
      tower_pixels,
      deterministic_replay,
      pixel_baseline,
      effect_delta
    })),
    controls: receipt.controls.map(({ id, render_sha256, tower_pixels, deterministic_replay }) => ({
      id,
      render_sha256,
      tower_pixels,
      deterministic_replay
    }))
  })}\n`);
}

module.exports = {
  DEFAULT_RENDER,
  applyCandidateToTower,
  renderCase,
  renderDeterministicObservation,
  measureTargetPixelDelta,
  attachEffectDelta,
  buildEvidence,
  verifyBaseline,
  writeEvidence,
  requireProducerIdentity,
  assertUniqueEvidenceIdentities
};
