import React, { useEffect } from 'react';

const CourseList = ({courselist, setCourselist}) => {

    useEffect(() => {

      const parseResponseData = (responseData) => {
        const array = responseData['hits'][0]['_source']['results']
        // Contains fields: id, url, html_url, code, name, instance_name
        const courses = array.map((item) => (
          <li key={item.id}>{item.name}, {item.instance_name}</li>
        ))

        setCourselist(courses)
      }

      fetch('http://localhost:9200/plussa-course-list/_search',
            { method: 'GET',
              headers:
              { Accept: 'application/json',
                'Content-Type': 'application/json'
            }})
          .then(response => response.json())
          .then(data => parseResponseData(data.hits));

    }, [setCourselist]);

    return (
        <>
            <header className="App-subheader">List of courses</header>
            <div>
                <ul className="intended">{courselist}</ul>
            </div>
        </>
    )
}

export default CourseList
