# YAGNI > KISS > DRY, with the rule of three

braid extends ponytail's YAGNI-only core to all three clean-code pillars, and fixes their order for when they conflict: don't build it, then build it plainly, then don't repeat it. DRY is last on purpose: naive DRY produces the speculative shared abstractions YAGNI exists to stop, so code is extracted only on a third copy that changes for the same reason, while *knowledge* (constants, config, schemas, business rules) gets one home immediately.
