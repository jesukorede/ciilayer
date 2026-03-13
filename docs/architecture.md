# CiiLayer MVP Architecture

## Components

- Frontend (Next.js): wallet connect, profiles, jobs UI
- Backend (Express): auth (wallet signature), profiles, jobs, minimal matching
- Smart contracts (Hedera EVM): registry for job hash + completion confirmations

## MVP Notes

- Coordination-first: execution is off-chain/manual, status is recorded.
- Minimal on-chain footprint for verifiable references.
