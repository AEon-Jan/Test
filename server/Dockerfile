FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install --production
RUN mkdir -p /app/data
COPY . .
CMD ["npm", "start"]
