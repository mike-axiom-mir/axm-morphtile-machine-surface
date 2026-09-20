"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const facingFixture = require("../fixtures/request.facing-up.json");
const gradientFixture = require("../fixtures/request.axis-gradient.json");
const stripesFixture = require("../fixtures/request.pattern-stripes.json");
const {
  assertUniqueEvidenceIdentities,
  buildEvidence,
  renderCase,
  renderDeterministicObservation,
  verifyBaseline
} = require("../tools/render-evidence");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const producerRepository = process.env.SURFACE_PRODUCER_REPOSITORY;
const producerCommit = process.env.SURFACE_PRODUCER_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

test("render evidence identities fail closed on duplicate case or request ids", () => {
  const one = { receipt: { id: "one", request_id: "request-one" } };
  const duplicateCase = { receipt: { id: "one", request_id: "request-two" } };
  const duplicateRequest = { receipt: { id: "two", request_id: "request-one" } };

  assert.doesNotThrow(() => assertUniqueEvidenceIdentities([one]));
  assert.throws(
    () => assertUniqueEvidenceIdentities([one, duplicateCase]),
    /duplicate render evidence case id: one/
  );
  assert.throws(
    () => assertUniqueEvidenceIdentities([one, duplicateRequest]),
    /duplicate render evidence request_id: request-one/
  );
});

