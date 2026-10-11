import mailer


def welcome(address):
    mailer.send(address, "Welcome!", "Thanks for signing up.")
