FROM node:lts-alpine

ENV TIME_ZONE=Asia/Shanghai

RUN \
  mkdir -p /usr/src/app \
  && apk add --no-cache tzdata \
  && echo "${TIME_ZONE}" > /etc/timezone \ 
  && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime \
  && apk del tzdata

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm i --production

# RUN npm i --production   --registry=https://registry.npm.taobao.org

COPY . /usr/src/app

EXPOSE 80

CMD npx egg-scripts start
