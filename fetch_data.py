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


def search_elasticsearch(index=''):
    header = ['Content-Type: application/json']
    data_type = '_search'
    url = 'http://localhost:9200/{:s}/{:s}?pretty'.format(index, data_type)
    return make_get_request(url, headers=header)


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

    new_modules = []
    for module in json_data:
        if len(module["exercises"]) > 0 or module['id'] in [352, 570]:
            new_modules.append(module)

    return new_modules


from hashlib import blake2b

def write_students(course_students_url, plussa_api_key, course_id, course_instance, page_id):

    student_list_index_key = "plussa-course-{:d}-students-anonymized".format(course_id)

    # 7. Get student list details:
    student_list_reply = fetch_api_to_ES(course_students_url, plussa_api_key, '', 0, write_to_es=False)
    if student_list_reply == False:
        return False
    else:
        if course_instance['instance_name'] == 'summer-2020':   ## Handling GDPR.

            user_ids_of_agreed = get_agreements(plussa_api_key)

            # Fetch point data for each student and write it to the student list:
            for student in student_list_reply['results']:

                if student['student_id'] in user_ids_of_agreed:
                    
                    # Anonymize student data:
                    for key in ['username', 'student_id', 'email', 'full_name']:
                        hasher = blake2b(digest_size=10)
                        hasher.update(student[key].encode())
                        student[key] = hasher.hexdigest()

                    student.pop('tag_slugs', None)

                    # Fetch point data for the student:
                    student_points_reply = fetch_api_to_ES(student['points'], plussa_api_key, '', 0, write_to_es=False)
                    if student_points_reply == False:
                        return False

                    student_points_reply['modules'] = parse_empty_fields(student_points_reply['modules'])

                    # Remove unnecessary fields from points reply:
                    for key in ['username', 'student_id', 'email', 'full_name', 'points_by_difficulty', 'tag_slugs', 'id', 'url', 'is_external', 'tags']:
                        student_points_reply.pop(key, None)

                    student['points'] = student_points_reply
                
                else:
                    # Redact and remove student data:
                    student['username'] = 'redacted_due_to_no_research_permission'
                    for key in ['student_id', 'email', 'full_name', 'data', 'is_external', 'points', 'tag_slugs']:
                        student.pop(key, None)


    # 8. Write course student list with point data into the ES cluster:
    print("Writing course student list with point data into the ES cluster...")
    reply = write_to_elasticsearch(student_list_reply, student_list_index_key, document_id=page_id, json_data=student_list_reply)
    print("Reply: ", reply)

    return student_list_reply["next"]


def get_plussa_data(api_url, api_key, course_id_to_fetch):

    # 2. Get Plussa API root contents:
    plussa_root_reply = fetch_api_to_ES(api_url, api_key, "plussa-root", 0)
    if plussa_root_reply == False:
        return False

    # Get course list api url:
    plussa_courselist_api_url = plussa_root_reply["courses"]

    # 3. Get list of course instances in Plussa:
    plussa_courselist_reply = fetch_api_to_ES(plussa_courselist_api_url, api_key, "plussa-course-list", 0)
    if plussa_courselist_reply == False:
        return False

    # 4. Fetch data for courses:
    for course_instance in plussa_courselist_reply["results"]:

        if course_instance['id'] == course_id_to_fetch:
            print("course instance:", course_instance)
            print()

            # Get course API url and id:
            course_instance_url = course_instance["url"]
            course_id = course_id_to_fetch

            # 5. Get course details from Plussa Course Instance API:
            course_details_reply = fetch_api_to_ES(course_instance_url, api_key, "plussa-course-{:d}".format(course_id), 0)
            if course_details_reply == False:
                return False

            # Get exercise list and student list API urls:
            course_exercises_url = course_details_reply["exercises"]
            
            # 6. Get exercise list details from Plussa API:
            exercise_list_reply = make_get_request(course_exercises_url, api_key, [])
            # Check that no error occured in getting course data and cast reply to json:
            if exercise_list_reply == False:
                return False
            exercise_list_reply = json.loads(exercise_list_reply)

            # Remove extra modules:
            exercise_list_reply['results'] = [module for module in exercise_list_reply['results'] if len(module['exercises']) > 0 or module['id'] in [570]]

            # Write details into ES cluster with given index name:
            write_to_elasticsearch("", index="plussa-course-{:d}-exercises".format(course_id), document_id=0, json_data=exercise_list_reply)

            next_url = course_details_reply["students"]
            page_id = 0
            while isinstance(next_url, str):
                print("next_url is:", next_url)
                next_url = write_students(next_url, api_key, course_id, course_instance, page_id)
                page_id += 1
    

