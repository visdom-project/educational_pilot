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

  const [ progressData, setProgressData ] = useState([])
  const [ commonData, setCommonData ]  = useState([])
  const [ commonDataToDisplay, setcommonDataToDisplay ] = useState({})
  const [ max, setMax ] = useState(0)

  const [ weeks, setWeeks ] = useState(["1"])
  const [ selectedWeek, setSelectedWeek ] = useState("1")
  const [ weekData, setWeekData ] = useState([])

  const modes = ["points", "exercises", "commits"]
  const [ displayedModes, setdisplayedModes ] = useState(["exercises", "commits"])
  const [ selectedMode, setSelectedMode ] = useState("points")

  const pointDataKeys = {
    studentId: "id",
    maxPts: "maxPts",
    week: "week",
    totalPoints: "totPts",
    missed: "missed",

    cumulativeAvgs: 'cumulativeAvgs',
    cumulativeMidExpected: 'cumulativeMidExpected',
    cumulativeMinExpected: 'cumulativeMinExpected'
  }
  const exerciseDataKeys = {
    studentId: "id",
    maxPts: "maxExer",
    week: "weekExer",
    totalPoints: "totExer",
    missed: "missedExer",
    
    cumulativeAvgs: 'cumulativeAvgsExercises',
    cumulativeMidExpected: 'cumulativeMidExpectedExercises',
    cumulativeMinExpected: 'cumulativeMinExpectedExercises'
  }
  const [ dataKeys, setDataKeys ] = useState(pointDataKeys)
  const commonKeys = { average: 'avg', expectedMinimum: 'min', expectedMedium: 'mid' }

  const showableLines = ["Average", "Expected"]
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const [ selectedStudent, setSelectedStudent ] = useState("")

  const axisNames = {
    "points": ['Students', 'Points'],
    "exercises": ['Students', 'Exercises'],
    "commits": ['Students', 'Commits']
  }
  
  const chartWidth = document.documentElement.clientWidth*0.9
  const chartHeight = document.documentElement.clientHeight*0.5
  
  useEffect(
    () => {
      dataService
        .getData()
        .then(response => {
          const [pData, commons] = response

          // Fetch needed data:
          setProgressData(pData)
          setCommonData(commons)
          setWeeks(pData.map(week => week.week))

          // Set initial UI state:
          handleWeekSwitch(1, pData, commons)
        })
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
    
    const newKeys = (newMode === "points") ? pointDataKeys : exerciseDataKeys
    setDataKeys(newKeys)

    handleWeekSwitch(undefined, undefined, undefined, newKeys)
  }

  const handleWeekSwitch = (newWeek, data, commons, keys) => {
    
    if (newWeek === undefined) { newWeek = selectedWeek }
    if (data === undefined) { data = progressData }
    if (commons === undefined) { commons = commonData }
    if (keys === undefined ) { keys = dataKeys}

    setSelectedWeek(newWeek)

    if (data[newWeek-1] !== undefined) {

      setMax(data[newWeek-1]["data"][0][keys.maxPts])
      
      setWeekData(data[newWeek-1]["data"])

      setcommonDataToDisplay({
        'avg': commons[keys.cumulativeAvgs][newWeek-1],
        'mid': commons[keys.cumulativeMidExpected][newWeek-1],
        'min': commons[keys.cumulativeMinExpected][newWeek-1]
      })
    }
  }

  const handleToggleRefLineVisibilityClick = (targetLine) => {
    
    // Find reference lines:
    const lines = document.querySelectorAll("g.recharts-layer.recharts-reference-line")
    
    // Toggle line visibility:
    lines.forEach(node => {
    
      const textContent = node.firstChild.nextSibling.textContent

      if (targetLine === "Expected" && !textContent.includes("Av")) {
        setShowExpected(!showExpected)
        node.style.display = showExpected ? "none" : ""
      }
      else if (targetLine === "Average" && textContent.includes("Av")) {
        setShowAvg(!showAvg)
        node.style.display = showAvg ? "none" : ""
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
                  handleWeekClick={handleWeekSwitch} weeks={weeks} selectedWeek={selectedWeek} >
        </Controls>
      </div>

      <MultiChart chartWidth={chartWidth} chartHeight={chartHeight}
                  data={weekData} dataKeys={dataKeys}
                  commonData={commonDataToDisplay} commonKeys={commonKeys}
                  axisNames={axisNames[selectedMode]} max={max}
                  handleClick={handleStudentClick}>
      </MultiChart>

      <StudentDetailView student={selectedStudent}></StudentDetailView>
    </>
  )
}
  
export default StatusTab
