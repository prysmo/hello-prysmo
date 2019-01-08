
# Buid from official NodeJS image.
FROM node:alpine

# Expose Prysmo default port.
EXPOSE 7667

# Create conf file mechanism.
ENV HELLO_PRYSMO_CONF /etc/prysmo/conf.toml
RUN touch $HELLO_PRYSMO_CONF

# Copy NPM package files.
WORKDIR /usr/src/prysmo
COPY package*.json ./

# Install dependencies.
RUN npm i -P

# Copy sorrounding source code into image.
COPY . .

# Set command for starting Ribamar.
CMD npm start
