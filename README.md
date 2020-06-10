
# Start ElasticSearch service (= the data management system of the application):
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.7.1
docker run -p 9200:9200 -p 9300:9300 -h elasticsearch --name elasticsearch -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.1

# TODO: muokkaa elasticsearch clusteria niin, että data tallennetaan persistent memoryyn (volume)

# Deploy data fetcher service:
docker build . -t datafetcher
docker run -it datafetcher

