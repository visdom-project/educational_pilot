import React, { useState, useEffect } from "react"
import { ComposedChart, XAxis, YAxis, CartesianGrid, Area, Bar, Cell, ReferenceLine } from "recharts";
import axios from "axios"
import DropdownMenu from "./DropdownMenu"

const Controls = (props) => {
  const { handleModeSwitch, modes, selectedMode,
          handleWeekSwitch, weeks, selectedWeek } = props
  
  return (
    <div className="fit-row">
      <DropdownMenu handleClick={handleModeSwitch}
                    options={modes}
                    selectedOption={selectedMode}
                    title={"Visualization mode:"}/>
      <DropdownMenu handleClick={handleWeekSwitch}
                    options={weeks}
                    selectedOption={selectedWeek}
                    title={"Visualize week:"}/>
      <button id={"showGradesButton"} onClick={() => console.error("TODO: Show grades")}>Show grades</button>
    </div>
  );
}

const StudentStatusChart = ({ handleModeSwitch, modes, selectedMode, selectedStudentID }) => {

  const [ studentData, setStudentData ] = useState([])
  
  const [ weeks, setWeeks ] = useState([])
  const [ selectedWeek, setSelectedWeek ] = useState(1)

  useEffect(
    () => {
      axios
      .get( "http://localhost:9200/gitlab-course-40-commit-data-anonymized/_search",
            {Accept: "application/json", "Content-Type": "application/json"} )
      .then((response) => {

        const results = []

        // Map student data into weeks:
        response.data.hits.hits.forEach(hit => {
          hit._source.results.forEach(student => {
            if (!student.username.includes("redacted")) {

              results.push(student)

            }
          })
        })
        console.log(results)
        // TODO: Remove hard coding:
        const availableWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
        setWeeks(availableWeeks)

        setStudentData(results)
      })
  }, []
  )

  const handleWeekSwitch = (newWeek) => {
    setSelectedWeek(newWeek)
  }

  return (
    <div className="intended" style={{display: "flex", flexDirection:"column"}}>
      <Controls handleModeSwitch={handleModeSwitch} modes={modes} selectedMode={selectedMode}
                handleWeekSwitch={handleWeekSwitch} weeks={weeks} selectedWeek={selectedWeek} />

      <ComposedChart width={1600} height={500} data={studentData}>
        
        <XAxis dataKey="id" />
        <YAxis />

        <Bar key="" dataKey="" />

        <CartesianGrid stroke="#808e9625" vertical={false} />

        <ReferenceLine y={10} />

      </ComposedChart>
    </div>
  );
}

export default StudentStatusChart
