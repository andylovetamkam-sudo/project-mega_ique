# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install --production && npm cache clean --force

# Copier le code
COPY src/ ./src/

# Créer le dossier data (mais il sera écrasé par le volume)
RUN mkdir -p /app/data && chmod 777 /app/data

# Changer pour l'utilisateur node
USER node

EXPOSE 8000

CMD ["npm", "start"]