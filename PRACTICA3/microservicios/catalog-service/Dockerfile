# Imagen base oficial de Node
FROM node:18-alpine

# Crear directorio dentro del contenedor
WORKDIR /app

# Copiar package.json primero (mejor para cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto gRPC
EXPOSE 50052

# Comando para iniciar servicio
CMD ["node", "server.js"]
