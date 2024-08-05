#  Created Base Image for all stages
FROM node:20-alpine3.20 As base
# RUN apk add --no-cache libc6-compat 

FROM node:20-alpine3.20 AS builder
WORKDIR /opt
COPY . ./
RUN npm i -g pnpm && \
    pnpm install && \
    pnpx prisma generate && \ 
    pnpm run build 

# FROM node:20-alpine3.20 As onlydeps
# WORKDIR /usr/src/app
# COPY apps/backend/package.json ./package.json
# RUN pnpm install --production

FROM node:20-alpine3.20 As prod
WORKDIR /usr/src/app
COPY --from=builder /opt/dist ./dist
COPY --from=builder /otp/node_modules ./node_modules

EXPOSE 3333

CMD [ "node", "dist/main.js" ]
