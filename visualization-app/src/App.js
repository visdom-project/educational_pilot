import React, { useState, useEffect } from 'react';
import './App.css';

import CourseList from './components/CourseList'
import LineChartVisu from './components/LineChartVisu'

function App() {

  const [courselist, setCourselist] = useState([])

  const defaultdata = [{name: '1', uv: 0, pv: 0, amt: 0},
                {name: '2', uv: 200, pv: 0, amt: 0},
                {name: '3', uv: 300, pv: 0, amt: 0},
                {name: '4', uv: 500, pv: 0, amt: 0}]

  return (
    <div className="App">
      <header className="App-header">Visu-App</header>
      <LineChartVisu data={defaultdata} title={'Test figure'}/>
      <CourseList courselist={courselist} setCourselist={setCourselist}></CourseList>
    </div>
  );
}

export default App;
