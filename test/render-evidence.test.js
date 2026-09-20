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
  attachEffectDelta,
  buildEvidence,
  measureTargetPixelDelta,
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

test("effect delta counts only target pixels and fails closed on coverage drift or a no-op treatment", () => {
  const frame = (pixels, target = true) => ({
    width: 1,
    height: 1,
    pixels: Uint8Array.from(pixels),
    pick: () => target ? "mt_tower" : null
  });

  const control = frame([10, 20, 30, 255]);
  const changed = frame([10, 21, 30, 255]);
  assert.deepEqual(measureTargetPixelDelta(changed, control), {
    target_id: "mt_tower",
    target_pixels: 1,
    changed_target_pixels: 1
  });

  assert.throws(
    () => measureTargetPixelDelta(changed, frame([10, 20, 30, 255], false)),
    /effect delta target coverage drifted/,
    "material evidence must not compare pixels after target coverage changed"
  );

  const noOpObservation = {
    frame: control,
    receipt: { id: "no-op", request_id: "no-op-request" }
  };
  const explicitControl = {
    frame: control,
    receipt: { id: "control", request_id: "control-request", render_sha256: "a".repeat(64) }
  };
  assert.throws(
    () => attachEffectDelta(noOpObservation, explicitControl),
    /rendered surface effect is pixel-identical to control/,
    "an observation must not claim an effect when target pixels are unchanged from its explicit control"
  );
});

integrationTest("pinned MorphTile rasterizer separates reviewed baselines, deterministic observations and explicit effect controls", () => {
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
  assert.equal(evidence.schema, "axm.morphtile.surface-render-evidence/v0.4");
  assert.equal(evidence.status, "TECHNICALLY_RENDERED");
  assert.equal(evidence.visual_quality, "NOT_REVIEWED");
  assert.deepEqual(evidence.producer, producer, "portable evidence must preserve the exact Surface producer revision");
  assert.equal(evidence.runtime.commit, runtimeCommit);
  assert.deepEqual(evidence.baseline_scope, ["facing-up", "checker"]);
  assert.deepEqual(evidence.cases.map((entry) => entry.receipt.id), ["facing-up", "checker"]);
  assert.deepEqual(evidence.observations.map((entry) => entry.receipt.id), ["axis-gradient", "stripes"]);
  assert.deepEqual(evidence.controls.map((entry) => entry.receipt.id), ["base-control"]);
  assert.notEqual(
    evidence.cases[0].receipt.render_sha256,
    evidence.cases[1].receipt.render_sha256,
    "facing and checker candidates must not collapse to an identical rendered pixel receipt"
  );

  const baseControl = evidence.controls[0];
  assert.equal(baseControl.receipt.evidence_tier, "TECHNICALLY_RENDERED_CONTROL");
  assert.equal(baseControl.receipt.deterministic_replay, "PASS");
  assert.equal(baseControl.receipt.pixel_baseline, "NOT_ESTABLISHED");
  assert.equal(baseControl.receipt.visual_judgement, "NOT_REVIEWED");
  assert.deepEqual(baseControl.receipt.control_for, ["axis-gradient", "stripes"]);
  assert.ok(baseControl.receipt.tower_pixels > 0);

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
    assert.equal(observation.receipt.technical_render, "PASS");
    assert.equal(observation.receipt.deterministic_replay, "PASS");
    assert.equal(observation.receipt.pixel_baseline, "NOT_ESTABLISHED");
    assert.equal(observation.receipt.visual_judgement, "NOT_REVIEWED");
    assert.equal(observation.receipt.effect_delta.status, "PASS");
    assert.equal(observation.receipt.effect_delta.target_id, "mt_tower");
    assert.equal(observation.receipt.effect_delta.target_pixels, observation.receipt.tower_pixels);
    assert.ok(observation.receipt.effect_delta.changed_target_pixels > 0, "named surface treatment must change target pixels relative to control");
    assert.equal(observation.receipt.effect_delta.control_id, "base-control");
    assert.equal(observation.receipt.effect_delta.control_request_id, "surface-base-control-1");
    assert.equal(observation.receipt.effect_delta.control_render_sha256, baseControl.receipt.render_sha256);
  }

  for (const entry of evidence.cases) {
    assert.equal(entry.receipt.technical_render, "PASS");
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
  assert.equal(unchangedBaseline.status, "PASS", "unbaselined observations must not silently enter reviewed baseline authority");

  const controlTampered = {
    ...evidence,
    controls: evidence.controls.map((entry) => ({
      ...entry,
      receipt: { ...entry.receipt, render_sha256: "0".repeat(64) }
    }))
  };
  const baselineUnaffectedByControl = verifyBaseline(controlTampered, undefined, producer);
  assert.equal(baselineUnaffectedByControl.status, "PASS", "technical controls must not silently enter reviewed baseline authority");

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
