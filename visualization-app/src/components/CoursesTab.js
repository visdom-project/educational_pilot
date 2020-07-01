import React, { useState } from 'react'
import CourseList from './CourseList'

const CoursesTab = () => {
  const [courseList, setCourselist] = useState([])
  
  return (
    <>
      <div>Courses tab!</div>
      <CourseList courselist={courseList} setCourselist={setCourselist} title='List of courses'></CourseList>
    </>
  )
}

export default CoursesTab