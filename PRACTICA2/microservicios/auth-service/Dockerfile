# Imagen base de Node.js
FROM node:24-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Expone el puerto donde gRPC escucha
EXPOSE 50051

# Comando para levantar el servidor
CMD ["node", "server.js"]