def find_git_url(student, access_token):
    for module in student['points']['modules']:
        if module['max_points'] > 0:
            for exercise in module['exercises']:
                submission_url = exercise['best_submission']
                
                if submission_url is None:
                    continue

                if len(submission_url) > 0:
                    submission_reply = make_get_request(submission_url, access_token, [], "")

                    if submission_reply == False:
                        return False
                    else:
                        submission_reply = json.loads(submission_reply)
                    
                    submission_data = submission_reply['submission_data']
                    if submission_data is not None and len(submission_data) > 0 and len(submission_data[0]) > 1 and submission_data[0][0] == "git":
                        return submission_data[0][1]   # Found a git url
    
    return False


def get_commits_for_file(gitlab_api_url, encoded, full_path, gitlab_api_key):
    encoded_full_path = full_path.replace("/", "%2F").replace(" ", "%20").replace("(", "%28").replace(")", "%29").replace("ä", "%C3%A4").replace("ö", "%C3%B6")
    url = "{:s}/{:s}/repository/files/{:s}/blame?ref=master".format(gitlab_api_url, encoded, encoded_full_path)

    blame_reply = make_get_request(url, gitlab_api_key, ["Private-Token: {:s}".format(gitlab_api_key)], "")

    if blame_reply == False or blame_reply is None or "400 Bad Request" in blame_reply:
        return []
    else:
        blame_reply = json.loads(blame_reply)

    if "error" in blame_reply:
        return []

    commits = []
    commit_ids = []
    if "message" not in blame_reply:

        for commit in blame_reply:

            commit_id = commit['commit']['id'] 
            if commit_id not in commit_ids:
                commit_ids.append(commit_id)
                commits.append(commit['commit'])
    else:
        commits = ["Could not fetch commit data for {:s}".format(url)]

    return commits


def get_module_tree(git_url, gitlab_api_key, gitlab_api_url):
    
    if git_url.startswith("http"):
        ending = ".git" if git_url.endswith(".git") else ""
        repo_name = git_url[len("https://course-gitlab.tuni.fi/"):len(git_url)-len(ending)]
    elif git_url.startswith("git@"):
        repo_name = git_url[len("git@course-gitlab.tuni.fi/"):len(git_url)-len(".git")]

    max_hits = 100
    page = 1

    module_tree = {}

    paths_reply = []
    paths = []
    fetch_next = True
    while fetch_next:

        encoded = repo_name.replace("/", "%2F")
        tree_url = "{:s}/{:s}/repository/tree?ref=master&recursive=true&path=student&per_page={:d}&page={:d}".format(gitlab_api_url, encoded, max_hits, page)
        page += 1

        paths_reply = make_get_request(tree_url, gitlab_api_key, ["Private-Token: {:s}".format(gitlab_api_key)], "")

        if paths_reply == False or "message" in paths_reply:
            print("Could not fetch data for {:s}. Might be due to missing privileges.".format(tree_url))
            return module_tree
        else:
            paths_reply = json.loads(paths_reply)

        # Deduce if there's more data to consider:
        if (len(paths_reply) < max_hits or paths_reply[0]['path'] in paths):
            fetch_next = False
        
        for path in paths_reply:

            full_path = path['path']
            paths.append(full_path)

            if "build" in full_path or "Debug" in full_path or "READ" in full_path:
                continue

            # Week subdirectory name must start with a number:
            if len(full_path.split("/")) > 1 and not full_path.split("/")[1][0].isdigit():
                continue

            name = path['name']

            if name.startswith("."):
                name = name[1:]
                path['name'] = name
            
            split = full_path.split("/")

            if len(split) == 2:
                if name not in module_tree:
                    module_tree[name] = {}
                    
            else:
                folder = split[1]
                
                if len(split) < 4:
                    module_tree[folder][name] = {}

                else:
                    file_name = "/".join(split[3:])
                    #file_name = file_name.replace(".", "DOT")

                    project = split[2]
                    if "." in project:
                        continue

                    # TODO: Speed-optimization; fetch project-wise commit data by using urls of format:
                    # https://course-gitlab.tuni.fi/api/v4/projects/<ProjectID>/-/commits/master/student%2F<FolderName>%2F<ProjectName>
                    module_tree[folder][project][file_name] = get_commits_for_file(gitlab_api_url, encoded, full_path, gitlab_api_key)
                    

    return module_tree


