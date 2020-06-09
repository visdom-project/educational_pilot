import pycurl
from io import BytesIO
import sys


def make_get_request(url, access_token):

    bytes_obj = BytesIO()
    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.HEADERFUNCTION, display_header)
    curl_obj.setopt(curl_obj.WRITEDATA, bytes_obj)
    curl_obj.setopt(curl_obj.HTTPHEADER, ['Authorization: Token {:s}'.format(access_token)])

    curl_obj.perform()
    
    curl_obj.close()

    get_body = bytes_obj.getvalue()
    print('GET-Output: \n%s' % get_body.decode('utf8'))


def display_header(header_line):
    header_line = header_line.decode('utf8')
    print(header_line)


def get_arguments():
    if len(sys.argv) > 1:
        target_URL = sys.argv[1]
    else:
        print("fetch_data.py: Error: missing argument: target API URL!")
        return False, False

    if len(sys.argv) > 2:
        access_token = sys.argv[2]
    else:
        print("fetch_data.py: Error: missing argument: Access token for target API!")
        return False, False

    return target_URL, access_token


def main():
    target_URL, access_token = get_arguments()

    if target_URL != False:
        make_get_request(target_URL, access_token)


main()