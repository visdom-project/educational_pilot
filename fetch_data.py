import pycurl
from io import BytesIO


def make_get_request(url):
    bytes_obj = BytesIO()
    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.HEADERFUNCTION, display_header)
    curl_obj.setopt(curl_obj.WRITEDATA, bytes_obj)

    curl_obj.perform()

    curl_obj.close()

    get_body = bytes_obj.getvalue()
    print('GET-Output: \n%s' % get_body.decode('utf8'))


def display_header(header_line):
    header_line = header_line.decode('utf8')
    print(header_line)


def main():
    target_URL = 'https://plus.tuni.fi/api/v2/courses/40/'
    
    make_get_request(target_URL)


main()