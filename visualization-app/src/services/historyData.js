import axios from 'axios'

const baseUrl = 'http://localhost:9200/gitlab-course-30-aggregate-data/_search'

const getHistoryData = () => {

  const request = axios
    .get(baseUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {
      response.data.hits.hits[0]._source['data_by_weeks']["0"]
        = { avg_cum_commits: [0,0,0,0,0,0],
            avg_cum_points: [0,0,0,0,0,0],
            student_counts: [0,0,0,0,0,0] }
      return response.data.hits.hits[0]._source['data_by_weeks']
    })
    .catch(someError => [[], []])

  return request
}

export default { getHistoryData };
