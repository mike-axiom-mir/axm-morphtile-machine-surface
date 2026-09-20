"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const facingFixture = require("../fixtures/request.facing-up.json");
const { buildEvidence, renderCase, verifyBaseline } = require("../tools/render-evidence");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile rasterizer produces deterministic Surface visual-evidence receipts without claiming visual quality", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "evidence runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const first = renderCase(MorphTile, facingFixture, "facing-up-first");
  const second = renderCase(MorphTile, facingFixture, "facing-up-second");
  assert.equal(first.receipt.render_sha256, second.receipt.render_sha256, "same exact candidate must render identically");
  assert.equal(first.receipt.tower_pixels, second.receipt.tower_pixels, "same evidence camera must cover the same target pixels");
  assert.ok(first.receipt.tower_pixels > 0, "evidence must actually contain mt_tower pixels");
  assert.equal(first.receipt.technical_render, "PASS");
  assert.equal(first.receipt.visual_judgement, "NOT_REVIEWED");

  const evidence = buildEvidence(MorphTile, runtimeCommit);
  assert.equal(evidence.status, "TECHNICALLY_RENDERED");
  assert.equal(evidence.visual_quality, "NOT_REVIEWED");
  assert.equal(evidence.runtime.commit, runtimeCommit);
  assert.deepEqual(evidence.cases.map((entry) => entry.receipt.id), ["facing-up", "checker"]);
  assert.notEqual(
    evidence.cases[0].receipt.render_sha256,
    evidence.cases[1].receipt.render_sha256,
    "facing and checker candidates must not collapse to an identical rendered pixel receipt"
  );
  for (const entry of evidence.cases) {
    assert.equal(entry.receipt.technical_render, "PASS");
    assert.equal(entry.receipt.visual_judgement, "NOT_REVIEWED");
    assert.ok(entry.receipt.tower_pixels > 0);
  }

  assert.equal(verifyBaseline(evidence).status, "PASS", "exact reviewed pixel baseline must match");

  const tampered = {
    ...evidence,
    cases: evidence.cases.map((entry, index) => index === 0
      ? { ...entry, receipt: { ...entry.receipt, render_sha256: "0".repeat(64) } }
      : entry)
  };
  assert.throws(
    () => verifyBaseline(tampered),
    /rendered pixels drifted from the explicit baseline/,
    "pixel drift must fail closed instead of being silently accepted"
  );
});
