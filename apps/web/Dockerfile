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
# This is necessary to run sharp
RUN npm install -g --arch=x64 --platform=linux --libc=glibc sharp@0.33.0-rc.2
RUN npm install pm2 -g
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

ENV NODE_ENV production
ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp
ENV PATH="$PATH:/usr/local/lib/node_modules/pm2/bin"

# Copy dependencies
COPY --from=installer --chown=nextjs:nodejs /usr/local/lib/node_modules/sharp /usr/local/lib/node_modules/sharp
COPY --from=installer --chown=nextjs:nodejs /usr/local/lib/node_modules/pm2 /usr/local/lib/node_modules/pm2

RUN addgroup --system  nodejs
RUN adduser --system  nextjs
# RUN npm install pm2 -g
# RUN mkdir ~/.pm2
# RUN chmod 755 -R  ~/.pm2
RUN mkdir -p /nonexistent/.pm2/log && chown -R nextjs:nodejs /nonexistent
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
