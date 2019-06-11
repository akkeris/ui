FROM testcafe/testcafe:latest

WORKDIR /test
COPY . .

USER root
RUN chmod +x ./testcafe-docker.sh
RUN npm install

RUN chown user /test

USER user
EXPOSE 1337 1338
ENTRYPOINT ["/test/testcafe-docker.sh"]