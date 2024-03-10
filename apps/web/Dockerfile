# Builder
FROM node:20-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
RUN pnpm install turbo --global
COPY . .
RUN turbo prune --scope=web --docker
RUN node -v
RUN pnpm -v

# Installer
FROM node:20-slim AS installer
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
RUN pnpm install turbo --global

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY apps/web/next.config.prod.js apps/web/next.config.js
RUN ls -al

RUN turbo build --filter=web...

# Runner
FROM node:20-slim AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN npm install pm2 -g
# RUN mkdir ~/.pm2
# RUN chmod 755 -R  ~/.pm2
RUN mkdir -p /nonexistent/.pm2/log && chown -R nextjs:nodejs /nonexistent
RUN mkdir -p /app/var/logs && chown -R nextjs:nodejs /app/var
USER nextjs

COPY --from=installer /app/apps/web/next.config.js ./next.config.js
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/ecosystem.config.js ./

CMD ["pm2-runtime", "ecosystem.config.js", "--only", "pm2-teambition"]
# CMD node apps/web/server.js
