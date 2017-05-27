FROM node:7.10
LABEL maintainer="Grayson Gilmore (gilmoreg@live.com)"

RUN npm install forever -g

# Prevent npm install from running unless package.json changes
COPY ./package.json src/
RUN cd src && npm install

COPY . /src
WORKDIR src/

EXPOSE 80

CMD ["npm", "start"]