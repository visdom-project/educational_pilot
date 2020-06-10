FROM ubuntu:18.04

WORKDIR /src
COPY ./fetch_data.py .
COPY ./secrets .

RUN apt-get update && apt-get -y upgrade && apt-get install -y libssl-dev libcurl4-openssl-dev python-dev python3-pip && pip3 install pycurl

CMD [ "python3", "fetch_data.py" ]