def parse_commits(module_tree):
    new_tree = []
    for module_name in module_tree.keys():
        new_module = {
            'module_name': module_name,
            'projects': []
        }

        for project_name in module_tree[module_name].keys():
            project_data = {
                'name': project_name
            }

            commits = []
            commit_ids = []
            for file_data in module_tree[module_name][project_name]:

                for commit in module_tree[module_name][project_name][file_data]:
                    
                    if isinstance(commit, str):
                        continue

                    if commit['id'] not in commit_ids:
                        commit_ids.append(commit['id'])
                        
                        hasher = blake2b(digest_size=10)
                        hasher.update(commit['committer_email'].encode())
                        
                        commits.append({
                            'hash': commit['id'],
                            'message': commit['message'],
                            'commit_date': commit['committed_date'],
                            'committer_email': hasher.hexdigest()
                        })

            project_data['commit_count'] = len(commits)
            project_data['commit_meta'] = commits

            new_module['projects'].append(project_data)
        
        new_tree.append(new_module)

    return new_tree


def parse_no_commits(module_tree):
    
    new_module_tree = []

    for module in module_tree:

        new_module = {}
        
        new_module['module_name'] = "0{:s}".format(module['name'][0:1]) if '.' in module['name'][0:2] else module['name'][0:2]
        if module['name'] == "01-14":
            new_module['module_name'] = '14'

        projects = []
        for exercise in module['exercises']:
            new_project = {}
            new_project['name'] = exercise['name']
            new_project['commit_count'] = 0
            new_project['commit_meta'] = []
            projects.append(new_project)

        new_module['projects'] = projects
        
        new_module_tree.append(new_module)

    return new_module_tree


def parse_exercise_count(exercise_list):
    passed_exercises = 0
    for exercise in exercise_list:
        if exercise['points'] > 0:
            passed_exercises += 1
    return passed_exercises


from itertools import accumulate

