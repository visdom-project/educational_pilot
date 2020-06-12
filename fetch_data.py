import pycurl
from urllib.parse import urlencode
from io import BytesIO
import sys
import json


def make_get_request(url, access_token="", headers=[], data=""):

    bytes_obj = BytesIO()
    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    #curl_obj.setopt(curl_obj.HEADERFUNCTION, display_header)   # Print header to stdout
    curl_obj.setopt(curl_obj.WRITEDATA, bytes_obj)

    if len(data) > 1:
        curl_obj.setopt(curl_obj.READDATA, data.encode('utf8'))

    if len(access_token) > 1:
        # Authenticate:
        headers.append("Authorization: Token {:s}".format(access_token))
    
    curl_obj.setopt(curl_obj.HTTPHEADER, headers)

    curl_obj.perform()
    curl_obj.close()

    return bytes_obj.getvalue().decode('utf8')  # Body of the reply


def make_put_request(url, data, header):

    data_buffer = BytesIO(data.encode('utf8'))
    response_buffer = BytesIO()

    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.UPLOAD, 1)
    curl_obj.setopt(curl_obj.READDATA, data_buffer)
    curl_obj.setopt(curl_obj.HTTPHEADER, header)
    curl_obj.setopt(curl_obj.WRITEDATA, response_buffer)

    curl_obj.perform()
    curl_obj.close()

    return response_buffer.getvalue().decode('utf8')


def display_header(header_line):
    header_line = header_line.decode('utf8')
    print(header_line)
    print()


def get_arguments(api_names):
    target_URLs = {}
    access_tokens = {}
    apis = []
    for api_name in api_names:
        apis.append([api_name, '', ''])

    for i in [1, 3]:
        if len(sys.argv) > i:
            target_URLs[apis[i-1]] = sys.argv[i]
        else:
            print("fetch_data.py: Warning: missing argument: target API URL!")
            return False, False

    for i in [2, 4]:
        if len(sys.argv) > i:
            access_tokens[apis[i-2]] = sys.argv[i]
        else:
            print("fetch_data.py: Warning: missing argument: Access token for target API!")
            return False, False

    return target_URLs, access_tokens


def read_secrets():
    print("fetch_data.py: Reading API URL and acces key from the secrets file.")
    secrets = {}
    
    with open("secrets", 'r') as file:

        for row in file:
            row = row.rstrip()
            if row.startswith("#") or row == "":
                continue

            # Example: GITLAB_API_KEY = qwertyuiop1234567
            row_split = row.split()
            key_split = row_split[0].lower().split('_') # ['gitlab', 'api', 'key']
            api_name = key_split[0]                     # 'gitlab'
            key_name = "API {:s}s".format(key_split[2]) # 'API keys'

            if len(key_split) > 3:
                api_name_specifier = key_split[3]
            else:
                api_name_specifier = 'root'

            whole_name = "{:s}".format(api_name)
            if key_name == "API urls":
                whole_name = "{:s}-{:s}".format(api_name, api_name_specifier)

            if len(row_split) == 3:
                if api_name not in secrets.keys():
                    secrets[api_name] = {}

                if key_name in secrets[api_name]:
                    secrets[api_name][key_name][whole_name] = row_split[2]
                else:
                    secrets[api_name][key_name] = {whole_name: row_split[2]}

    if len(secrets) > 1:
        print("fetch_data.py: read some API URL and access key succesfully from secrets!\n")
    else:
        print("fetch_data.py: Error: could not read any API url or access key from secrets!")
    
    return secrets


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


def write_to_elasticsearch(data, index='testindex', data_type='_doc', document_id=get_id()):
    header = ['Content-Type: application/json']

    url = 'http://localhost:9200/{:s}/{:s}/{:s}'.format(index, data_type, document_id)

    # curl -XPUT 'http://localhost:9200/testindex/_doc/1' -H 'Content-Type: application/json' -d '{"name":"John Doe"}'
    return make_put_request(url, data, header)


def search_elasticsearch(query, index=''):
    header = ['Content-Type: application/json']
    data_type = '_search'
    url = 'http://localhost:9200/{:s}/{:s}?pretty'.format(index, data_type)
    make_get_request(url, headers=header)


def copy_api_point_to_index(url, access_token, api_name):
    reply_body = make_get_request(url, access_token, [])
    reply_body_json = json.loads(reply_body)
    
    if "error" in reply_body_json:
        print("error occured in get request from url: {:s}".format(url))
        print("Reply body:", reply_body)
        return False
    
    if isinstance(reply_body_json, list):
        for item in reply_body_json:

            id = get_id()
            if "id" in item.keys():
                id = str(item['id'])

            reply_body = write_to_elasticsearch(json.dumps(item), api_name, '_doc', id)
            reply_body_json = json.loads(reply_body)

            if "error" in reply_body_json.keys():
                print("Error reply from Elastic:\n", reply_body)
                return False
            else:
                print("Wrote successfully to ElasticSearch.")
    else:
        reply_body = write_to_elasticsearch(reply_body, api_name, '_doc', get_id())
        reply_body_json = json.loads(reply_body)

        if "error" in reply_body_json.keys():
            print("Error reply from Elastic:\n", reply_body)
            return False
    

def main():

    # Read access tokens, api names and URLs:
    secrets = read_secrets()
    print(secrets)
    
    # Copy data from APIs to ElasticSearch cluster:
    for api_name in secrets.keys():

        api_details = secrets[api_name]

        if 'API keys' in api_details:
            access_token = api_details['API keys'][api_name]
        else:
            access_token = ""
        
        if 'API urls' in api_details:
            for api_name in api_details['API urls'].keys():
                url = api_details['API urls'][api_name]
                copy_api_point_to_index(url, access_token, api_name)

    #search_elasticsearch('{"query": {"match": {"message": "login successful"}}}')


main()