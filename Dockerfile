FROM node:8.16.0-alpine AS builder

WORKDIR /app
COPY . .
RUN npm i
RUN npm run build


FROM nginx:1.17.2-alpine

COPY --from=builder /app/build /usr/share/nginx/html

