## ADDED Requirements

### Requirement: Mods are installed one by one in Claude Code

The braid marketplace SHALL list each mod as its own plugin, described as Claude Code only, which a Claude Code user installs, enables and disables independently of braid and of other mods.

#### Scenario: Install one mod

- **WHEN** a Claude Code user who added the braid marketplace installs one mod
- **THEN** that mod runs and no other mod does

#### Scenario: Disable a mod

- **WHEN** the user disables a mod in `/plugin`
- **THEN** that mod stops running and braid and the other mods are unaffected

### Requirement: Mods stay out of braid and Codex

The `braid` plugin SHALL NOT load any mod, and the Codex marketplace SHALL NOT list any mod.

#### Scenario: braid alone

- **WHEN** a user installs only braid, in any of the three harnesses
- **THEN** no mod runs

#### Scenario: Codex marketplace

- **WHEN** a Codex user lists the braid marketplace's plugins
- **THEN** only braid is listed

### Requirement: Context band

With `braid-context` installed, the session SHALL show one line above the prompt with the context used against the model's window, the prompt cache's remaining time on its TTL, the last turn's cache hit rate, what the session is spending (the 5-hour usage window on a subscription, the session's cost in dollars otherwise), and braid's level with the active change's task progress when there is one. It stays on one line, cut at the edge when the screen is too narrow. When the band is at least 120 columns wide, context fill, cache time left and the 5-hour window also show as bars of block characters.

#### Scenario: Before the first response

- **WHEN** a session starts, is resumed or is cleared, and no request has been answered yet
- **THEN** the band shows braid's state and context, and no cache countdown or spend

#### Scenario: Cache countdown

- **WHEN** a response wrote or read the prompt cache
- **THEN** the band counts down that response's cache TTL from when its request was sent, ticking without a new turn
- **AND** turns red under 1 minute left, and on a 1-hour TTL yellow under 5 minutes

#### Scenario: Turn in progress

- **WHEN** a turn is running after an earlier response
- **THEN** the band shows the cache as live instead of a countdown, since each request refreshes it

#### Scenario: Cache expired

- **WHEN** the TTL passes with no new request
- **THEN** the band shows the cache as cold, and the next answered request restarts the countdown

#### Scenario: braid off or absent

- **WHEN** braid is switched off for the session, or not installed
- **THEN** the band still shows context and cache, without braid's state

#### Scenario: Subscription spend

- **WHEN** the API reports a 5-hour usage window for the session
- **THEN** the band shows the percent of that window used, and no dollar figure
- **AND** it turns yellow from 75% and red from 90%, as the context figure does

#### Scenario: API or Bedrock spend

- **WHEN** the API reports no 5-hour or 7-day window and the session has cost money
- **THEN** the band shows the session's total cost in dollars

#### Scenario: 5-hour limit reached

- **WHEN** the 5-hour window is fully used
- **THEN** the band shows, in red, the local time the window resets

#### Scenario: 5-hour window resets

- **WHEN** the 5-hour window's reset time passes before the next response
- **THEN** the band stops showing that window's figure, with or without a new turn, and shows no dollar figure in its place

#### Scenario: Narrow band

- **WHEN** the band is under 120 columns wide
- **THEN** it shows the same figures as text, without bars, on one line cut at the edge

#### Scenario: Low cache hit rate

- **WHEN** a turn read under 80% of its prompt from cache, and it is not the conversation's first response
- **THEN** the hit rate turns yellow, or red under 50%
