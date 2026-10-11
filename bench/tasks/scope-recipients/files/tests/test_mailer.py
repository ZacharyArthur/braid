import mailer
import signup


def test_send():
    mailer.OUTBOX.clear()
    mailer.send("a@example.com", "Hi", "Body")
    assert mailer.OUTBOX[-1]["to"] == "a@example.com"


def test_welcome():
    mailer.OUTBOX.clear()
    signup.welcome("new@example.com")
    assert mailer.OUTBOX[-1]["subject"] == "Welcome!"
