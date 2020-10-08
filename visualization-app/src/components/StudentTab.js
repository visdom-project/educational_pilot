import React, { useState, useEffect } from "react"
import StudentStatusChart from "./studentStatusChart"
import StudentProgressChart from "./studentProgressChart"
import StudentDetailView from "./StudentDetailView"

const StudentTab = () => {
  const [ selectedStudentID, setSelectedStudentID ] = useState("tut.fi:245759")
  
  const modes = ["points", "exercises", "submissions", "commits"]
  const [ selectedMode, setSelectedMode ] = useState(modes[0])

  const handleModeSwitch = (newMode) => setSelectedMode(newMode)

  return (
    <>
      <h2>{"Weekly course status"}</h2>
      <StudentStatusChart handleModeSwitch={handleModeSwitch} modes={modes} selectedMode={selectedMode}
                          selectedStudentID={selectedStudentID}/>

      <h2>{"Progress over the course"}</h2>
      <StudentProgressChart selectedStudentID={selectedStudentID}/>

      <StudentDetailView selectedStudentID={selectedStudentID} />
    </>
  );
}

export default StudentTab
