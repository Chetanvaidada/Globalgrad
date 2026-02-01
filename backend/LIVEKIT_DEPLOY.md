# Agent Deployment Instructions for LiveKit Cloud

## Prerequisites (important)

### 1) Use Supabase pooler (IPv4-friendly) for DATABASE_URL

LiveKit Cloud may not be able to reach Supabase **Direct connection** because it can resolve to IPv6 and fail with `Network is unreachable`.

In Supabase Dashboard:
- Go to **Connection String**
- Choose **Session pooler**
- Copy the URI and use it as `DATABASE_URL`

### 2) Put secrets in `.env` (and do not commit them)

Store secrets in `backend/.env` (already ignored by git). Example keys:
- `DATABASE_URL`
- `GOOGLE_API_KEY`
- `GEMINI_API_KEY`

## Deploy

### First-time deployment

Run from the `backend` directory:

```bash
lk agent create --secrets-file .env
```

This registers the agent and creates `livekit.toml`.

### Deploy an updated version

```bash
lk agent deploy --secrets-file .env
```

## Notes

- The LiveKit Cloud agent entrypoint is `agent_standalone.entrypoint`.
- If you keep an `agent.yaml` locally, do not commit it if it contains secrets.
