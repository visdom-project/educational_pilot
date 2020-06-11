import pycurl
from urllib.parse import urlencode
from io import BytesIO
import sys


def make_get_request(url, access_token="", headers=[], data=""):

    bytes_obj = BytesIO()
    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.HEADERFUNCTION, display_header)
    curl_obj.setopt(curl_obj.WRITEDATA, bytes_obj)

    if len(data) > 1:
        curl_obj.setopt(curl_obj.READDATA, data.encode('utf8'))

    if len(access_token) > 1:
        # Authenticate:
        headers.append('Authorization: Token {:s}'.format(access_token))
    
    curl_obj.setopt(curl_obj.HTTPHEADER, headers)

    curl_obj.perform()
    curl_obj.close()

    return bytes_obj.getvalue().decode('utf8')  # Body of the reply


def make_put_request(url, data, header):

    buffer = BytesIO(data.encode('utf8'))

    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.UPLOAD, 1)
    curl_obj.setopt(curl_obj.READDATA, buffer)
    curl_obj.setopt(curl_obj.HTTPHEADER, header)

    curl_obj.perform()
    curl_obj.close()


def display_header(header_line):
    header_line = header_line.decode('utf8')
    print(header_line)


def get_arguments():
    if len(sys.argv) > 1:
        target_URL = sys.argv[1]
    else:
        print("fetch_data.py: Warning: missing argument: target API URL!")
        return False, False

    if len(sys.argv) > 2:
        access_token = sys.argv[2]
    else:
        print("fetch_data.py: Warning: missing argument: Access token for target API!")
        return False, False

    return target_URL, access_token


def read_secrets():
    target_URL = False
    access_token = False
    secrets = []
    
    with open("secrets", 'r') as file:

        for row in file:
            if row.startswith("#"):
                continue

            split = row.split()

            if len(split) == 3:
                secrets.append(split[2])
    
    if len(secrets) == 2:
        target_URL = secrets[0]
        access_token = secrets[1]
        print("fetch_data.py: API URL and access key succesfully read from secrets!\n")
    else:
        print("fetch_data.py: Error: could not read API url and access key from secrets!")
    
    return target_URL, access_token


def get_id():
    document_id = '0'
    
    try:
        with open('id', 'r') as file:
            document_id = file.read()
            if document_id == "":
                document_id = '0'
        file.close()
    except OSError:
        document_id = '0'

    with open('id', 'w') as file:
        id_int = int(document_id)
        id_int += 1
        file.write(str(id_int))
    file.close()

    return document_id


def write_to_elasticsearch(data):
    header = ['Content-Type: application/json']
    
    index = 'testindex'
    data_type = '_doc'
    document_id = get_id()

    url = 'http://localhost:9200/{:s}/{:s}/{:s}'.format(index, data_type, document_id)

    # curl -XPUT 'http://localhost:9200/testindex/_doc/1' -H 'Content-Type: application/json' -d '{"name":"John Doe"}'
    make_put_request(url, data, header)


def search_elasticsearch(query, index=''):
    header = ['Content-Type: application/json']
    data_type = '_search'
    url = 'http://localhost:9200/{:s}/{:s}?pretty'.format(index, data_type)
    make_get_request(url, headers=header)


def main():
    target_URL, access_token = get_arguments()
    
    if target_URL == False:
        print("fetch_data.py: Resorting to fallback: reading API URL and acces key from secrets file.")
        target_URL, access_token = read_secrets()

    if target_URL != False:
        reply = make_get_request(target_URL, access_token)
        print("Reply request body:")
        print(reply)
        #write_to_elasticsearch('{"name":"John Doe"}')
        #search_elasticsearch('{"query": {"match": {"message": "login successful"}}}')


main()