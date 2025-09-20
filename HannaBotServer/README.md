# HannaBot Server

Express server that exposes a streaming AI chat endpoint compatible with the Vercel AI SDK client.

## Environment

- Node.js 18+
- Set `OPENAI_API_KEY` in a `.env` file in this folder:

```
OPENAI_API_KEY=sk-...
PORT=4000 # optional, defaults to 4000
ALLOW_ORIGIN=* # optional, set to your site origin in prod e.g. https://yourapp.com
```

## Install & Run

```
npm install
npm run dev
```

The API will be available at `http://localhost:4000/api/chat` by default.

## Endpoints

- POST `/api/chat` — accepts `{ messages: [{ role, content }, ...] }` and streams a response.
- GET `/health` — health check.

## Deployment notes

- Requires Node 18+.
- If your build reports `npm error Invalid Version:`, your `package-lock.json` may be corrupted. Regenerate it:
	1. In `HannaBotServer/`: delete the `node_modules` folder and `package-lock.json`.
	2. Run `npm install` (this recreates a clean lockfile).
	3. Commit the new `package-lock.json` and redeploy (CI can then run `npm ci`).
- Set `OPENAI_API_KEY` on your host. Optionally set `ALLOW_ORIGIN` to your frontend URL.
- Frontend should call `/api/chat` (relative behind the same domain) or set `REACT_APP_API_URL` to point to this server.