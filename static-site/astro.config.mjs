import { defineConfig } from "astro/config";

// A plain static build: Astro writes HTML, CSS and assets to dist/ and nginx
// serves them. No server runtime is involved.
export default defineConfig({
  output: "static",
});
