# Imagen base
FROM node:20-alpine

# Crear y usar directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Puerto expuesto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "dev"]