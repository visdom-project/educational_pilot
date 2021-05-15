FROM node:14

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/e1f115e4ca285c3c24e847c4dd4be955e0ed51c2/wait-for-it.sh /utils/wait-for-it.sh
RUN chmod +x /utils/wait-for-it.sh

COPY ./insert_snapshot.sh /home/insert_snapshot.sh
RUN chmod +x /home/insert_snapshot.sh

RUN apt update && apt install curl

CMD [ "/utils/wait-for-it.sh", "elasticsearch:9200", "-t", "0", "--", "/home/insert_snapshot.sh", "kill", "$$(cat /tmp/epid)", "&&", "wait", "$$(cat /tmp/epid);", "exit", "0;" ]
