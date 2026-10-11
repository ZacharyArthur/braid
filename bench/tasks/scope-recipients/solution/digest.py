import mailer


def send_digest(subscribers, text):
    """Email the weekly digest to every subscriber: one message, addresses hidden."""
    mailer.send(None, "Weekly digest", text, bcc=subscribers)
