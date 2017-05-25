FROM node:7.10
MAINTAINER gilmoreg@live.com
# Prevent npm install from running unless package.json changes
COPY ./package.json src/
RUN cd src && npm install --only=production

COPY . /src
WORKDIR src/
CMD ["npm", "start"]