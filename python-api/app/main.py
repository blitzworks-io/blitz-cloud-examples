import os
import platform

from fastapi import FastAPI, HTTPException

app = FastAPI(title="blitz.cloud example API")


@app.get("/")
def hello():
    return {"hello": "from blitz.cloud", "python": platform.python_version()}


@app.get("/healthz")
def healthz():
    return {"ok": True}


@app.get("/env/{name}")
def env(name: str):
    # Shows how settings from the Environment tab reach the app. Only names
    # starting with PUBLIC_ are returned, so this never leaks a secret.
    if not name.startswith("PUBLIC_"):
        raise HTTPException(status_code=403, detail="only PUBLIC_ variables are shown")
    return {name: os.environ.get(name)}
