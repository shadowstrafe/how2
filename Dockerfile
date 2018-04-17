FROM node:8.9-alpine

# Set the NODE_ENV environment variable
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# First, only copy the package*.json stuff so docker can use cached layers.
# This way we only rebuild our modules when our package*.json changes.
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# Install packages for [dependencies] from npm and move packages up one level
# Not entirely sure why we need to perform the mv, but node will still 
# be able to find the dependencies.
RUN npm install --production --silent && mv node_modules ../

# Include our app source (except the files ignored in .dockerignore)
COPY . .

# Expose port 80 of the container
EXPOSE 80

# Define the command used to run the application
CMD npm start