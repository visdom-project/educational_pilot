# Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

# Getting started (preferred way):

*If you have a backup data dump folder containing example data, use this approach. If necessary, request for a data dump from the authors.*

1. run `npm run build` in folder visualization-app/
2. run `docker-compose up` in root folder of the repository

Now you should have both backend with example data and frontend running. You may remove the backup_loader container now.

If the backup folder is missing or misplaced, elasticsearch service can't be built and will fail. Withouth backup data, deploy an empty data service according to instructions below, or use a custom data service.

For frontend development, stop and remove the frontend container and use `npm start` in directory `visualization-app/`.

# Getting started without an example data dump, backend:

*Note: if you want to fetch for new data, this option requires fixing/rewriting the data fetcher script, so it is likely an unviable option. This approach is deprecated as of summer 2021, because a new backend solution is developed to replace the elasticsearch + fetcher script based backend solution.*

*Detailed instructions written from the perspective of Ubuntu users.*

## Deploying the data management system (DMS): Empty ES service + data fetching script

#### Prerequisites for this option

- You have personal access tokens to data sources such as GitLab and Plussa that provide a RESTful API to the data contained in them.

#### Step-by-step instructions

1. Start ElasticSearch service (= the data management system of the application):

       docker pull docker.elastic.co/elasticsearch/elasticsearch:7.7.1
       docker run -d -p 9200:9200 -p 9300:9300 -h elasticsearch --name elasticsearch -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.1

2. Copy ElasticSearch configuration file in the container to enable cors and allow access for front service running in localhost:3000:

       docker cp elasticsearch.yml elasticsearch:/usr/share/elasticsearch/config/elasticsearch.yml
       docker stop <CONTAINER_ID>
       docker start  <CONTAINER_ID>

3. Write secrets to a configuration file called 'secrets':

       touch secrets

4. Write the access keys and API base urls in the file and get tokens from services:

       GITLAB_API_URL = https://course-gitlab.tuni.fi/api/v4/projects
       GITLAB_API_KEY = 
       PLUSSA_API_URL = https://plus.tuni.fi/api/v2/
       PLUSSA_API_KEY = 

5. Update fetcher script in fetch_data.py or write completely new one according to your needs.

6.  Deploy data fetcher service:

    docker build . -t datafetcher

    docker run -it --rm --network host datafetcher

    (You may Use ctrl + p && ctrl + q to detach from docker tty while leaving process alive.)

# Deploying the visualization service:

## Option A: Deploying the visualization service in Docker

    cd visualization-app
    docker build . -t visuapp
    docker run -it --rm -p 3000:3000 visuapp

    (Exiting with ctrl + d will kill the process.)

## Option B: Deploying the visualization service locally

- This option is fit for anyone planning on contributing to visualization code.

#### Prerequisites for this option

- [Node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) version 10.18 or newer.
- Installing a newer Node version will install Node Package Manager (npm) and npx as well. If not, install npm. At least versions 6.14.x are known to work.

#### Step-by-step instructions

    cd visualization-app

1. On the first time, install dependencies:

    npm install

2. Running the program:

    npm start

    (Use ctrl + c to exit)

# Contributing

- Clone or fork the repository.
- Pick an issue to implement or suggest a new one.
- Implement the feature in your own development branch.
- Make a pull request.
