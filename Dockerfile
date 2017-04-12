FROM node:5.0.0

# Expose the default port
EXPOSE 7070

# Install &  run app in production mode
ENV NODE_ENV=production

#  Make the source location
RUN mkdir -p /usr/src/app

# Move the transpiled ssource to the container
COPY ./lib /usr/src/app

# Install the packages directly instead of copying them over to the containers
WORKDIR /usr/src/app
RUN npm install

CMD [ "node", "eurystheus" ]
