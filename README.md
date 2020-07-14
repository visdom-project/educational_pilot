
# How to deploy the system

1. Start ElasticSearch service (= the data management system of the application):
```docker pull docker.elastic.co/elasticsearch/elasticsearch:7.7.1```
```docker run -d -p 9200:9200 -p 9300:9300 -h elasticsearch --name elasticsearch -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.1```
TODO: muokkaa elasticsearch clusteria niin, että data tallennetaan persistent memoryyn (volume)

   Edit ElasticSearch configuration file in the container to enable cors and allow access for front service running in localhost:3000 (TODO: move these inside the image to avoid manual set-up):
```docker exec -it <CONTAINER_ID> bash```
```cd config```
```vi elasticsearch.yml```

   Insert the following 2 rows:
```http.cors.enabled: true```
```http.cors.allow-origin: http://localhost:3000```

   And exit the container. Rerun the container for the configuration to take effect:
```docker stop <CONTAINER_ID>```
```docker start  <CONTAINER_ID>```

2. Write secrets to a configuration file called 'secrets':
```touch secrets```
Write the following lines in the file and get tokens from services:
```#GITLAB_API_URL = https://course-gitlab.tuni.fi/api/v4/projects```
```#GITLAB_API_KEY = ```
```PLUSSA_API_URL = https://plus.tuni.fi/api/v2/```
```PLUSSA_API_KEY = ```

3.  Deploy data fetcher service:
```docker build . -t datafetcher```
```docker run -it --rm --network host datafetcher```
Use ctrl + p && ctrl + q to detach from docker tty while leaving process alive.

4. Deploy the frontend service:
```cd visualization-app```
```docker build . -t visuapp```
```docker run -it --rm -p 3000:3000 visuapp```
Use ctrl + p && ctrl + q to detach from docker tty while leaving process alive.
