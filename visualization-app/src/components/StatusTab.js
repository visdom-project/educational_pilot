import React, { useState } from 'react'
import CourseList from './CourseList'
import LineChartVisu from './LineChartVisu'

const StatusTab = () => {

  const [courseList, setCourselist] = useState([])

  const defaultdata = [
    {name: '1', uv: 0, pv: 0, amt: 0},
    {name: '2', uv: 200, pv: 0, amt: 0},
    {name: '3', uv: 300, pv: 0, amt: 0},
    {name: '4', uv: 500, pv: 0, amt: 0}
  ]

  return (
    <>
      <LineChartVisu data={defaultdata} title={'Test figure'}/>
      <CourseList courselist={courseList} setCourselist={setCourselist}></CourseList>
    </>
  )
}

export default StatusTab