import axios from "axios";
import { SERVER_URL }from "./constants.js";
const baseUrl = `${SERVER_URL}/gitlab-course-30-aggregate-data/_search`

const getHistoryData = () => {
  const request = axios
    .get(baseUrl, { Accept: "application/json", "Content-Type": "application/json" })
    .then((response) => {
      return response.data.hits.hits[0]._source['data_by_weeks']
    })
    .catch(someError => [[], []])

  return request
}

export default { getHistoryData };
