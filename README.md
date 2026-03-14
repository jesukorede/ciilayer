# CiiLayer (MVP)

CiiLayer is a decentralized coordination platform on Hedera that enables humans and machines to offer services, get matched to jobs, and build verifiable work histories on-chain.

## MVP Scope

- Wallet-based users
- Human skill listings
- Machine capability listings
- Job creation & matching (manual accept)
- Basic job lifecycle: create → accept → complete
- Minimal on-chain registry (job hash + completion confirmation)

## Repo Structure

- `frontend/` Next.js web app
- `backend/` Node.js + Express + TypeScript API
- `contracts/` Hardhat + Solidity
- `docs/` MVP documentation

## Hedera Integration (Submission MVP)

This MVP uses Hedera-native primitives for verifiable activity logging:

- **Hedera Consensus Service (HCS)** topics for job + machine lifecycle events (backend writes)
- **Hedera Mirror Node** to read topic messages and build an activity feed (backend reads)
- Frontend dashboard polls the backend activity endpoint to render a unified feed

### HCS Topics

Two topics are used:

- `HEDERA_JOB_TOPIC_ID` (job lifecycle)
- `HEDERA_MACHINE_TOPIC_ID` (machine lifecycle)

Create topics (one-time):

```bash
cd backend
npm run create-topics
```

Then copy the printed topic IDs into your backend environment variables.

Verify on HashScan:

- `https://hashscan.io/testnet/topic/<TOPIC_ID>`

### Mirror Node Activity Feed

Backend endpoint:

- `GET /api/activity?limit=50`

This fetches recent messages for both topics from the Mirror Node, decodes the message payloads, merges them, and sorts by timestamp.

## Local Dev

### Prereqs

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

Create env files (see examples):

- Backend: `backend/.env` from `backend/.env.example`
- Frontend: `frontend/.env.local` from `frontend/.env.example`

### Run

```bash
npm run dev:backend
npm run dev:frontend
```

Backend: `http://localhost:4000`
Frontend: `http://localhost:3000`

## Environment Variables

### Backend (`backend/.env.example`)

- `JWT_SECRET`
- `DB_PATH`
- `CORS_ORIGIN`
- `ADMIN_KEY` (admin-only endpoints)
- `CHAIN_ID` (Hedera Testnet EVM is `296`)
- `HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY` (required to write HCS messages)
- `HEDERA_JOB_TOPIC_ID`, `HEDERA_MACHINE_TOPIC_ID` (required to enable HCS + activity feed)
- `HEDERA_MIRROR_NODE_BASE_URL` (defaults to testnet)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (optional analytics)

### Frontend (`frontend/.env.example`)

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_CHAIN_ID` (default `296`)
- `NEXT_PUBLIC_HEDERA_RPC_URL` (default `https://testnet.hashio.io/api`)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional)

## Deployment Notes (Render + Vercel)

### Render (backend)

- Set `DB_PATH=/var/data/ciilayer.sqlite`
- Mount a persistent disk at `/var/data`
- Set `CORS_ORIGIN` to your Vercel frontend URL

### Vercel (frontend)

- Set `NEXT_PUBLIC_BACKEND_URL` to your Render backend base URL

## Docs

See `docs/` for architecture, API spec, and deployment notes.
