import time
from collections import defaultdict, deque

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

app = FastAPI()
hits = defaultdict(deque)  # braid(yagni): in-process, per-worker; shared store if you run several workers


class Message(BaseModel):
    text: str


@app.post("/messages")
def create_message(message: Message, request: Request):
    now, q = time.monotonic(), hits[request.client.host]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= 10:
        raise HTTPException(429, "Too many requests")
    q.append(now)
    return {"ok": True, "length": len(message.text)}
