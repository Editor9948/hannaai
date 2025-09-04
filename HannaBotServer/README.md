# HannaBot Server

Express server that exposes a streaming AI chat endpoint compatible with the Vercel AI SDK client.

## Environment

- Node.js 18+
- Set `OPENAI_API_KEY` in a `.env` file in this folder:

```
OPENAI_API_KEY=sk-...
PORT=3001
```

## Install & Run

```
npm install
npm run dev
```

The API will be available at `http://localhost:3001/api/chat`.

## Endpoints

- POST `/api/chat` — accepts `{ messages: [{ role, content }, ...] }` and streams a response.
- GET `/health` — health check.

## Notes

- Uses `ai` and `@ai-sdk/openai` packages to stream responses.
- Frontend should call `/api/chat` (relative) or configure a proxy to this server.