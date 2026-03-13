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

## Local Dev

### Prereqs

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run

```bash
npm run dev:backend
npm run dev:frontend
```

Backend: `http://localhost:4000`
Frontend: `http://localhost:3000`

## Docs

See `docs/` for architecture, API spec, and deployment notes.