def aggregate_history_data_from_index(index_name):
    # 1. fetch ES data from given index
    # 2. Parse interesting results for each* student:
        # 1) Calculate weekly point counts
        # 2) Calculate course grade
        # 3) Add weekly point sums into weekly point sums of given grade
        # 4) Add +1 to student count of said grade
    # *: If student is not dummy data point
    
    # 1. Fetch student data from given ElasticSearch index:
    url = 'http://localhost:9200/{:s}/_search?pretty&size=20'.format(index_name)
    reply = make_get_request(url, headers=['Content-Type: application/json'])

    if reply != False:
        reply = json.loads(reply)

    student_counts = [0 for x in range(0, 6)]
    data = {}
    for week in ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]:
        weekData = {}
        for key in ["points", "commits", "exercises", "submissions"]:
            weekData[key] = [0 for x in range(0, 6)]
            weekData["cum_{:s}".format(key)] = [0 for x in range(0, 6)]
        data[week] = weekData

    for hits in reply['hits']['hits']:
        for student in hits['_source']['results']:
            if "commits" in student.keys() and (len(student["commits"]) != 15 or student['commits'][0]['projects'][0]['name'] != "1.6.1.1 |fi:Eka palautus|en:First submission|"):
                weekly_points = []
                weekly_commits = []
                weekly_exercises = []
                weekly_submissions = []
                course_grade = -1
                
                # 1) Calculate weekly point counts:
                weekly_points = [module['points'] for module in student['points']['modules']]
                
                # Calculate weekly commit counts:
                for module in student['commits']:
                    commit_count = 0
                    for project in module['projects']:
                        commit_count += project['commit_count']
                    weekly_commits.append(commit_count)

                # TODO: Calculate weekly exercise count
                weekly_exercises = [parse_exercise_count(module['exercises']) for module in student['points']['modules']]
                
                # TODO: Calculate weekly submissions count
                weekly_submissions = [module['submission_count'] for module in student['points']['modules']]

                # Make lists of correct length:
                for count_list in [weekly_points, weekly_commits, weekly_exercises, weekly_submissions]:
                    while len(count_list) < 16:
                        count_list.append(0)

                # Calculate cumulative points, commits, exercises and submissions:
                cumulative_points = list(accumulate(weekly_points))
                cumulative_commits = list(accumulate(weekly_commits))
                cumulative_exercises = list(accumulate(weekly_exercises))
                cumulative_submissions = list(accumulate(weekly_submissions))

                # 2) Calculate approximate course grade:
                for treshold in [0, 401, 425, 575, 680, 785]:
                    course_grade += 0 if cumulative_points[-1] < treshold else 1
                
                # 3) Add +1 to student count of said grade:
                student_counts[course_grade] += 1

                 # 3) Add weekly sums into weekly sums of the given grade:
                for week in data:
                    keys = [('points', weekly_points), ('commits', weekly_commits), ('exercises', weekly_exercises), \
                            ('submissions', weekly_submissions), ('cum_points', cumulative_points), ('cum_commits', cumulative_commits), \
                            ('cum_exercises', cumulative_exercises), ('cum_submissions', cumulative_submissions)]
                    for pair in keys:
                        data[week][pair[0]] += pair[1][int(week)-1]

    avg_point_data = []
    avg_commit_data = []
    avg_exercise_data = []
    avg_submission_data = []
    avg_cum_point_data = []
    avg_cum_commit_data = []
    avg_cum_exercise_data = []
    avg_cum_submission_data = []
    # Calculate averages for each week and grade:
    for week in data.values():

        avg_points = [0 for x in range(0, 6)]
        avg_commits = [0 for x in range(0, 6)]
        avg_exercises = [0 for x in range(0, 6)]
        avg_submissions = [0 for x in range(0, 6)]
        avg_cum_points = [0 for x in range(0, 6)]
        avg_cum_commits = [0 for x in range(0, 6)]
        avg_cum_exercises = [0 for x in range(0, 6)]
        avg_cum_submissions = [0 for x in range(0, 6)]
        
        for i in range(0, 6):
            avg_points[i] = week['points'][i] / student_counts[i]
            avg_commits[i] = week['commits'][i] / student_counts[i]
            avg_exercises[i] = week['exercises'][i] / student_counts[i]
            avg_submissions[i] = week['submissions'][i] / student_counts[i]
            avg_cum_points[i] = week['cum_points'][i] / student_counts[i]
            avg_cum_commits[i] = week['cum_commits'][i] / student_counts[i]
            avg_cum_exercises[i] = week['cum_exercises'][i] / student_counts[i]
            avg_cum_submissions[i] = week['cum_submissions'][i] / student_counts[i]

        avg_point_data.append(avg_points)
        avg_commit_data.append(avg_commits)
        avg_exercise_data.append(avg_exercises)
        avg_submission_data.append(avg_submissions)
        avg_cum_point_data.append(avg_cum_points)
        avg_cum_commit_data.append(avg_cum_commits)
        avg_cum_exercise_data.append(avg_cum_exercises)
        avg_cum_submission_data.append(avg_cum_submissions)
        
    return avg_point_data, avg_commit_data, avg_exercise_data, avg_submission_data, avg_cum_point_data, avg_cum_commit_data, avg_cum_exercise_data, avg_cum_submission_data, student_counts


