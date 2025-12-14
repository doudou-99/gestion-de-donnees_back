# Stage 1 : Builder

FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci --omit=dev && \
    npx prisma generate

RUN npm run build

# Stage 2 : Runtime

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/prisma/schema.prisma ./prisma/

COPY package*.json ./

COPY init_nest.sh ./

RUN chmod +x init_nest.sh

EXPOSE 3000

CMD ["./init_nest.sh"]