# OS With Env(Base Img)
FROM node:18

# Working Dir
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app/

# Instll the Libraries
RUN npm install

# Copy the Source Code
COPY . .

# Envirnment Variable
ENV DB_HOST=mongos-container
ENV DB_USER=root
ENV DB_PASSWORD=admin
ENV DB_DATABASE=wanderlust

# Expose the port
EXPOSE 7080

# Start the Server
CMD ["node","index.js"]

