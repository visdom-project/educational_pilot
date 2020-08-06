import React, { useState, useEffect } from 'react'
import StudentStatusChart from './studentStatusChart'
import StudentProgressChart from './studentProgressChart'
import StudentDetailView from './StudentDetailView'

const StudentTab = () => {

  const [ selectedStudentID, setSelectedStudentID ] = useState('tut.fi:245759')
  
  const modes = ["points", "exercises", "submissions", "commits"]
  const [ selectedMode, setSelectedMode ] = useState(modes[0])

  // TODO: Remove hard coding:
  const [ weeks, setWeeks ] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  const [ selectedWeek, setSelectedWeek ] = useState(1)

  const handleModeSwitch = (newMode) => {
    setSelectedMode(newMode)
  }

  const handleWeekSwitch = (newWeek) => {
    setSelectedWeek(newWeek)
  }

  return (
    <>
      <h2>{'Weekly course status'}</h2>
      <StudentStatusChart handleModeSwitch={handleModeSwitch} modes={modes} selectedMode={selectedMode}
                          handleWeekSwitch={handleWeekSwitch} weeks={weeks} selectedWeek={selectedWeek}
                          selectedStudentID={selectedStudentID}/>

      <h2>{'Progress over the course'}</h2>
      <StudentProgressChart selectedStudentID={selectedStudentID}/>

      <StudentDetailView selectedStudentID={selectedStudentID} />
    </>
  )
}

export default StudentTab
