###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./
COPY ./src ./src
COPY ./*.json .

# # Install app dependencies using the `npm ci` command instead of `npm install`
# RUN npm ci

# Bundle app source

RUN npm install --production -f 

# Run the build command which creates the production bundle
RUN npm run build

  
# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "dist/lambda.handler" ]