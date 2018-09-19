FROM node:8
ADD ./ /src/
WORKDIR /src
RUN rm -rf peerA/
RUN rm -rf peerB/
RUN rm -rf peerC/
RUN npm install
RUN ls -al
EXPOSE 3282
CMD [ "npm", "start" ]