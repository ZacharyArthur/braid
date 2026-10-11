import os


def safe_upload_path(base_dir, filename):
    """Join an untrusted filename onto base_dir and return the path."""
    base = os.path.abspath(base_dir)
    target = os.path.abspath(os.path.join(base, filename))
    if os.path.commonpath([base, target]) != base:
        raise ValueError("path traversal blocked")
    return target
