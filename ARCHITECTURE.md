# Architecture

`src/index.js` maps bounded surface intent to an ordinary generated material facet.

`src/surface-rules.js` owns creation-side surface vocabulary. In v0.2 it compiles six named `facing` directions into MorphTile's existing normal-aware paint expression context (`nx`, `ny`, `nz`). This is machine knowledge: MorphTile already exposes the representation/runtime primitive, so the core does not need a new special case.

External dependencies are declared and may HOLD; no bridge is contacted. Invalid or conflicting surface rules HOLD explicitly instead of being repaired silently.

Dependency direction is one-way: this machine may consume MorphTile's public contract; MorphTile core must never import this machine. Candidate output is data, not canon. There is no shared protocol package in this pass: the local envelope copy may only be extracted after multiple real machines prove a stable common contract.

Repository isolation rules: no sibling imports, no sibling writes, no shared mutable state, no assumed installed machines, and no cloud dependency for the tested path.
