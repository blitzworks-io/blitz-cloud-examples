# Static site: Astro served by nginx

An Astro site built into plain files and served by [`nginxinc/nginx-unprivileged`](https://hub.docker.com/r/nginxinc/nginx-unprivileged), the official nginx image variant that runs without root and listens on 8080.

The same Dockerfile works for any static site generator. Swap the build stage and point the `COPY --from=build` line at the output folder:

| Generator | Build command | Output folder |
| --- | --- | --- |
| Astro | `npm run build` | `dist` |
| Next.js with `output: "export"` | `npm run build` | `out` |
| Vite (React, Vue, Svelte) | `npm run build` | `dist` |
| Hugo | `hugo --minify` | `public` |

Two lines in [`nginx.conf`](nginx.conf) matter more than they look. `try_files $uri $uri/ $uri.html =404` makes `/about/` and `/about` find `about/index.html`, and returns a real 404 status for pages that don't exist. `absolute_redirect off` keeps nginx from redirecting visitors to `http://...:8080/`, which is what it would otherwise do behind an HTTPS proxy like the one blitz.cloud puts in front of every app.

## Run it locally

```bash
docker build --platform linux/amd64 -t blitz-example-static-site .
docker run --rm --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges \
  -p 8080:8080 blitz-example-static-site
```

Open http://localhost:8080.

For editing, `npm install && npm run dev` gives you Astro's dev server with live reload. You don't need Docker for that part.

## Put it on blitz.cloud

```bash
docker build --platform linux/amd64 -t yourname/blitz-example-static-site:1.0.0 -t yourname/blitz-example-static-site:latest .
docker push --all-tags yourname/blitz-example-static-site
```

Then in the [dashboard](https://beta.blitz.cloud/): Host something new, "An app that is already packaged up", search for your image, pick the version, name it, Put it online. No database, no files to keep.

Longer version: [blitz.cloud/guides/host-static-site/](https://blitz.cloud/guides/host-static-site/).
