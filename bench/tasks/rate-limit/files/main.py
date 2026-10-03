from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Message(BaseModel):
    text: str


@app.post("/messages")
def create_message(message: Message):
    return {"ok": True, "length": len(message.text)}
