import React, { useState, useEffect } from 'react'
import dataService from '../services/statusData'
import MultiChart from './StatusChart'
import DropdownMenu from './DropdownMenu'
import CheckBoxMenu from './CheckBoxMenu'

const Controls = (props) => {
  const {handleModeClick, modes, selectedMode, showableLines,
          handleToggleRefLineVisibilityClick, showAvg, showExpected,
          handleWeekClick, weeks, selectedWeek} = props
  return (
    <div className="fit-row">
      <CheckBoxMenu options={showableLines}
                    handleClick={handleToggleRefLineVisibilityClick}
                    showAvg={showAvg}
                    showExpected={showExpected}/>
      <DropdownMenu handleClick={handleModeClick}
                    options={modes}
                    selectedOption={selectedMode}
                    title={'Visualization mode:'}/>
      <DropdownMenu handleClick={handleWeekClick}
                    options={weeks}
                    selectedOption={selectedWeek}
                    title={'Visualize week:'}/>
      <button id={"showGradesButton"} onClick={() => console.log("TODO: Show grades")}>Show grades</button>
    </div>
  )
}

const StudentDetailView = ({student}) => {
  
  if (student === "") {
    return (
      <div style={{marginBottom: document.documentElement.clientHeight*0.1}}>
        <h2>{'Student Details'}</h2>
        <div className="intended">Click a student to view details.</div>
      </div>
    )
  }

  return (
    <div style={{marginBottom: document.documentElement.clientHeight*0.1}}>
      <h2>{'Student Details'}</h2>
      <div className="intended">Student: {student}</div>
    </div>
  )
}

const StatusTab = () => {

  const [ progressData, setProgressData ] = useState([{"1": 0}])
  const [ max, setMax ] = useState(0)

  const [ weeks, setWeeks ] = useState([])
  const [ selectedWeek, setSelectedWeek ] = useState("1")

  const [ modes, setModes ] = useState([])
  const [ displayedModes, setdisplayedModes ] = useState([])
  const [ selectedMode, setSelectedMode ] = useState("")

  const [ showableLines, setShowableLines ] = useState([])
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const [ selectedStudent, setSelectedStudent ] = useState("")

  const axisNames = ['Students', 'Points']
  const dataKeys = {
    studentId: "id",
    maxPoints: "maxPts",
    week: "week",
    totalPoints: "totPts",
    missed: "missed",
    average: 'avg',
    expectedMinimum: 'min',
    expectedMedium: 'mid'
  }
  const chartWidth = document.documentElement.clientWidth*0.9
  const chartHeight = document.documentElement.clientHeight*0.5
  
  useEffect(
    () => {
      const pData = dataService.getProgressData()
      setProgressData(pData)
      console.log(pData);

      const weeks = dataService.getWeeks()
      const selected = weeks[weeks.length-1]

      setWeeks(weeks)
      setSelectedWeek(selected)

      setMax(pData[selected-1]["data"][0].maxPts)

      setModes(["points", "exercises", "commits"])
      setSelectedMode("points")
      setdisplayedModes(["exercises", "commits"])
      
      setShowableLines(["Average", "Expected"])
    }, []
  )

  const handleStudentClick = (data, index) => {
    
    if (data !== undefined) {
      const newSelected = data.id
      setSelectedStudent(newSelected)
      console.log("Selected student:", newSelected);
    }
  }

  const handleModeSwitchClick = (newMode) => {
    setSelectedMode(newMode)
    setdisplayedModes(modes.filter(name => name !== newMode))
  }

  const handleWeekSwitchClick = (newWeek) => {
    setSelectedWeek(newWeek)
    setMax(progressData[newWeek-1]["data"][0].maxPts)
  }

  const handleToggleRefLineVisibilityClick = (targetLine) => {
    
    const lines = document.querySelectorAll("g.recharts-layer.recharts-line>path.recharts-curve.recharts-line-curve")
    
    lines.forEach(node => {

      const textContent = node.nextSibling.firstChild.textContent

      // Toggle line visibility:
      if (targetLine === "Expected" && textContent.includes("Expected")) {
        setShowExpected(!showExpected)
        node.parentNode.style.display = showExpected ? "none" : ""
      }
      else if (targetLine === "Average" && textContent === "Average") {
        setShowAvg(!showAvg)
        node.parentNode.style.display = showAvg ? "none" : ""
      }
    })
  }

  return (
    <>
      <div className="fit-row">
        <h2>{'Current Student Statuses'}</h2>
        <Controls handleModeClick={handleModeSwitchClick}
                  modes={displayedModes} selectedMode={selectedMode}
                  showableLines={showableLines}
                  handleToggleRefLineVisibilityClick={handleToggleRefLineVisibilityClick}
                  showAvg={showAvg} showExpected={showExpected}
                  handleWeekClick={handleWeekSwitchClick} weeks={weeks} selectedWeek={selectedWeek} >
        </Controls>
      </div>

      <MultiChart chartWidth={chartWidth} chartHeight={chartHeight}
                  data={progressData[selectedWeek-1]["data"]} dataKeys={dataKeys}
                  axisNames={axisNames} max={max}
                  handleClick={handleStudentClick}>
      </MultiChart>

      <StudentDetailView student={selectedStudent}></StudentDetailView>
    </>
  )
}
  
export default StatusTab