integrationTest("pinned MorphTile rasterizer separates reviewed pixel baselines from unbaselined deterministic Surface observations", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "evidence runtime must match machine.json pin");
  assert.equal(producerRepository, "mike-axiom-mir/axm-morphtile-machine-surface", "producer repository must be explicitly pinned");
  assert.match(producerCommit || "", /^[0-9a-f]{40}$/, "producer commit must be explicitly pinned to an exact SHA");

  const MorphTile = require(path.resolve(runtimePath));
  const producer = { repository: producerRepository, commit: producerCommit };

  const first = renderCase(MorphTile, facingFixture, "facing-up-first");
  const second = renderCase(MorphTile, facingFixture, "facing-up-second");
  assert.equal(first.receipt.render_sha256, second.receipt.render_sha256, "same exact candidate must render identically");
  assert.equal(first.receipt.tower_pixels, second.receipt.tower_pixels, "same evidence camera must cover the same target pixels");
  assert.ok(first.receipt.tower_pixels > 0, "evidence must actually contain mt_tower pixels");
  assert.equal(first.receipt.technical_render, "PASS");
  assert.equal(first.receipt.visual_judgement, "NOT_REVIEWED");

  const gradientObservation = renderDeterministicObservation(MorphTile, gradientFixture, "axis-gradient-test");
  assert.equal(gradientObservation.receipt.deterministic_replay, "PASS");
  assert.equal(gradientObservation.receipt.pixel_baseline, "NOT_ESTABLISHED");
  assert.equal(gradientObservation.receipt.evidence_tier, "TECHNICALLY_RENDERED_UNBASELINED");
  assert.equal(gradientObservation.receipt.visual_judgement, "NOT_REVIEWED");
  assert.ok(gradientObservation.receipt.tower_pixels > 0);

  const stripesObservation = renderDeterministicObservation(MorphTile, stripesFixture, "stripes-test");
  assert.equal(stripesObservation.receipt.deterministic_replay, "PASS");
  assert.equal(stripesObservation.receipt.pixel_baseline, "NOT_ESTABLISHED");
  assert.equal(stripesObservation.receipt.evidence_tier, "TECHNICALLY_RENDERED_UNBASELINED");
  assert.equal(stripesObservation.receipt.visual_judgement, "NOT_REVIEWED");
  assert.ok(stripesObservation.receipt.tower_pixels > 0);

  const evidence = buildEvidence(MorphTile, runtimeCommit, producer);
  assert.equal(evidence.schema, "axm.morphtile.surface-render-evidence/v0.3");
  assert.equal(evidence.status, "TECHNICALLY_RENDERED");
  assert.equal(evidence.visual_quality, "NOT_REVIEWED");
  assert.deepEqual(evidence.producer, producer, "portable evidence must preserve the exact Surface producer revision");
  assert.equal(evidence.runtime.commit, runtimeCommit);
  assert.deepEqual(evidence.baseline_scope, ["facing-up", "checker"]);
  assert.deepEqual(evidence.cases.map((entry) => entry.receipt.id), ["facing-up", "checker"]);
  assert.deepEqual(evidence.observations.map((entry) => entry.receipt.id), ["axis-gradient", "stripes"]);
  assert.notEqual(
    evidence.cases[0].receipt.render_sha256,
    evidence.cases[1].receipt.render_sha256,
    "facing and checker candidates must not collapse to an identical rendered pixel receipt"
  );
  for (const observation of evidence.observations) {
    assert.notEqual(
      observation.receipt.render_sha256,
      evidence.cases[0].receipt.render_sha256,
      `${observation.receipt.id}: observation must not collapse to the facing-up reviewed case`
    );
    assert.notEqual(
      observation.receipt.render_sha256,
      evidence.cases[1].receipt.render_sha256,
      `${observation.receipt.id}: observation must not collapse to the checker reviewed case`
    );
  }
  for (const entry of evidence.cases) {
    assert.equal(entry.receipt.technical_render, "PASS");
    assert.equal(entry.receipt.visual_judgement, "NOT_REVIEWED");
    assert.ok(entry.receipt.tower_pixels > 0);
  }
  for (const entry of evidence.observations) {
    assert.equal(entry.receipt.technical_render, "PASS");
    assert.equal(entry.receipt.deterministic_replay, "PASS");
    assert.equal(entry.receipt.pixel_baseline, "NOT_ESTABLISHED");
    assert.equal(entry.receipt.visual_judgement, "NOT_REVIEWED");
    assert.ok(entry.receipt.tower_pixels > 0);
  }

  const baseline = verifyBaseline(evidence, undefined, producer);
  assert.equal(baseline.status, "PASS", "exact reviewed pixel baseline must match");
  assert.deepEqual(baseline.reviewed_case_ids, ["checker", "facing-up"], "baseline verifier must name only reviewed cases");
  assert.deepEqual(baseline.producer, producer, "baseline receipt must bind the same external producer trust anchor");

  const observationTampered = {
    ...evidence,
    observations: evidence.observations.map((entry) => ({
      ...entry,
      receipt: { ...entry.receipt, render_sha256: "0".repeat(64) }
    }))
  };
  const unchangedBaseline = verifyBaseline(observationTampered, undefined, producer);
  assert.equal(unchangedBaseline.status, "PASS", "explicitly unbaselined observations must not silently enter reviewed baseline authority");

  assert.throws(
    () => buildEvidence(MorphTile, runtimeCommit),
    /explicit \{ repository, commit \} is required/,
    "render evidence generation must fail closed when producer provenance is not supplied"
  );

  const missingProducer = { ...evidence };
  delete missingProducer.producer;
  assert.throws(
    () => verifyBaseline(missingProducer, undefined, producer),
    /producer identity missing from evidence/,
    "baseline verification must reject portable evidence that lost producer provenance"
  );

  const mismatchedProducer = {
    ...evidence,
    producer: { ...producer, commit: "0".repeat(40) }
  };
  assert.throws(
    () => verifyBaseline(mismatchedProducer, undefined, producer),
    /producer commit mismatch/,
    "baseline verification must bind evidence to the externally supplied exact Surface revision"
  );

  const tampered = {
    ...evidence,
    cases: evidence.cases.map((entry, index) => index === 0
      ? { ...entry, receipt: { ...entry.receipt, render_sha256: "0".repeat(64) } }
      : entry)
  };
  assert.throws(
    () => verifyBaseline(tampered, undefined, producer),
    /rendered pixels drifted from the explicit baseline/,
    "reviewed pixel drift must fail closed instead of being silently accepted"
  );
});
