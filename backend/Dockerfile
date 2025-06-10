FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install --production && npm install typescript --no-save
COPY src ./src
RUN npx tsc -p .
CMD ["node", "dist/index.js"]
