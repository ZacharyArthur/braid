# CLI-free specs in braid/, not OpenSpec's openspec/

The spec workflow borrows OpenSpec's model (specs as source of truth, changes with ADDED/MODIFIED/REMOVED deltas, archive merges) but not its CLI: OpenSpec's skills are generated from 20-30 KB templates that call the `openspec` binary at every step. braid's agent edits the markdown directly. We also chose a braid-branded `braid/` folder over `openspec/`, deliberately giving up compatibility with OpenSpec's CLI and dashboard so every braid artifact (specs, routes, ADRs, glossary, map, handoff) shares one root.
