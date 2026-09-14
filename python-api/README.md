# Python API with FastAPI

A FastAPI app run by uvicorn on port 8080, in a two-stage image: packages are installed into a virtualenv in the first stage, and only that folder and the code end up in the final image.

| Route | What it does |
| --- | --- |
| `GET /` | Says hello and prints the Python version |
| `GET /healthz` | Always `200` while the process is up |
| `GET /env/PUBLIC_...` | Returns one environment variable whose name starts with `PUBLIC_` |
| `GET /docs` | FastAPI's generated API docs |

The `/env` route is there to show that settings you add in blitz.cloud's Environment tab reach the app after a restart. It refuses any name without the `PUBLIC_` prefix, so it can't be used to read a password.

uvicorn is started with `--proxy-headers`, so `request.url` shows `https` and the real host when the app runs behind blitz.cloud's HTTPS proxy.

## Run it locally

```bash
docker build --platform linux/amd64 -t blitz-example-python-api .
docker run --rm --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges \
  -p 8080:8080 -e PUBLIC_GREETING=hello blitz-example-python-api
```

```bash
curl http://localhost:8080/env/PUBLIC_GREETING
```

## Put it on blitz.cloud

```bash
docker build --platform linux/amd64 -t yourname/blitz-example-python-api:1.0.0 .
docker push yourname/blitz-example-python-api:1.0.0
```

In the [dashboard](https://beta.blitz.cloud/): Host something new, "An app that is already packaged up", search for `yourname/blitz-example-python-api`, pick `1.0.0`, name it and click Put it online. To try the `/env` route, add `PUBLIC_GREETING` on the app's Environment tab and restart the app.
