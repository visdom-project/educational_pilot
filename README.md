# Prerequisites
- [Docker Desktop](https://www.docker.com/get-started)

# The very fast way to get started:

*If you have backup folder, use this approach.*

1. run `npm run build` in folder visualization-app/
2. run `docker-compose up` in root folder of the repository

*Now you have both backend with example data and frontend running. For frontend development, stop and remove the frontend container and use npm start in visualization-app/.*

# Fast guide to getting started

1. Deploy a data management system (DMS)
2. Deploy the visualization service

*Detailed instructions below.*

Note: Instructions are written for Ubuntu users.

## Option 1.A: Deploy the data service from a data dump

#### Prerequisites for this option

- You have received a data dump from the author and extracted the compressed folder in the root of the educational pilot repository.
- curl or similar tool that allows sending custom http requests (needed in steps 6 to 7).

#### Step-by-step instructions

1. Run a container:

        docker run -d -p 9200:9200 -p 9300:9300 -h elasticsearch --name elasticsearch -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.1

2. Copy the [ES](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) configuration file into the container:

        docker cp elasticsearch.yml elasticsearch:/usr/share/elasticsearch/config/elasticsearch.yml

3. Copy the backup directory into the container:

        docker cp backup/ elasticsearch:/home/backup

4. Edit owner of the backup file inside the container:

        docker exec -it elasticsearch bash

        chown -R elasticsearch:elasticsearch /home/backup

        (Exit the container with ctrl + d.)

5. For the config to take effect, restart the container:

        docker container restart elasticsearch

6. Register a snapshot repository:

        curl -X PUT "localhost:9200/_snapshot/my_backup?pretty" -H 'Content-Type: application/json' -d '{"type": "fs", "settings": {"location": "/home/backup"}}'

7. Restore the data from the backup:

        curl -X POST "localhost:9200/_snapshot/my_backup/snapshot_1/_restore?pretty"

## Option 1.B: empty ES service + data fetching script

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

5. (optional) Update fetcher script in fetch_data.py or write completely new one according to your needs.

6.  Deploy data fetcher service:

    docker build . -t datafetcher

    docker run -it --rm --network host datafetcher

    (You may Use ctrl + p && ctrl + q to detach from docker tty while leaving process alive.)

## Option 2.A: Deploying the visualization service in Docker

    cd visualization-app
    docker build . -t visuapp
    docker run -it --rm -p 3000:3000 visuapp

    (Exiting with ctrl + d will kill the process.)

## Option 2.B: Deploying the visualization service locally

- This option is fit for anyone planning on contributing to visualization code.

#### Prerequisites for this option

- [Node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) version 10.18 or newer.
- Installing a newer Node version will install Node Package Manager (npm) and npx as well. If not, install npm. At least versions 6.14.x are known to work.
- Alternatively to npm, you may use yarn at your own risk. It will probably work just fine.

#### Step-by-step instructions

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
