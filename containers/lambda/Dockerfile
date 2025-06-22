###################
# BUILD FOR PRODUCTION
# This Dockerfile leverages a pre-built base image with all node_modules installed.
###################
FROM --platform=linux/amd64 041451437307.dkr.ecr.us-east-1.amazonaws.com/apso-lambda-base:latest

# The WORKDIR is set to /app in the base image.

# Copy application source code and config files.
# The base image contains all dependencies from the template's package.json.
COPY ./src ./src
COPY ./*.json .
COPY ./.apsorc ./.apsorc

# Run the build command to transpile TypeScript into JavaScript
RUN npm run build
  
# Set the CMD to your handler, which references the compiled output
CMD [ "dist/lambda.handler" ]