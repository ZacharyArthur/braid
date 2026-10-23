## MODIFIED Requirements

### Requirement: Mods stay out of braid and Codex

The `braid` plugin SHALL NOT load any mod, and the Codex marketplace SHALL NOT list any mod.

#### Scenario: braid alone

- **WHEN** a user installs only braid, in any of the four harnesses
- **THEN** no mod runs

#### Scenario: Codex marketplace

- **WHEN** a Codex user lists the braid marketplace's plugins
- **THEN** only braid is listed
