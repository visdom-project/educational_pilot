#!/bin/sh

ES_SERVICE_NAME=elasticsearch
ES_SERVICE_PORT=9200

curl -X PUT "$ES_SERVICE_NAME:$ES_SERVICE_PORT/_snapshot/my_backup?pretty" -H 'Content-Type: application/json' -d '{"type": "fs", "settings": {"location": "/home/backup", "compress": "true"}}' 

curl -X POST "$ES_SERVICE_NAME:$ES_SERVICE_PORT/_snapshot/my_backup/snapshot_1/_restore?pretty"
