
# Buid from official NodeJS image.
FROM node:alpine

# Expose Prysmo default port.
EXPOSE 7667

# Copy NPM package files.
WORKDIR /usr/src/prysmo
COPY package*.json ./

# Install dependencies.
RUN npm i -P

# Copy sorrounding source code into image.
COPY . .

# Set command for starting Hello Prysmo.
CMD node ./bin/hello-prysmo.js
