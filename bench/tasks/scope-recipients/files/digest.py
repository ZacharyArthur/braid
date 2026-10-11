import mailer


def send_digest(subscribers, text):
    """Email the weekly digest to every subscriber."""
    for address in subscribers:
        mailer.send(address, "Weekly digest", text)
