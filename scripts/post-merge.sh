#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
node --experimental-strip-types lib/db/seed.ts
