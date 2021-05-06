# FROM ubuntu:18.04

# WORKDIR /src
# COPY ./fetch_data.py .
# COPY ./secrets .

# RUN apt-get update && apt-get -y upgrade && apt-get install -y libssl-dev libcurl4-openssl-dev python-dev python3-pip && pip3 install pycurl

# CMD [ "python3", "fetch_data.py" ]
#-------------------------------------------------------
FROM docker.elastic.co/elasticsearch/elasticsearch:7.7.1

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/
COPY backup/ /home/backup
RUN chown -R elasticsearch:elasticsearch /home/backup


# CMD curl -X PUT "localhost:9200/_snapshot/my_backup?pretty" -H 'Content-Type: application/json' -d '{"type": "fs", "settings": {"location": "/home/backup", "compress": "true"}}' && curl -X POST "localhost:9200/_snapshot/my_backup/snapshot_1/_restore?pretty"