import React, { useState } from 'react'
import CourseList from './CourseList'

const StatusTab = () => {

  const [courseList, setCourselist] = useState([])

  return (
    <>
      <CourseList courselist={courseList} setCourselist={setCourselist} title='List of courses'></CourseList>
    </>
  )
}

export default StatusTab