def fetch_history_data(prev_course_id):

    index_name = "gitlab-course-{:s}-commit-data".format(prev_course_id)
    points, commits, exercises, submissions, cum_points, cum_commits, cum_exercises, cum_submissions, student_counts = aggregate_history_data_from_index(index_name)
    data_by_weeks = {}
    week = 1
    for commit_counts in cum_commits:
        data_by_weeks[week] = {'avg_cum_commits': commit_counts}
        data_by_weeks[week]['avg_cum_points'] = cum_points[week-1]
        data_by_weeks[week]['avg_cum_exercises'] = cum_exercises[week-1]
        data_by_weeks[week]['avg_cum_submissions'] = cum_submissions[week-1]
        data_by_weeks[week]['avg_points'] = points[week-1]
        data_by_weeks[week]['avg_commits'] = commits[week-1]
        data_by_weeks[week]['avg_exercises'] = exercises[week-1]
        data_by_weeks[week]['avg_submissions'] = submissions[week-1]
        data_by_weeks[week]['student_counts'] = student_counts
        week += 1

    data_by_grade = {"0": {}, "1": {}, "2": {}, "3": {}, "4": {}, "5": {}}
    for grade in data_by_grade.keys():
        data_by_grade[grade]['student_count'] = student_counts[int(grade)]
        data_by_grade[grade]['avg_points'] = [x[int(grade)] for x in points]
        data_by_grade[grade]['avg_commits'] = [x[int(grade)] for x in commits]
        data_by_grade[grade]['avg_exercises'] = [x[int(grade)] for x in exercises]
        data_by_grade[grade]['avg_submissions'] = [x[int(grade)] for x in submissions]
        data_by_grade[grade]['avg_cum_points'] = [x[int(grade)] for x in cum_points]
        data_by_grade[grade]['avg_cum_commits'] = [x[int(grade)] for x in cum_commits]
        data_by_grade[grade]['avg_cum_exercises'] = [x[int(grade)] for x in cum_exercises]
        data_by_grade[grade]['avg_cum_submissions'] = [x[int(grade)] for x in cum_submissions]

    final_data = json.dumps({"data_by_weeks": data_by_weeks, "data_by_grades": data_by_grade})
        
    es_index_name = "gitlab-course-{:s}-aggregate-data".format(prev_course_id)
    reply = write_to_elasticsearch(final_data, es_index_name, document_id=0)
    print(reply)


def fetch_anonymized_course_data(course_id, plussa_api_key, plussa_api_url, gitlab_api_key, gitlab_api_url):

    # TODO: Remove excess modules from Plussa data before writing into ES-cluster
    
    # Fetch data from plussa into ElasticSearch cluster:
    get_plussa_data(plussa_api_url, plussa_api_key, course_id)

    index_name = "plussa-course-{:d}-students-anonymized".format(course_id)
    students_reply = search_elasticsearch(index_name)
    
    if students_reply == False:
        return False
    else:
        students_reply = json.loads(students_reply)

    all_commit_data = []

    # Fetch commit data for each student that has given a research permission:
    for hits in students_reply['hits']['hits']:
        for student in hits['_source']['results']:
            if "redacted" not in student['username']:

                git_url = find_git_url(student, plussa_api_key)

                print("Fetching commit data for git repo:", git_url)
                student_module_tree = get_module_tree(git_url, gitlab_api_key, gitlab_api_url)

                student["commits"] = parse_commits(student_module_tree)

                all_commit_data.append(student)

    print("Writing data to ES:")
    index_name = "gitlab-course-{:d}-commit-data-anonymized".format(course_id)
    reply = write_to_elasticsearch(json.dumps({"results": all_commit_data}), index_name, '_doc', 0)
    print(reply)


def main():

    SPRING_COURSE_ID = 30
    SUMMER_COURSE_ID = 40

    # Read access tokens, api names and URLs:
    secrets = read_secrets()

    # Get root api parameters:
    plussa_api_url = secrets["plussa"]["API urls"]["plussa-root"]
    plussa_api_key = secrets["plussa"]["API keys"]["plussa"]
    gitlab_api_url = secrets["gitlab"]["API urls"]["gitlab-projects"]
    gitlab_api_key = secrets["gitlab"]["API keys"]["gitlab"]

    fetch_anonymized_course_data(SUMMER_COURSE_ID, plussa_api_key, plussa_api_url, gitlab_api_key, gitlab_api_url)
    fetch_history_data(SPRING_COURSE_ID)


main()
