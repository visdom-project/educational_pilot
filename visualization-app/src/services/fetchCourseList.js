import axios from "axios";
import { SERVER_URL } from "./constants";
import { parseCourseListData } from "./helpers";
const baseUrl = `${SERVER_URL}/plussa-course-list/_search`;

export const fetchCourseList = async () => {
    const response = await axios.get(baseUrl,
        { Accept: "application/json",
         "Content-Type": "apllication/json"});
    return parseCourseListData(response.json().hits);
}
