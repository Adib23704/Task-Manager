FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Next.js inlines NEXT_PUBLIC_ vars at build time, so we need to set it here. It will be overridden by the actual value at runtime.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
