# Node.js API with optional PostgreSQL

A JSON API written with Node's built-in `http` module and the `pg` driver. It has one real feature, storing short notes, which is enough to prove the database connection works end to end.

| Route | What it does |
| --- | --- |
| `GET /` | Says hello and whether a database is connected |
| `GET /healthz` | `200` when the app, and the database if there is one, answer |
| `GET /notes` | The last 50 notes |
| `POST /notes` | Stores `{"text": "..."}` |

Without `DATABASE_URL` the API still starts, and `/notes` answers `503` with a sentence saying why. On first start with a database it creates its `notes` table.

## Run it locally

```bash
docker network create notes-net
docker run -d --name notes-db --network notes-net \
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app \
  postgres:17-alpine

docker build --platform linux/amd64 -t blitz-example-node-api .
docker run --rm --network notes-net --user 1000:1000 --cap-drop ALL \
  --security-opt no-new-privileges -p 8080:8080 \
  -e DATABASE_URL=postgresql://app:secret@notes-db:5432/app \
  blitz-example-node-api
```

In a second terminal:

```bash
curl -X POST -H 'content-type: application/json' -d '{"text":"first note"}' http://localhost:8080/notes
curl http://localhost:8080/notes
```

Clean up with `docker rm -f notes-db && docker network rm notes-net`.

## Put it on blitz.cloud

1. Push the image to Docker Hub, either with the workflow in this repository or by hand:

   ```bash
   docker build --platform linux/amd64 -t yourname/blitz-example-node-api:1.0.0 -t yourname/blitz-example-node-api:latest .
   docker push --all-tags yourname/blitz-example-node-api
   ```

   Replace `yourname` with your Docker Hub user. The repository has to be public.

2. In the [blitz.cloud dashboard](https://beta.blitz.cloud/), click Host something new, choose "An app that is already packaged up" and search for `yourname/blitz-example-node-api`. Pick `1.0.0` and click Continue.
3. The next screen shows port 8080, taken from the image. Open Advanced settings, switch on Needs a database and leave it on PostgreSQL.
4. Give the app a name and an address, for example `notes`, and click Put it online.

blitz.cloud creates a PostgreSQL 17 database for the app and sets `DATABASE_URL` before the app starts. The database can only be reached from your own apps, and it is copied off-site every night.

The longer walkthrough, including what the database settings look like afterwards, is at [blitz.cloud/guides/deploy-app-with-postgres/](https://blitz.cloud/guides/deploy-app-with-postgres/).
