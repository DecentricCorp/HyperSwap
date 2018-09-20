FROM node:8
ADD ./ /src/
WORKDIR /src
RUN rm -rf peerA/
RUN rm -rf peerB/
RUN rm -rf peerC/
RUN rm -rf node_modules/
RUN rm -rf Bootstrap/
RUN rm -rf peerList/
RUN npm install
RUN mkdir /var/dat/
RUN mkdir /var/dat/storage/
# RUN ls -al
# RUN npm install -g signalhub
# RUN npm install -g dat-doctor
# RUN npm install dat -g
# RUN chmod u+x doctor.sh
EXPOSE 3282
# CMD [ "signalhub","listen","-p","3282" ]
CMD ["npm","start"]
# CMD ["bash", "doctor.sh"]