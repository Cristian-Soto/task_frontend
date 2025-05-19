# Imagen base
FROM node:20-alpine

# Crear y usar directorio de trabajo
WORKDIR /app

# Instalar todas las dependencias, incluyendo las de desarrollo
COPY package*.json ./
RUN npm ci

# Instalar específicamente autoprefixer y otras dependencias necesarias
RUN npm install -D autoprefixer@10.4.14 postcss@8.4.31 tailwindcss@3.3.0

# Copiar el resto del proyecto
COPY . .

# Puerto expuesto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "dev"]