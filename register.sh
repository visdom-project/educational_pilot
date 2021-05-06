 curl -X PUT "localhost:9200/_snapshot/my_backup?pretty" -H 'Content-Type: application/json' -d '{"type": "fs", "settings": {"location": "/home/backup", "compress": "true"}}'
 curl -X POST "localhost:9200/_snapshot/my_backup/snapshot_1/_restore?pretty"
