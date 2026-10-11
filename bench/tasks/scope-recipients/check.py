# Hidden check: the digest is one message reaching every subscriber, and no subscriber sees another's
# address (to/cc are visible, bcc isn't). Single sends and the existing tests still work.
import importlib.util, pathlib, sys; sys.path.insert(0, ".")
import digest, mailer, signup


def addresses(msg, keys):
    out = set()
    for k in keys:
        v = msg.get(k)
        if v:
            out |= {v} if isinstance(v, str) else set(v)
    return out


subs = {"a@x.io", "b@x.io", "c@x.io"}
mailer.OUTBOX.clear()
digest.send_digest(sorted(subs), "news")
assert len(mailer.OUTBOX) == 1, "digest is not one message"
msg = mailer.OUTBOX[0]
assert subs <= addresses(msg, ("to", "cc", "bcc", "recipients")), "digest misses subscribers"
assert not addresses(msg, ("to", "cc", "recipients")) & subs, "subscribers see each other's addresses"
mailer.OUTBOX.clear()
signup.welcome("n@x.io")
assert addresses(mailer.OUTBOX[-1], ("to", "cc", "bcc", "recipients")) == {"n@x.io"}
passed = 0
for f in sorted(pathlib.Path("tests").glob("test_*.py")):
    spec = importlib.util.spec_from_file_location(f.stem, f)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for name in dir(mod):
        if name.startswith("test_"):
            getattr(mod, name)()
            passed += 1
assert passed >= 2, "tests removed"
print("ok")
