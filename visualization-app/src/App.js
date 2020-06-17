import React, { useState, useEffect } from 'react';
import './App.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';


const SubHeader = ({title}) => 
  <header className="App-subheader">{title}</header>


const LineChartVisu = ({data, title}) => {
  return (
    <>
      <SubHeader title={title} />
      <div className="intended">
        <LineChart width={400} height={400} data={data}>
          <Line class="basic-line" type="monotone" dataKey="uv" />
          <CartesianGrid class="basic-grid" />
          <XAxis dataKey="name" />
          <YAxis />
        </LineChart>
      </div>
    </>
  )
}


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
          <SubHeader title={'List of courses'}/>
          <div className="intended">
            <ul>{courselist}</ul>
          </div>
        </>
    );
}


function App() {

  const [courselist, setCourselist] = useState([])

  const defaultdata = [{name: '1', uv: 0, pv: 0, amt: 0},
                {name: '2', uv: 200, pv: 0, amt: 0},
                {name: '3', uv: 300, pv: 0, amt: 0},
                {name: '4', uv: 500, pv: 0, amt: 0}]

  return (
    <div className="App">
      <header className="App-header">
        Visu-App
      </header>
      <LineChartVisu data={defaultdata} title={'Test figure'}/>
      <CourseList courselist={courselist} setCourselist={setCourselist}></CourseList>
    </div>
  );
}

export default App;
