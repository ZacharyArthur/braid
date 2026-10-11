OUTBOX = []  # sent messages; the provider client reads from here


def send(to, subject, body):
    """Send one email. `to` is the recipient address."""
    OUTBOX.append({"to": to, "subject": subject, "body": body})
