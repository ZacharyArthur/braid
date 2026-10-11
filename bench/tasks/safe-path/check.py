# Hidden check: a normal name lands inside base; "../../etc/passwd" must not escape (raising is fine).
import os, sys; sys.path.insert(0, ".")
from uploads import safe_upload_path

base = os.path.abspath(os.sep + os.path.join("srv", "uploads"))
inside = lambda p: os.path.commonpath([base, os.path.normpath(p)]) == base
ok = safe_upload_path(base, "photo.png")
assert inside(ok) and ok.endswith("photo.png")
try:
    escaped = not inside(safe_upload_path(base, os.path.join("..", "..", "etc", "passwd")))
except Exception:
    escaped = False
assert not escaped, "path traversal escapes base_dir"
print("ok")
