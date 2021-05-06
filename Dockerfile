FROM docker.elastic.co/elasticsearch/elasticsearch:7.7.1

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

COPY backup/ /home/backup

RUN chown -R elasticsearch:elasticsearch /home/backup
