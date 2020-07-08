import pycurl
from urllib.parse import urlencode
from io import BytesIO
import sys
import json


def make_get_request(url, access_token="", headers=[], data=""):

    bytes_obj = BytesIO()
    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.WRITEDATA, bytes_obj)

    if len(data) > 1:
        curl_obj.setopt(curl_obj.READDATA, data.encode('utf8'))

    if len(access_token) > 1:
        # Authenticate:
        headers.append("Authorization: Token {:s}".format(access_token))
    
    curl_obj.setopt(curl_obj.HTTPHEADER, headers)

    try:
        curl_obj.perform()
    except pycurl.error as e:
        print(e)
        return {"Request failed."}
    
    curl_obj.close()

    return bytes_obj.getvalue().decode('utf8')  # Body of the reply


def make_put_request(url, data, header, json_data=""):

    response_buffer = BytesIO()

    curl_obj = pycurl.Curl()

    curl_obj.setopt(curl_obj.URL, url)
    curl_obj.setopt(curl_obj.UPLOAD, 1)

    if json_data == "":
        data_buffer = BytesIO(data.encode('utf8'))
    else:
        data_buffer = BytesIO(json.dumps(json_data).encode('utf-8'))
    
    curl_obj.setopt(curl_obj.READDATA, data_buffer)        
    curl_obj.setopt(curl_obj.HTTPHEADER, header)
    curl_obj.setopt(curl_obj.WRITEDATA, response_buffer)

    curl_obj.perform()
    curl_obj.close()

    return response_buffer.getvalue().decode('utf8')


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
        print("fetch_data.py: Did not read any API url or access key from secrets!")
    
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


def write_to_elasticsearch(data, index='testindex', data_type='_doc', document_id=get_id(), json_data=""):
    header = ['Content-Type: application/json']

    url = 'http://localhost:9200/{:s}/{:s}/{:d}'.format(index, data_type, document_id)

    # curl -XPUT 'http://localhost:9200/testindex/_doc/1' -H 'Content-Type: application/json' -d '{"name":"John Doe"}'
    return make_put_request(url, data, header, json_data=json_data)


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


def fetch_api_to_ES(url, api_key, index_name, data_id, write_to_es=True):
    
    # Get data from api
    reply = make_get_request(url, api_key, [])

    # Check that no error occured in getting course data and cast reply to json:
    if reply == False:
        print("error occured in get request from plussa API!")
        print("Reply body:", reply)
        return False
    else:
        print("Got requested data from API: {:s}".format(url))

    # Write details into ES cluster with given index name:
    if write_to_es:
        print("Writing data to ElasticSearch... ", end="")
        write_to_elasticsearch(reply, index=index_name, document_id=data_id)
        print("Done.")
    
    return json.loads(reply)


def get_agreements(api_key):
    agreement_url = "https://plus.tuni.fi/api/v2/courses/40/submissiondata/?exercise_id=4543&format=json"
    agreements = fetch_api_to_ES(agreement_url, api_key, "", 0, write_to_es=False)

    list_of_agreed = []
    for submission in agreements:
        if submission["field_0"] == "a":
            list_of_agreed.append(submission["StudentID"])

    return list_of_agreed


def parse_empty_fields(json_data):
    for module in json_data:
        
        old = module["points_by_difficulty"]
        new_dict = {}

        for key in old:
            value = old[key]

            if key != "":
                new_dict[key] = value
            else:
                new_dict["empty"] = value

        module["points_by_difficulty"] = new_dict

    return json_data


def write_students(course_students_url, plussa_api_key, course_id, course_instance, page_id):

    student_list_index_key = "plussa-course-{:d}-students".format(course_id)

    # 7. Get student list details:
    student_list_reply = fetch_api_to_ES(course_students_url, plussa_api_key, "", 0, write_to_es=False)
    if student_list_reply == False:
        return False

    if course_instance["instance_name"] == "summer-2020":   ## Handling GDPR.
        user_ids_of_agreed = get_agreements(plussa_api_key)

        # Fetch point data for each student and write it to the student list:
        for student in student_list_reply["results"]:

            if student["student_id"] in user_ids_of_agreed:

                # Fetch point data:
                student_points_reply = fetch_api_to_ES(student["points"], plussa_api_key, "", 0, write_to_es=False)
                if student_points_reply == False:
                    return False

                print("Remove some data: field: points_by_difficulty")
                student_points_reply["points_by_difficulty"] = {}
                student_points_reply["modules"] = parse_empty_fields(student_points_reply["modules"])

                # Append point data to student info:
                student["points"] = student_points_reply
            
            else:
                # Redact student data:
                for key in ["url", "username", "student_id", "email", "data"]:
                    student[key] = "redacted_due_to_no_research_permission"
                student["is_external"] = False
                student["points"] = {}
    else:
        print("Can't save student data before implementing anonymization!")
        student_list_reply["results"] = ["Redacted data"]
        
        # TODO: Anonymize student data
        # Fetch point data for each student and write it to the student list:
        #for student in student_list_reply["results"]:

            # Fetch point data:
            #student_points_reply = fetch_api_to_ES(student["points"], plussa_api_key, "", False)
            #if student_points_reply == False:
            #    return False

            # Append point data to student info:
            #student["point_data"] = student_points_reply

    # 8. Write course student list with point data into the ES cluster:
    print("Writing course student list with point data into the ES cluster...")
    reply = write_to_elasticsearch(student_list_reply, student_list_index_key, document_id=page_id, json_data=student_list_reply)
    print("Reply: ", reply)

    return student_list_reply["next"]


def main():

    # Read access tokens, api names and URLs:
    secrets = read_secrets()
    #print(secrets)

    # 1. Get root api parameters:
    plussa_api_url = secrets["plussa"]["API urls"]["plussa-root"]
    plussa_api_key = secrets["plussa"]["API keys"]["plussa"]

    # 2. Get Plussa API root contents:
    plussa_root_reply = fetch_api_to_ES(plussa_api_url, plussa_api_key, "plussa-root", 0)
    if plussa_root_reply == False:
        return False

    # Get course list api url:
    plussa_courselist_api_url = plussa_root_reply["courses"]

    # 3. Get list of course instances in Plussa:
    plussa_courselist_reply = fetch_api_to_ES(plussa_courselist_api_url, plussa_api_key, "plussa-course-list", 0)
    if plussa_courselist_reply == False:
        return False

    # 4. Fetch data for courses:
    for course_instance in plussa_courselist_reply["results"]:

        # Only parse instances of the course: "Programming 2: Basics"
        if "Ohjelmointi 2:" in course_instance["name"]:

            # Get course API url and id:
            course_instance_url = course_instance["url"]
            course_id = course_instance["id"]

            # 5. Get course details from Plussa Course Instance API:
            course_details_reply = fetch_api_to_ES(course_instance_url, plussa_api_key, "plussa-course-{:d}".format(course_id), 0)
            if course_details_reply == False:
                return False

            # Get exercise list and student list API urls:
            course_exercises_url = course_details_reply["exercises"]
            
            # 6. Get exercise list details from Plussa API:
            exercise_list_reply = fetch_api_to_ES(course_exercises_url, plussa_api_key, "plussa-course-{:d}-exercises".format(course_id), 0)
            if exercise_list_reply == False:
                return False

            next_url = course_details_reply["students"]
            page_id = 0
            while isinstance(next_url, str):
                print("next_url is:", next_url)
                next_url = write_students(next_url, plussa_api_key, course_id, course_instance, page_id)
                page_id += 1


main()