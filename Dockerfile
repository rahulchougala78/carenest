FROM node:24-alpine AS client-build
WORKDIR /app
COPY client/package*.json ./client/
RUN npm ci --prefix client
COPY client ./client
RUN npm run build --prefix client

FROM node:24-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN npm ci --omit=dev --prefix server
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
VOLUME ["/app/server/data"]
CMD ["npm", "start", "--prefix", "server"]
