
# Start ElasticSearch service (= the data management system of the application):
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.7.1
docker run -d -p 9200:9200 -p 9300:9300 -h elasticsearch --name elasticsearch -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.1

# TODO: muokkaa elasticsearch clusteria niin, että data tallennetaan persistent memoryyn (volume)

touch secrets # Write here the following (get tokens and add them in the corresponding places):

    GITLAB_API_URL = https://course-gitlab.tuni.fi/api/v4/projects
    GITLAB_API_KEY = 
    #PLUSSA_API_URL = https://plus.tuni.fi/api/v2/courses/40/
    #PLUSSA_API_KEY = 

# Deploy data fetcher service:
docker build . -t datafetcher
docker run -it --rm datafetcher
