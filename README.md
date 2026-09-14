# blitz.cloud examples

Small, working apps packaged the way [blitz.cloud](https://blitz.cloud/) expects them. blitz.cloud is a hosting platform run by BlitzWorks in Germany: you pick a public Docker image, give it a name, and it goes online under an address like `notes.yourname.blitz.cloud` with HTTPS.

Each folder is a complete project with a Dockerfile. Fork the repo, build an image, push it to Docker Hub and run it on blitz.cloud. The free plan is enough for all three.

| Folder | What it is | Stack | Database |
| --- | --- | --- | --- |
| [`node-api`](node-api/) | JSON API that stores notes | Node.js 22, `node:http`, `pg` | Optional PostgreSQL via `DATABASE_URL` |
| [`static-site`](static-site/) | Static website | Astro, served by unprivileged nginx | None |
| [`python-api`](python-api/) | JSON API | Python 3.13, FastAPI, uvicorn | None |

## What an image needs to run on blitz.cloud

These are the rules every example here follows. They are also the most common reasons a random image from the internet refuses to start.

- It is a public image on Docker Hub. The dashboard searches Docker Hub; other registries and private images can't be picked yet.
- It is built for `linux/amd64`. An arm64-only image, which is what a plain `docker build` on an Apple Silicon Mac produces, will not start.
- It works as user and group `1000`, with every Linux capability dropped. blitz.cloud never runs anything as root.
- It listens on one HTTP port and says which one with `EXPOSE`. All examples use `8080`, which never needs extra privileges. blitz.cloud reads the declared port, so you rarely have to type it.
- It reads configuration from environment variables. When you attach a database while creating the app, blitz.cloud sets `DATABASE_URL` (for PostgreSQL it looks like `postgresql://user:password@host:5432/name`) unless it detected other variable names the image expects.

You can check most of this on your own machine before pushing:

```bash
docker build --platform linux/amd64 -t my-app .
docker run --rm --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges -p 8080:8080 my-app
```

If it answers on http://localhost:8080 like that, it will very likely run on blitz.cloud too.

## Publishing with GitHub Actions

[`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) builds all three examples for `linux/amd64` on every push to `main` and pushes them to your Docker Hub account as `<your-user>/blitz-example-node-api` and so on.

1. Fork this repository.
2. On Docker Hub, create an access token with read and write permission (Account settings, Personal access tokens).
3. In your fork, add two repository secrets under Settings, Secrets and variables, Actions: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
4. Push to `main`, or run the workflow by hand from the Actions tab.

Without the secrets the workflow still builds the images, so pull requests get checked, but it skips the push.

## Putting an image online

1. Sign in at [beta.blitz.cloud](https://beta.blitz.cloud/) and click Host something new.
2. Choose "An app that is already packaged up" and search for your image by name, for example `yourname/blitz-example-node-api`. A repository you pushed a moment ago can take a while to show up in Docker Hub search.
3. Pick the version, click Continue, give the app a name and an address, and click Put it online.

For the database, open Advanced settings on that second screen and switch on Needs a database. The per-example READMEs have the details.

Building straight from a GitHub repository, without Docker Hub in between, is not available on blitz.cloud yet. It is the next thing being built.

## License

MIT, see [LICENSE](LICENSE).
