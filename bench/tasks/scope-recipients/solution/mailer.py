OUTBOX = []  # sent messages; the provider client reads from here


def send(to, subject, body, bcc=()):
    """Send one email to `to`; `bcc` recipients get it without seeing each other."""
    OUTBOX.append({"to": to, "bcc": list(bcc), "subject": subject, "body": body})
